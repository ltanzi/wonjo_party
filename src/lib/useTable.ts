import { useCallback, useEffect, useRef, useState } from "react";
import { readCache, writeCache } from "./cache";
import { reportOffline, reportOnline } from "./useOnline";

interface Result<T> {
  data: T[] | null;
  error: { message: string } | null;
}

/**
 * Render the cached copy immediately, then revalidate in the background
 * (SPEC.md, decision 13). A failed fetch never blanks the page — if there is
 * cached data it stays on screen and the offline banner explains why.
 *
 * `fetcher` must be stable; wrap it in useCallback at the call site.
 */
export function useTable<T>(cacheKey: string, fetcher: () => PromiseLike<Result<T>>) {
  const cached = useRef(readCache<T[]>(cacheKey)).current;

  const [rows, setRows] = useState<T[]>(cached?.data ?? []);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const { data, error } = await fetcher();
      if (error) throw new Error(error.message);
      setRows(data ?? []);
      writeCache(cacheKey, data ?? []);
      setError(null);
      reportOnline();
    } catch (e) {
      // Distinguish "the server said no" from "we couldn't reach the server".
      // Only the latter means offline; a real error should still be shown.
      const message = e instanceof Error ? e.message : "Could not load";
      const unreachable = e instanceof TypeError || /fetch|network/i.test(message);

      if (unreachable) reportOffline();
      if (!readCache<T[]>(cacheKey)) setError(message);
    } finally {
      setLoading(false);
    }
  }, [cacheKey, fetcher]);

  useEffect(() => {
    void load();
  }, [load]);

  return { rows, loading, error, reload: load };
}
