import type { PurchasedTicket, TicketStatus } from '../screens/cook/types';
import type { CreatorPost, CreatorProfile, PostPlateLinkRow, PostPlateRow } from '../types/creator';
import type { LiveStream } from '../types/live';
import { mapPostToLiveStream } from './creatorPosts';
import { primaryTicketForStream } from './tickets';
import { supabase } from './supabase';

export type TicketPurchaseRow = {
  id: string;
  buyer_id: string;
  post_id: string;
  plate_id: string | null;
  plate_label: string;
  amount: number;
  status: string;
  created_at: string;
};

type PurchaseWithPost = TicketPurchaseRow & {
  creator_posts: CreatorPost & {
    profiles: CreatorProfile;
    post_plates?: PostPlateRow[];
    post_plate_links?: PostPlateLinkRow[];
  };
};

function mapDbStatus(status: string): TicketStatus {
  if (status === 'cancelled') return 'cancelled';
  if (status === 'expired') return 'expired';
  return 'active';
}

function resolveTicketImage(
  stream: LiveStream,
  ticketId?: string | null,
  ticketLabel?: string,
): string | null {
  const tickets = stream.tickets ?? stream.plates ?? [];
  if (ticketId) {
    const match = tickets.find((ticket) => ticket.id === ticketId);
    if (match?.imageUrl) return match.imageUrl;
  }
  if (ticketLabel) {
    const match = tickets.find((ticket) => ticket.label === ticketLabel);
    if (match?.imageUrl) return match.imageUrl;
  }
  return stream.coverImage ?? null;
}

function mapPurchaseRow(row: PurchaseWithPost): PurchasedTicket | null {
  const post = row.creator_posts;
  const profile = post?.profiles;
  if (!post || !profile) return null;

  const stream = mapPostToLiveStream(post, profile, post);

  return {
    id: row.id,
    stream,
    amount: Number(row.amount),
    purchasedAt: new Date(row.created_at).getTime(),
    ticketId: row.plate_id ?? undefined,
    ticketLabel: row.plate_label,
    ticketImageUrl: resolveTicketImage(stream, row.plate_id, row.plate_label),
    status: mapDbStatus(row.status),
  };
}

export async function fetchTicketHistory(buyerId: string): Promise<PurchasedTicket[]> {
  const { data, error } = await supabase
    .from('plate_orders')
    .select('*, creator_posts(*, profiles(*), post_plates(*), post_plate_links(sort_order, creator_plates(*)))')
    .eq('buyer_id', buyerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[ticketPurchases] fetch failed:', error.message);
    return [];
  }

  return (data ?? [])
    .map((row) => mapPurchaseRow(row as PurchaseWithPost))
    .filter((ticket): ticket is PurchasedTicket => ticket != null);
}

/** @deprecated Use fetchTicketHistory */
export const fetchOrderHistory = fetchTicketHistory;

export async function createTicketPurchase(input: {
  buyerId: string;
  postId: string;
  ticketId?: string;
  ticketLabel: string;
  amount: number;
}): Promise<TicketPurchaseRow | null> {
  const { data, error } = await supabase
    .from('plate_orders')
    .insert({
      buyer_id: input.buyerId,
      post_id: input.postId,
      plate_id: input.ticketId ?? null,
      plate_label: input.ticketLabel,
      amount: input.amount,
      status: 'confirmed',
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as TicketPurchaseRow;
}

/** @deprecated Use createTicketPurchase */
export const createPlateOrder = createTicketPurchase;

export function ticketFromStream(stream: LiveStream) {
  return primaryTicketForStream(stream);
}
