export type TabId = 'live' | 'map' | 'go-live' | 'cart' | 'profile';

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
  /** Ticket price for live access (falls back to minDonation) */
  ticketPrice?: number;
  /** Tickets for sale on this stream — buying grants live access */
  tickets?: TicketOffering[];
  /** @deprecated Use tickets */
  plates?: TicketOffering[];
  /** Number of questions on creator posts */
  commentCount?: number;
};

export type DonationTier = {
  id: string;
  label: string;
  amount: number;
  perks: string;
};

/** A ticket that grants access to watch a live cooking session */
export type TicketOffering = {
  id: string;
  label: string;
  description: string;
  ingredients?: string;
  price: number;
  quantity?: number | null;
  imageUrl?: string | null;
};

/** @deprecated Use TicketOffering */
export type PlateOffering = TicketOffering;
