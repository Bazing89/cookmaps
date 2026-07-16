export type TabId = 'live' | 'map' | 'go-live' | 'orders' | 'profile';

export type LiveStream = {
  id: string;
  /** Bunny Stream video GUID — HLS is built from EXPO_PUBLIC_BUNNY_STREAM_CDN_HOSTNAME */
  bunnyVideoId?: string | null;
  hlsUrl?: string | null;
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
};

export type DonationTier = {
  id: string;
  label: string;
  amount: number;
  perks: string;
};
