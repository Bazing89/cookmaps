export type PostType = 'short' | 'live';
export type PostStatus = 'draft' | 'processing' | 'published' | 'live' | 'ended';

export type CreatorPost = {
  id: string;
  creator_id: string;
  post_type: PostType;
  title: string;
  description: string | null;
  cuisine: string | null;
  bunny_video_id: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  cover_image: string | null;
  is_live: boolean;
  donation_goal: number;
  donation_raised: number;
  min_donation: number;
  pickup_address: string | null;
  pickup_neighborhood: string | null;
  latitude: number;
  longitude: number;
  ready_in_minutes: number;
  like_count: number;
  viewer_count: number;
  tags: string[];
  stream_key: string | null;
  rtmp_url: string | null;
  status: PostStatus;
  created_at: string;
  updated_at: string;
};

export type CreatorProfile = {
  id: string;
  display_name: string | null;
  handle: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: string;
  follower_count: number;
  email: string | null;
};

export type CreatePostInput = {
  post_type: PostType;
  title: string;
  description?: string;
  cuisine?: string;
  video_url?: string;
  thumbnail_url?: string;
  cover_image?: string;
  bunny_video_id?: string;
  is_live?: boolean;
  donation_goal?: number;
  min_donation?: number;
  pickup_address?: string;
  pickup_neighborhood?: string;
  ready_in_minutes?: number;
  tags?: string[];
  status?: PostStatus;
  stream_key?: string;
  rtmp_url?: string;
};

export type PostPlateRow = {
  id: string;
  post_id: string;
  label: string;
  description: string | null;
  price: number;
  quantity: number | null;
  sort_order: number;
  image_url: string | null;
  created_at: string;
};

export type CreatePlateInput = {
  label: string;
  description?: string;
  price: number;
  quantity?: number | null;
  sort_order?: number;
  image_url?: string | null;
};
