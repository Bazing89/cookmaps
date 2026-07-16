import * as Location from 'expo-location';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState, Linking, Platform } from 'react-native';
import type { Coordinates } from '../lib/geo';

type UserLocationState = {
  location: Coordinates | null;
  loading: boolean;
  error: string | null;
  permissionDenied: boolean;
  refresh: () => Promise<void>;
  openSettings: () => Promise<void>;
};

const UserLocationContext = createContext<UserLocationState | null>(null);

async function readWebLocation(): Promise<Coordinates> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    throw new Error('Geolocation is not supported in this browser.');
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
      (err) => reject(new Error(err.message)),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60_000 },
    );
  });
}

function coordsFromPosition(pos: Location.LocationObject): Coordinates {
  return {
    latitude: pos.coords.latitude,
    longitude: pos.coords.longitude,
  };
}

async function readNativeLocation(): Promise<Coordinates> {
  const servicesEnabled = await Location.hasServicesEnabledAsync();
  if (!servicesEnabled) {
    throw new Error('Turn on location services to see nearby chefs.');
  }

  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Location permission denied');
  }

  const lastKnown = await Location.getLastKnownPositionAsync({
    maxAge: 5 * 60_000,
    requiredAccuracy: 1_000,
  });
  if (lastKnown) {
    return coordsFromPosition(lastKnown);
  }

  const pos = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
    mayShowUserSettingsDialog: true,
  });

  return coordsFromPosition(pos);
}

export function UserLocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const watchRef = useRef<Location.LocationSubscription | null>(null);

  const stopWatch = useCallback(() => {
    watchRef.current?.remove();
    watchRef.current = null;
  }, []);

  const startWatch = useCallback(async () => {
    if (Platform.OS === 'web') return;

    stopWatch();

    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') return;

    watchRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        distanceInterval: 75,
        timeInterval: 15_000,
      },
      (pos) => setLocation(coordsFromPosition(pos)),
    );
  }, [stopWatch]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPermissionDenied(false);

    try {
      const coords =
        Platform.OS === 'web' ? await readWebLocation() : await readNativeLocation();
      setLocation(coords);
      await startWatch();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not get location';
      setLocation(null);
      setError(message);
      setPermissionDenied(/denied/i.test(message));
      stopWatch();
    } finally {
      setLoading(false);
    }
  }, [startWatch, stopWatch]);

  const openSettings = useCallback(async () => {
    if (Platform.OS === 'web') {
      await refresh();
      return;
    }
    await Linking.openSettings();
  }, [refresh]);

  useEffect(() => {
    void refresh();
    return stopWatch;
  }, [refresh, stopWatch]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  const value = useMemo(
    () => ({ location, loading, error, permissionDenied, refresh, openSettings }),
    [location, loading, error, permissionDenied, refresh, openSettings],
  );

  return (
    <UserLocationContext.Provider value={value}>{children}</UserLocationContext.Provider>
  );
}

export function useUserLocation(): UserLocationState {
  const ctx = useContext(UserLocationContext);
  if (!ctx) {
    throw new Error('useUserLocation must be used within UserLocationProvider');
  }
  return ctx;
}
