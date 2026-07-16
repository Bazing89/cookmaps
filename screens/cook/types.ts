import type { LiveStream } from '../../types/live';

export type OrderStatus = 'confirmed' | 'ready' | 'picked_up' | 'cancelled';

export type CartItem = {
  id: string;
  stream: LiveStream;
  plateId: string;
  plateLabel: string;
  plateImageUrl?: string | null;
  amount: number;
};

export type ClaimedPlate = {
  id: string;
  stream: LiveStream;
  amount: number;
  claimedAt: number;
  plateId?: string;
  plateLabel: string;
  plateImageUrl?: string | null;
  status: OrderStatus;
};
