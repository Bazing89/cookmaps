import type { DonationTier, LiveStream } from '../types/live';

export const TICKET_TIERS: DonationTier[] = [
  { id: 'watch', label: 'Watch live', amount: 8, perks: 'Join the stream and watch your dish being cooked' },
  { id: 'vip', label: 'VIP seat', amount: 18, perks: 'Live access + ask the chef questions in chat' },
  { id: 'kitchen', label: 'Kitchen pass', amount: 35, perks: 'Front-row live view + recipe notes after the stream' },
];

/** @deprecated Use TICKET_TIERS */
export const DONATION_TIERS = TICKET_TIERS;

export const LIVE_STREAMS: LiveStream[] = [
  {
    id: '1',
    chefName: 'Maya Chen',
    chefHandle: '@mayafires',
    chefAvatar:
      'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=200&h=200&fit=crop&crop=faces',
    dishName: 'Chili Crisp Biang Biang',
    dishDescription: 'Hand-pulled noodles, black vinegar, Sichuan chili oil — wok roaring live.',
    cuisine: 'Sichuan',
    coverImage:
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1200&h=1800&fit=crop',
    viewerCount: 2840,
    likeCount: 912,
    donationGoal: 120,
    donationRaised: 78,
    minDonation: 8,
    pickupAddress: '214 Oak St · Kitchen Window',
    pickupNeighborhood: 'Mission District',
    latitude: 37.7599,
    longitude: -122.4148,
    distanceMiles: 0.4,
    readyInMinutes: 22,
    isLive: true,
    tags: ['noodles', 'spicy', 'hand-pulled'],
  },
  {
    id: '2',
    chefName: 'Jamal Okonkwo',
    chefHandle: '@smokekingj',
    chefAvatar:
      'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=200&h=200&fit=crop&crop=faces',
    dishName: 'Jollof & Plantain Stack',
    dishDescription: 'Smoky party rice, caramelized plantains, and pepper sauce from the charcoal grill.',
    cuisine: 'West African',
    coverImage:
      'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=1200&h=1800&fit=crop',
    viewerCount: 1520,
    likeCount: 640,
    donationGoal: 90,
    donationRaised: 54,
    minDonation: 10,
    pickupAddress: '88 Linden Ave · Back Patio',
    pickupNeighborhood: 'Oakland Hills',
    latitude: 37.8044,
    longitude: -122.2108,
    distanceMiles: 1.2,
    readyInMinutes: 35,
    isLive: true,
    tags: ['jollof', 'grill', 'plantain'],
  },
  {
    id: '3',
    chefName: 'Sofia Reyes',
    chefHandle: '@masaandsoul',
    chefAvatar:
      'https://images.unsplash.com/photo-1595273670152-7a3a1e8c0b0b?w=200&h=200&fit=crop&crop=faces',
    dishName: 'Blue Corn Tacos al Pastor',
    dishDescription: 'Trompo spinning now — pineapple-charred pork on house blue masa.',
    cuisine: 'Mexican',
    coverImage:
      'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=1200&h=1800&fit=crop',
    viewerCount: 4210,
    likeCount: 1804,
    donationGoal: 150,
    donationRaised: 132,
    minDonation: 9,
    pickupAddress: '15 Cesar Chavez · Alley Hatch',
    pickupNeighborhood: 'Fruitvale',
    latitude: 37.7749,
    longitude: -122.2247,
    distanceMiles: 0.8,
    readyInMinutes: 18,
    isLive: true,
    tags: ['tacos', 'trompo', 'masa'],
  },
  {
    id: '4',
    chefName: 'Luca Bianchi',
    chefHandle: '@fornoluca',
    chefAvatar:
      'https://images.unsplash.com/photo-1607631568010-a87245c0daf8?w=200&h=200&fit=crop&crop=faces',
    dishName: 'Wood-Fired Margherita',
    dishDescription: 'San Marzano, fior di latte, basil — 900° oven, blistered crusts landing now.',
    cuisine: 'Italian',
    coverImage:
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d264?w=1200&h=1800&fit=crop',
    viewerCount: 980,
    likeCount: 411,
    donationGoal: 80,
    donationRaised: 41,
    minDonation: 12,
    pickupAddress: '402 Valencia · Oven Door',
    pickupNeighborhood: 'SoMa',
    latitude: 37.7648,
    longitude: -122.4219,
    distanceMiles: 1.6,
    readyInMinutes: 28,
    isLive: true,
    tags: ['pizza', 'wood-fired', 'neapolitan'],
  },
  {
    id: '5',
    chefName: 'Aisha Patel',
    chefHandle: '@tadka.live',
    chefAvatar:
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=faces',
    dishName: 'Butter Chicken Thali',
    dishDescription: 'Tandoor chicken in makhani gravy with fresh roti — tadka hitting the pan live.',
    cuisine: 'North Indian',
    coverImage:
      'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=1200&h=1800&fit=crop',
    viewerCount: 3102,
    likeCount: 1205,
    donationGoal: 110,
    donationRaised: 67,
    minDonation: 11,
    pickupAddress: '77 Divisadero · Side Door',
    pickupNeighborhood: 'NoPa',
    latitude: 37.7749,
    longitude: -122.437,
    distanceMiles: 0.6,
    readyInMinutes: 25,
    isLive: true,
    tags: ['thali', 'tandoor', 'comfort'],
  },
];

export function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
  return String(n);
}
