#!/usr/bin/env node
/**
 * Seed CookMapz showcase profile with plates + shorts from scripts/downloads/.
 *
 * Usage:
 *   node scripts/seed_demo_content.mjs
 *
 * Optional env (defaults shown):
 *   COOKMAPZ_DEMO_EMAIL=cookmapz.showcase@gmail.com
 *   COOKMAPZ_DEMO_PASSWORD=CookMapz2026!Showcase
 *   SUPABASE_SERVICE_ROLE_KEY=...  (recommended — skips email confirmation)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DOWNLOADS_DIR = path.join(__dirname, 'downloads');

const DEMO_EMAIL = process.env.COOKMAPZ_DEMO_EMAIL ?? 'cookmapz.showcase@gmail.com';
const DEMO_PASSWORD = process.env.COOKMAPZ_DEMO_PASSWORD ?? 'CookMapz2026!Showcase';

function loadEnvFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

const env = loadEnvFile(path.join(ROOT, '.env'));
const supabaseUrl = env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const bunnyApiKey = env.EXPO_PUBLIC_BUNNY_STREAM_API_KEY;
const bunnyLibraryId = env.EXPO_PUBLIC_BUNNY_STREAM_LIBRARY_ID;
let bunnyCdnHostname = env.EXPO_PUBLIC_BUNNY_STREAM_CDN_HOSTNAME ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}
if (!bunnyApiKey || !bunnyLibraryId) {
  console.error('Missing Bunny Stream credentials in .env');
  process.exit(1);
}

const BUNNY_STREAM_BASE = 'https://video.bunnycdn.com';

const SEED_ITEMS = [
  {
    tiktokId: '7040965098013347078',
    title: 'Miso Ramen from Scratch',
    description: 'Rich miso broth, springy noodles, and all the toppings — better than instant every time.',
    cuisine: 'Japanese',
    pickupNeighborhood: 'Japantown',
    tags: ['ramen', 'miso', 'noodles'],
    plate: {
      name: 'Miso Ramen Bowl',
      ingredients: 'Fresh noodles, miso broth, chashu, soft egg, nori, scallions',
      description: 'A steaming bowl of house-made miso ramen with all the classic toppings.',
      price: 14,
      imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=800&fit=crop',
    },
  },
  {
    tiktokId: '7009818416089500934',
    title: 'Protein Power Bowl',
    description: 'High-protein meal prep with serious flavor — chef-level skills at home.',
    cuisine: 'American',
    pickupNeighborhood: 'SOMA',
    tags: ['mealprep', 'protein', 'healthy'],
    plate: {
      name: 'Chef Power Bowl',
      ingredients: 'Grilled chicken, quinoa, roasted veggies, avocado, herb sauce',
      description: 'A balanced power bowl packed with protein and fresh vegetables.',
      price: 16,
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=800&fit=crop',
    },
  },
  {
    tiktokId: '7332241957529455914',
    title: 'Perfect Grilled Steak',
    description: 'Charred crust, juicy center — the art of grilling steak done right.',
    cuisine: 'BBQ',
    pickupNeighborhood: 'Mission District',
    tags: ['steak', 'grilling', 'bbq'],
    plate: {
      name: 'Grilled Ribeye Plate',
      ingredients: 'USDA ribeye, compound butter, grilled asparagus, garlic mash',
      description: 'A perfectly seared ribeye with classic steakhouse sides.',
      price: 22,
      imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&h=800&fit=crop',
    },
  },
];

function findVideoFile(tiktokId) {
  const files = fs.readdirSync(DOWNLOADS_DIR).filter((f) => f.endsWith('.mp4'));
  const match = files.find((f) => f.includes(`[${tiktokId}]`));
  if (!match) throw new Error(`No video found for TikTok id ${tiktokId} in ${DOWNLOADS_DIR}`);
  return path.join(DOWNLOADS_DIR, match);
}

async function ensureBunnyCdnHostname() {
  if (bunnyCdnHostname) return bunnyCdnHostname;
  const res = await fetch(`${BUNNY_STREAM_BASE}/library/${bunnyLibraryId}`, {
    headers: { AccessKey: bunnyApiKey, Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Bunny library fetch failed: ${res.status}`);
  const library = await res.json();
  bunnyCdnHostname =
    library.CdnHostname ?? library.cdnHostname ?? library.Hostname ?? library.hostname ?? '';
  if (bunnyCdnHostname) bunnyCdnHostname = bunnyCdnHostname.replace(/^https?:\/\//, '');
  return bunnyCdnHostname;
}

function bunnyThumbnailUrl(videoId) {
  return bunnyCdnHostname ? `https://${bunnyCdnHostname}/${videoId}/thumbnail.jpg` : null;
}

async function uploadShortToBunny({ title, description, filePath, metaTags }) {
  const createRes = await fetch(`${BUNNY_STREAM_BASE}/library/${bunnyLibraryId}/videos`, {
    method: 'POST',
    headers: {
      AccessKey: bunnyApiKey,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  });
  if (!createRes.ok) {
    throw new Error(`Bunny create failed (${createRes.status}): ${await createRes.text()}`);
  }
  const created = await createRes.json();
  const videoId = created.guid;
  const uploadUrl = `${BUNNY_STREAM_BASE}/library/${bunnyLibraryId}/videos/${videoId}`;
  const fileBuffer = fs.readFileSync(filePath);

  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      AccessKey: bunnyApiKey,
      Accept: 'application/json',
      'Content-Type': 'application/octet-stream',
    },
    body: fileBuffer,
  });
  if (!uploadRes.ok) {
    throw new Error(`Bunny upload failed (${uploadRes.status}): ${await uploadRes.text()}`);
  }

  await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      AccessKey: bunnyApiKey,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, description: description ?? '', metaTags: metaTags ?? [] }),
  });

  return {
    videoId,
    thumbnailUrl: created.thumbnailUrl ?? bunnyThumbnailUrl(videoId),
  };
}

async function downloadImage(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Image download failed (${res.status}): ${url}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get('content-type') ?? 'image/jpeg';
  return { buffer, contentType };
}

async function ensureDemoUser(supabase, admin) {
  if (admin) {
    const { data: listed, error: listError } = await admin.auth.admin.listUsers();
    if (listError) throw new Error(`Admin list users failed: ${listError.message}`);

    const existing = listed.users.find(
      (u) => u.email?.toLowerCase() === DEMO_EMAIL.toLowerCase(),
    );

    if (existing) {
      if (!existing.email_confirmed_at) {
        const { error: confirmError } = await admin.auth.admin.updateUserById(existing.id, {
          email_confirm: true,
        });
        if (confirmError) throw new Error(`Confirm user failed: ${confirmError.message}`);
      }
      console.log(`Using existing demo user: ${DEMO_EMAIL}`);
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      });
      if (signInError || !signInData.user) {
        const { error: resetError } = await admin.auth.admin.updateUserById(existing.id, {
          password: DEMO_PASSWORD,
          email_confirm: true,
        });
        if (resetError) throw new Error(`Reset password failed: ${resetError.message}`);
        const retry = await supabase.auth.signInWithPassword({
          email: DEMO_EMAIL,
          password: DEMO_PASSWORD,
        });
        if (retry.error || !retry.data.user) {
          throw new Error(`Sign in failed after password reset: ${retry.error?.message ?? 'unknown'}`);
        }
        return retry.data.user;
      }
      return signInData.user;
    }

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { display_name: 'CookMapz' },
    });
    if (createError) throw new Error(`Admin create user failed: ${createError.message}`);
    if (!created.user) throw new Error('Admin create user returned no user');

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    });
    if (signInError || !signInData.user) {
      throw new Error(`Sign in failed after admin create: ${signInError?.message ?? 'unknown'}`);
    }
    console.log(`Created demo user: ${DEMO_EMAIL}`);
    return signInData.user;
  }

  let { data: signInData } = await supabase.auth.signInWithPassword({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
  });

  if (signInData?.user) {
    console.log(`Signed in existing demo user: ${DEMO_EMAIL}`);
    return signInData.user;
  }

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    options: {
      data: {
        display_name: 'CookMapz',
      },
    },
  });

  if (signUpError) throw new Error(`Sign up failed: ${signUpError.message}`);
  if (!signUpData.user) throw new Error('Sign up returned no user');

  if (!signUpData.session) {
    throw new Error(
      'Account created but email confirmation is required. Re-run with SUPABASE_SERVICE_ROLE_KEY set.',
    );
  }

  console.log(`Created demo user: ${DEMO_EMAIL}`);
  return signUpData.user;
}

async function uploadAvatar(supabase, userId) {
  const avatarPath = path.join(ROOT, 'assets', 'cookmapz-icon-512.png');
  if (!fs.existsSync(avatarPath)) {
    console.warn('Avatar file missing, skipping avatar upload.');
    return null;
  }

  const buffer = fs.readFileSync(avatarPath);
  const storagePath = `${userId}/avatar.png`;
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(storagePath, buffer, { contentType: 'image/png', upsert: true });
  if (uploadError) throw new Error(`Avatar upload failed: ${uploadError.message}`);

  const { data } = supabase.storage.from('avatars').getPublicUrl(storagePath);
  const avatarUrl = `${data.publicUrl}?t=${Date.now()}`;

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      display_name: 'CookMapz',
      handle: 'cookmapz',
      bio: 'Official CookMapz showcase — home cooks, live kitchens, and plates near you.',
      role: 'chef',
      avatar_url: avatarUrl,
    })
    .eq('id', userId);

  if (profileError) throw new Error(`Profile update failed: ${profileError.message}`);
  console.log('Updated CookMapz profile + avatar.');
  return avatarUrl;
}

async function createPlate(supabase, userId, plateInput) {
  const plateId = randomUUID();
  const { buffer, contentType } = await downloadImage(plateInput.imageUrl);
  const ext = contentType.includes('png') ? 'png' : 'jpg';
  const storagePath = `${userId}/catalog/${plateId}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('plate-images')
    .upload(storagePath, buffer, { contentType, upsert: true });
  if (uploadError) throw new Error(`Plate image upload failed: ${uploadError.message}`);

  const { data: publicData } = supabase.storage.from('plate-images').getPublicUrl(storagePath);
  const imageUrl = `${publicData.publicUrl}?t=${Date.now()}`;

  const { data, error } = await supabase
    .from('creator_plates')
    .insert({
      id: plateId,
      creator_id: userId,
      name: plateInput.name,
      ingredients: plateInput.ingredients,
      description: plateInput.description,
      price: plateInput.price,
      image_url: imageUrl,
    })
    .select('*')
    .single();

  if (error) throw new Error(`Plate insert failed: ${error.message}`);
  console.log(`  Plate: ${data.name} ($${data.price})`);
  return data;
}

async function postExists(supabase, userId, title) {
  const { data } = await supabase
    .from('creator_posts')
    .select('id, title')
    .eq('creator_id', userId)
    .eq('title', title)
    .maybeSingle();
  return data;
}

async function seedPost(supabase, userId, item, plateId, avatarUrl) {
  const existing = await postExists(supabase, userId, item.title);
  if (existing) {
    console.log(`Skipping "${item.title}" — already posted.`);
    return;
  }

  const videoPath = findVideoFile(item.tiktokId);
  console.log(`Uploading video: ${path.basename(videoPath)}`);

  const { data: post, error: postError } = await supabase
    .from('creator_posts')
    .insert({
      creator_id: userId,
      post_type: 'short',
      title: item.title,
      description: item.description,
      cuisine: item.cuisine,
      pickup_address: '123 Market St, San Francisco, CA',
      pickup_neighborhood: item.pickupNeighborhood,
      latitude: 37.7749,
      longitude: -122.4194,
      min_donation: 8,
      donation_goal: 100,
      ready_in_minutes: 30,
      tags: item.tags,
      status: 'processing',
      cover_image: avatarUrl,
    })
    .select('*')
    .single();

  if (postError) throw new Error(`Post insert failed: ${postError.message}`);

  const bunny = await uploadShortToBunny({
    title: item.title,
    description: item.description,
    filePath: videoPath,
    metaTags: [
      { property: 'creatorPostId', value: post.id },
      { property: 'creatorId', value: userId },
      { property: 'chefName', value: 'CookMapz' },
      { property: 'chefHandle', value: '@cookmapz' },
      { property: 'chefAvatar', value: avatarUrl ?? '' },
      { property: 'pickupAddress', value: '123 Market St, San Francisco, CA' },
      { property: 'pickupNeighborhood', value: item.pickupNeighborhood },
      { property: 'minDonation', value: '8' },
      { property: 'donationGoal', value: '100' },
      { property: 'readyInMinutes', value: '30' },
    ],
  });

  const { error: updateError } = await supabase
    .from('creator_posts')
    .update({
      bunny_video_id: bunny.videoId,
      thumbnail_url: bunny.thumbnailUrl,
      cover_image: bunny.thumbnailUrl ?? avatarUrl,
      status: 'published',
    })
    .eq('id', post.id);

  if (updateError) throw new Error(`Post update failed: ${updateError.message}`);

  const { error: linkError } = await supabase.from('post_plate_links').insert({
    post_id: post.id,
    creator_plate_id: plateId,
    sort_order: 0,
  });
  if (linkError) throw new Error(`Plate link failed: ${linkError.message}`);

  console.log(`  Posted: ${item.title} (Bunny ${bunny.videoId})`);
}

async function main() {
  console.log('CookMapz demo seed\n');

  await ensureBunnyCdnHostname();

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const admin = supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null;

  if (!admin) {
    console.warn('No SUPABASE_SERVICE_ROLE_KEY — sign-up may require email confirmation.\n');
  }

  const user = await ensureDemoUser(supabase, admin);
  const avatarUrl = await uploadAvatar(supabase, user.id);

  console.log('\nCreating plates...');
  const plateIds = [];
  for (const item of SEED_ITEMS) {
    const { data: existingPlate } = await supabase
      .from('creator_plates')
      .select('id, name')
      .eq('creator_id', user.id)
      .eq('name', item.plate.name)
      .maybeSingle();

    if (existingPlate) {
      console.log(`  Plate exists: ${existingPlate.name}`);
      plateIds.push(existingPlate.id);
      continue;
    }

    const plate = await createPlate(supabase, user.id, item.plate);
    plateIds.push(plate.id);
  }

  console.log('\nPosting shorts...');
  for (let i = 0; i < SEED_ITEMS.length; i += 1) {
    await seedPost(supabase, user.id, SEED_ITEMS[i], plateIds[i], avatarUrl);
  }

  console.log('\nDone!');
  console.log('────────────────────────────────────');
  console.log('Demo login (use in the app):');
  console.log(`  Email:    ${DEMO_EMAIL}`);
  console.log(`  Password: ${DEMO_PASSWORD}`);
  console.log(`  Handle:   @cookmapz`);
  console.log('────────────────────────────────────');
  console.log('Videos may take ~1 min on Bunny before playback works in the feed.');
}

main().catch((err) => {
  console.error('\nSeed failed:', err.message ?? err);
  process.exit(1);
});
