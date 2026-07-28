import { useCallback, useEffect, useRef, useState } from "react";
import { readCache, writeCache } from "./cache";
import { reportOffline, reportOnline } from "./useOnline";

interface Result<T> {
  data: T[] | null;
  error: { message: string } | null;
  /**
   * postgrest-js sets this to 0 when the request never reached the server, and
   * to the real HTTP status otherwise. It is the only reliable way to tell
   * "no connection" from "the server said no" — the error message is written by
   * the browser and differs per engine ("Failed to fetch" in Chrome,
   * "NetworkError…" in Firefox, "Load failed" in Safari), so matching on text
   * silently misses whole platforms.
   */
  status?: number;
}

/**
 * Render the cached copy immediately, then revalidate in the background
 * (SPEC.md, decision 13). A failed fetch never blanks the page — cached rows
 * stay on screen, and the caller is told the refresh failed so it can say so.
 *
 * `fetcher` must be stable; wrap it in useCallback at the call site.
 */
export function useTable<T>(cacheKey: string, fetcher: () => PromiseLike<Result<T>>) {
  const cached = useRef(readCache<T[]>(cacheKey)).current;

  const [rows, setRows] = useState<T[]>(cached?.data ?? []);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    let result: Result<T>;
    try {
      result = await fetcher();
    } catch (e) {
      // A throw from the fetcher is a bug in our own code, not a network
      // condition — supabase-js resolves transport failures into `error`.
      setError(e instanceof Error ? e.message : "Could not load");
      setLoading(false);
      return;
    }

    const { data, error, status } = result;

    if (!error) {
      setRows(data ?? []);
      writeCache(cacheKey, data ?? []);
      setError(null);
      reportOnline();
    } else if (status === 0) {
      // Never reached the server. The offline banner is the explanation, so
      // don't also show raw browser text; keep whatever rows we have.
      reportOffline();
      setError(null);
    } else {
      // The server answered and refused — an expired token, an RLS denial, a
      // paused project. Always surface it, cache or not: this used to be
      // suppressed whenever a cache existed, which meant a save could succeed,
      // the refresh could fail, and the page would quietly show the old value.
      reportOnline();
      setError(error.message);
    }

    setLoading(false);
  }, [cacheKey, fetcher]);

  useEffect(() => {
    void load();
  }, [load]);

  return { rows, loading, error, reload: load };
}
