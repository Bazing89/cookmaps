export type TabId = 'live' | 'map' | 'go-live' | 'orders' | 'profile';

export type LiveStream = {
  id: string;
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
