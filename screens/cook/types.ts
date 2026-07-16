import type { LiveStream } from '../../types/live';

export type OrderStatus = 'confirmed' | 'ready' | 'picked_up' | 'cancelled';

export type ClaimedPlate = {
  id: string;
  stream: LiveStream;
  amount: number;
  claimedAt: number;
  plateId?: string;
  plateLabel: string;
  status: OrderStatus;
};
