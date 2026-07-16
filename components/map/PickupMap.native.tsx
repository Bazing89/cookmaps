import Constants, { ExecutionEnvironment } from 'expo-constants';
import type { ComponentType } from 'react';
import type { ClaimedPlate } from '../../screens/cook/types';
import { PickupMapNativeFallback } from './PickupMapNativeFallback';

type Props = {
  plates: ClaimedPlate[];
};

type ExpoMapsModule = {
  ExpoMapsPickupMap: ComponentType<Props>;
};

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

function loadExpoMaps(): ExpoMapsModule | null {
  if (isExpoGo) return null;

  try {
    return require('./ExpoMapsPickupMap') as ExpoMapsModule;
  } catch {
    return null;
  }
}

const expoMapsModule = loadExpoMaps();

export function PickupMap({ plates }: Props) {
  if (!expoMapsModule) {
    return <PickupMapNativeFallback plates={plates} />;
  }

  const { ExpoMapsPickupMap } = expoMapsModule;
  return <ExpoMapsPickupMap plates={plates} />;
}
