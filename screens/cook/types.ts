import type { LiveStream } from '../../types/live';

export type ClaimedPlate = {
  id: string;
  stream: LiveStream;
  amount: number;
  claimedAt: number;
};
