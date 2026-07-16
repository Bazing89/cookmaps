import type { Coordinates } from '../../lib/geo';
import type { ClaimedPlate } from '../../screens/cook/types';
import type { LiveStream } from '../../types/live';

export type PickupMapProps = {
  chefs: LiveStream[];
  plates: ClaimedPlate[];
  userLocation?: Coordinates | null;
};
