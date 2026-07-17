import type { LiveStream, TicketOffering } from '../types/live';
import type { PurchasedTicket } from '../screens/cook/types';

export type NearbyLiveListing = {
  ticketId: string;
  label: string;
  description: string;
  price: number;
  imageUrl: string | null;
  stream: LiveStream;
};

/** Whether this stream requires a ticket to watch live video. */
export function streamRequiresTicket(stream: LiveStream): boolean {
  return stream.isLive;
}

/** Build ticket offerings for a stream (from catalog or default price). */
export function ticketsForStream(stream: LiveStream): TicketOffering[] {
  if (stream.tickets?.length) return stream.tickets;

  const price = stream.ticketPrice ?? stream.minDonation;
  return [
    {
      id: `ticket-${stream.id}`,
      label: `Live ticket · ${stream.dishName}`,
      description: `Watch ${stream.chefName} cook live in real time.`,
      price,
      imageUrl: stream.coverImage ?? null,
    },
  ];
}

export function primaryTicketForStream(stream: LiveStream): TicketOffering {
  return ticketsForStream(stream)[0];
}

export function liveListingsFromStreams(streams: LiveStream[]): NearbyLiveListing[] {
  const listings: NearbyLiveListing[] = [];

  for (const stream of streams) {
    if (!stream.isLive) continue;

    for (const ticket of ticketsForStream(stream)) {
      listings.push({
        ticketId: ticket.id,
        label: ticket.label,
        description: ticket.description,
        price: ticket.price,
        imageUrl: ticket.imageUrl ?? null,
        stream,
      });
    }
  }

  return listings.sort((a, b) => a.stream.distanceMiles - b.stream.distanceMiles);
}

export function userHasStreamAccess(
  stream: LiveStream,
  purchased: PurchasedTicket[],
  viewerId?: string | null,
): boolean {
  if (!streamRequiresTicket(stream)) return true;
  if (viewerId && stream.creatorId === viewerId) return true;
  return purchased.some(
    (ticket) =>
      ticket.stream.id === stream.id &&
      ticket.status !== 'cancelled' &&
      ticket.status !== 'expired',
  );
}

export function ownedPostIds(purchased: PurchasedTicket[]): Set<string> {
  return new Set(
    purchased
      .filter((t) => t.status !== 'cancelled' && t.status !== 'expired')
      .map((t) => t.stream.id),
  );
}
