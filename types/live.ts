export type TabId = 'live' | 'map' | 'go-live' | 'orders' | 'profile';

export type PostType = 'short' | 'live';

export type LiveStream = {
  id: string;
  creatorId?: string | null;
  postType?: PostType | null;
  /** Bunny Stream video GUID — HLS is built from EXPO_PUBLIC_BUNNY_STREAM_CDN_HOSTNAME */
  bunnyVideoId?: string | null;
  hlsUrl?: string | null;
  /** Direct MP4/HLS URL (Supabase Storage or other CDN) */
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
  chefName: string;
  chefHandle: string;
  chefAvatar: string;
  dishName: string;
  dishDescription: string;
  cuisine: string;
  coverImage: string;
  viewerCount: number;
  likeCount: number;
  donationGoal: number;
  donationRaised: number;
  minDonation: number;
  pickupAddress: string;
  pickupNeighborhood: string;
  latitude: number;
  longitude: number;
  distanceMiles: number;
  readyInMinutes: number;
  isLive: boolean;
  tags: string[];
  /** Plates for sale on this video — shown to viewers at the bottom of the feed */
  plates?: PlateOffering[];
  /** Number of questions on creator posts */
  commentCount?: number;
};

export type DonationTier = {
  id: string;
  label: string;
  amount: number;
  perks: string;
};

/** A plate the chef is selling on this video */
export type PlateOffering = {
  id: string;
  label: string;
  description: string;
  price: number;
  quantity?: number | null;
  imageUrl?: string | null;
};
