import type { PostComment } from '../types/comments';
import type { Profile } from '../types/database';
import { displayHandle } from './creatorPosts';
import { supabase } from './supabase';

export type PostCommentRow = {
  id: string;
  post_id: string;
  author_id: string;
  body: string;
  created_at: string;
};

type CommentWithAuthor = PostCommentRow & {
  profiles: Pick<Profile, 'display_name' | 'handle' | 'avatar_url'>;
};

function mapCommentRow(row: CommentWithAuthor): PostComment {
  const profile = row.profiles;
  return {
    id: row.id,
    postId: row.post_id,
    authorId: row.author_id,
    body: row.body,
    createdAt: row.created_at,
    authorHandle: displayHandle(profile),
    authorName: profile.display_name ?? 'User',
    authorAvatar: profile.avatar_url?.trim() || null,
  };
}

export function applyProfileToComment(
  comment: PostComment,
  profile: Pick<Profile, 'id' | 'display_name' | 'handle' | 'avatar_url'>,
): PostComment {
  if (comment.authorId !== profile.id) return comment;

  return {
    ...comment,
    authorName: profile.display_name ?? comment.authorName,
    authorHandle: displayHandle(profile),
    authorAvatar: profile.avatar_url?.trim() || null,
  };
}

export function formatCommentTime(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export async function fetchCommentsForPost(postId: string): Promise<PostComment[]> {
  const { data, error } = await supabase
    .from('post_comments')
    .select('*, profiles(display_name, handle, avatar_url)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) {
    console.warn('[postComments] fetch failed:', error.message);
    return [];
  }

  return (data ?? []).map((row) => mapCommentRow(row as CommentWithAuthor));
}

export async function createComment(input: {
  postId: string;
  authorId: string;
  body: string;
}): Promise<PostComment | null> {
  const body = input.body.trim();
  if (!body) return null;

  const { data, error } = await supabase
    .from('post_comments')
    .insert({
      post_id: input.postId,
      author_id: input.authorId,
      body,
    })
    .select('*, profiles(display_name, handle, avatar_url)')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapCommentRow(data as CommentWithAuthor);
}

export async function deleteComment(commentId: string): Promise<void> {
  const { error } = await supabase.from('post_comments').delete().eq('id', commentId);

  if (error) {
    throw new Error(error.message);
  }
}

export function streamSupportsComments(creatorId?: string | null): boolean {
  return Boolean(creatorId);
}
