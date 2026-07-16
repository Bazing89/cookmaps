import type { ClaimedPlate, OrderStatus } from '../screens/cook/types';
import type { CreatorPost, CreatorProfile, PostPlateRow } from '../types/creator';
import { mapPostToLiveStream } from './creatorPosts';
import { supabase } from './supabase';

export type PlateOrderRow = {
  id: string;
  buyer_id: string;
  post_id: string;
  plate_id: string | null;
  plate_label: string;
  amount: number;
  status: OrderStatus;
  created_at: string;
};

type OrderWithPost = PlateOrderRow & {
  creator_posts: CreatorPost & {
    profiles: CreatorProfile;
    post_plates?: PostPlateRow[];
  };
};

function mapOrderRow(row: OrderWithPost): ClaimedPlate | null {
  const post = row.creator_posts;
  const profile = post?.profiles;
  if (!post || !profile) return null;

  return {
    id: row.id,
    stream: mapPostToLiveStream(post, profile, post.post_plates ?? []),
    amount: Number(row.amount),
    claimedAt: new Date(row.created_at).getTime(),
    plateId: row.plate_id ?? undefined,
    plateLabel: row.plate_label,
    status: row.status,
  };
}

export async function fetchOrderHistory(buyerId: string): Promise<ClaimedPlate[]> {
  const { data, error } = await supabase
    .from('plate_orders')
    .select('*, creator_posts(*, profiles(*), post_plates(*))')
    .eq('buyer_id', buyerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[plateOrders] fetch failed:', error.message);
    return [];
  }

  return (data ?? [])
    .map((row) => mapOrderRow(row as OrderWithPost))
    .filter((order): order is ClaimedPlate => order != null);
}

export async function createPlateOrder(input: {
  buyerId: string;
  postId: string;
  plateId?: string;
  plateLabel: string;
  amount: number;
}): Promise<PlateOrderRow | null> {
  const { data, error } = await supabase
    .from('plate_orders')
    .insert({
      buyer_id: input.buyerId,
      post_id: input.postId,
      plate_id: input.plateId ?? null,
      plate_label: input.plateLabel,
      amount: input.amount,
      status: 'confirmed',
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as PlateOrderRow;
}
