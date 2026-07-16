import type { ClaimedPlate, OrderStatus } from '../screens/cook/types';
import type { CreatorPost, CreatorProfile, PostPlateLinkRow, PostPlateRow } from '../types/creator';
import type { LiveStream } from '../types/live';
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
    post_plate_links?: PostPlateLinkRow[];
  };
};

function resolvePlateImage(
  stream: LiveStream,
  plateId?: string | null,
  plateLabel?: string,
): string | null {
  const plates = stream.plates ?? [];
  if (plateId) {
    const match = plates.find((plate) => plate.id === plateId);
    if (match?.imageUrl) return match.imageUrl;
  }
  if (plateLabel) {
    const match = plates.find((plate) => plate.label === plateLabel);
    if (match?.imageUrl) return match.imageUrl;
  }
  return null;
}

function mapOrderRow(row: OrderWithPost): ClaimedPlate | null {
  const post = row.creator_posts;
  const profile = post?.profiles;
  if (!post || !profile) return null;

  const stream = mapPostToLiveStream(post, profile, post);

  return {
    id: row.id,
    stream,
    amount: Number(row.amount),
    claimedAt: new Date(row.created_at).getTime(),
    plateId: row.plate_id ?? undefined,
    plateLabel: row.plate_label,
    plateImageUrl: resolvePlateImage(stream, row.plate_id, row.plate_label),
    status: row.status,
  };
}

export async function fetchOrderHistory(buyerId: string): Promise<ClaimedPlate[]> {
  const { data, error } = await supabase
    .from('plate_orders')
    .select('*, creator_posts(*, profiles(*), post_plates(*), post_plate_links(sort_order, creator_plates(*)))')
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
