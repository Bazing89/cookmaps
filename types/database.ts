export type UserRole = 'viewer' | 'chef';
export type PostType = 'short' | 'live';
export type PostStatus = 'draft' | 'processing' | 'published' | 'live' | 'ended';

export type Profile = {
  id: string;
  email: string | null;
  display_name: string | null;
  handle: string | null;
  avatar_url: string | null;
  role: UserRole;
  bio: string | null;
  follower_count: number;
  created_at: string;
  updated_at: string;
};

export type CreatorPostRow = {
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

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          email?: string | null;
          display_name?: string | null;
          handle?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          bio?: string | null;
          follower_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string | null;
          display_name?: string | null;
          handle?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          bio?: string | null;
          follower_count?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      creator_posts: {
        Row: CreatorPostRow;
        Insert: {
          id?: string;
          creator_id: string;
          post_type: PostType;
          title: string;
          description?: string | null;
          cuisine?: string | null;
          bunny_video_id?: string | null;
          video_url?: string | null;
          thumbnail_url?: string | null;
          cover_image?: string | null;
          is_live?: boolean;
          donation_goal?: number;
          donation_raised?: number;
          min_donation?: number;
          pickup_address?: string | null;
          pickup_neighborhood?: string | null;
          latitude?: number;
          longitude?: number;
          ready_in_minutes?: number;
          like_count?: number;
          viewer_count?: number;
          tags?: string[];
          stream_key?: string | null;
          rtmp_url?: string | null;
          status?: PostStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          description?: string | null;
          cuisine?: string | null;
          bunny_video_id?: string | null;
          video_url?: string | null;
          thumbnail_url?: string | null;
          cover_image?: string | null;
          is_live?: boolean;
          donation_goal?: number;
          donation_raised?: number;
          min_donation?: number;
          pickup_address?: string | null;
          pickup_neighborhood?: string | null;
          latitude?: number;
          longitude?: number;
          ready_in_minutes?: number;
          like_count?: number;
          viewer_count?: number;
          tags?: string[];
          stream_key?: string | null;
          rtmp_url?: string | null;
          status?: PostStatus;
          updated_at?: string;
        };
        Relationships: [];
      };
      post_plates: {
        Row: {
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
        Insert: {
          id?: string;
          post_id: string;
          label: string;
          description?: string | null;
          price: number;
          quantity?: number | null;
          sort_order?: number;
          image_url?: string | null;
          created_at?: string;
        };
        Update: {
          label?: string;
          description?: string | null;
          price?: number;
          quantity?: number | null;
          sort_order?: number;
          image_url?: string | null;
        };
        Relationships: [];
      };
      creator_plates: {
        Row: {
          id: string;
          creator_id: string;
          name: string;
          ingredients: string;
          description: string;
          price: number;
          image_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          creator_id: string;
          name: string;
          ingredients?: string;
          description?: string;
          price: number;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          ingredients?: string;
          description?: string;
          price?: number;
          image_url?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      post_plate_links: {
        Row: {
          id: string;
          post_id: string;
          creator_plate_id: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          post_id: string;
          creator_plate_id: string;
          sort_order?: number;
        };
        Update: {
          sort_order?: number;
        };
        Relationships: [];
      };
      plate_orders: {
        Row: {
          id: string;
          buyer_id: string;
          post_id: string;
          plate_id: string | null;
          plate_label: string;
          amount: number;
          status: 'confirmed' | 'ready' | 'picked_up' | 'cancelled';
          created_at: string;
        };
        Insert: {
          id?: string;
          buyer_id: string;
          post_id: string;
          plate_id?: string | null;
          plate_label: string;
          amount: number;
          status?: 'confirmed' | 'ready' | 'picked_up' | 'cancelled';
          created_at?: string;
        };
        Update: {
          plate_id?: string | null;
          plate_label?: string;
          amount?: number;
          status?: 'confirmed' | 'ready' | 'picked_up' | 'cancelled';
        };
        Relationships: [];
      };
      post_comments: {
        Row: {
          id: string;
          post_id: string;
          author_id: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          author_id: string;
          body: string;
          created_at?: string;
        };
        Update: {
          body?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
