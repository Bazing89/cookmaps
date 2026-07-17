import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BUNNY_STREAM_BASE = "https://video.bunnycdn.com";

type StorageListItem = {
  id: string | null;
  name: string;
};

async function listAllStoragePaths(
  admin: ReturnType<typeof createClient>,
  bucket: string,
  prefix: string,
): Promise<string[]> {
  const { data: items, error } = await admin.storage.from(bucket).list(prefix);
  if (error || !items?.length) return [];

  const paths: string[] = [];

  for (const item of items as StorageListItem[]) {
    const path = prefix ? `${prefix}/${item.name}` : item.name;
    if (item.id === null) {
      paths.push(...(await listAllStoragePaths(admin, bucket, path)));
    } else {
      paths.push(path);
    }
  }

  return paths;
}

async function removeStoragePrefix(
  admin: ReturnType<typeof createClient>,
  bucket: string,
  prefix: string,
): Promise<void> {
  const paths = await listAllStoragePaths(admin, bucket, prefix);
  if (!paths.length) return;

  const { error } = await admin.storage.from(bucket).remove(paths);
  if (error) {
    console.warn(`[delete-account] ${bucket} cleanup failed:`, error.message);
  }
}

async function deleteBunnyVideo(videoId: string): Promise<void> {
  const apiKey = Deno.env.get("BUNNY_STREAM_API_KEY") ?? "";
  const libraryId = Deno.env.get("BUNNY_STREAM_LIBRARY_ID") ?? "";
  if (!apiKey || !libraryId) return;

  const res = await fetch(`${BUNNY_STREAM_BASE}/library/${libraryId}/videos/${videoId}`, {
    method: "DELETE",
    headers: {
      AccessKey: apiKey,
      Accept: "application/json",
    },
  });

  if (!res.ok && res.status !== 404) {
    const body = await res.text();
    console.warn(`[delete-account] Bunny delete failed (${res.status}):`, body);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    const supabaseUser = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabaseUser.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);
    const userId = user.id;

    const { data: posts } = await admin
      .from("creator_posts")
      .select("bunny_video_id")
      .eq("creator_id", userId);

    const bunnyIds = (posts ?? [])
      .map((post) => post.bunny_video_id)
      .filter((id): id is string => Boolean(id));

    await Promise.all(bunnyIds.map((id) => deleteBunnyVideo(id)));

    await Promise.all([
      removeStoragePrefix(admin, "avatars", userId),
      removeStoragePrefix(admin, "creator-videos", userId),
      removeStoragePrefix(admin, "plate-images", userId),
    ]);

    const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
    if (deleteError) {
      return new Response(JSON.stringify({ error: deleteError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Account deletion failed";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
