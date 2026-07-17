import type { LiveStream } from '../../types/live';

export type TicketStatus = 'active' | 'expired' | 'cancelled';

export type CartItem = {
  id: string;
  stream: LiveStream;
  ticketId: string;
  ticketLabel: string;
  ticketImageUrl?: string | null;
  amount: number;
};

export type PurchasedTicket = {
  id: string;
  stream: LiveStream;
  amount: number;
  purchasedAt: number;
  ticketId?: string;
  ticketLabel: string;
  ticketImageUrl?: string | null;
  status: TicketStatus;
};

/** @deprecated Use PurchasedTicket */
export type ClaimedPlate = PurchasedTicket;

/** @deprecated Use TicketStatus */
export type OrderStatus = TicketStatus;
