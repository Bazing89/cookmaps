import { useCallback, useEffect, useState } from 'react';
import { fetchFeedVideos } from '../lib/feedVideos';
import type { LiveStream } from '../types/live';

type State = {
  streams: LiveStream[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useFeedVideos(): State {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await fetchFeedVideos();
      setStreams(next);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load feed';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { streams, loading, error, refresh };
}
