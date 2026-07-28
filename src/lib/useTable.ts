import { useCallback, useEffect, useRef, useState } from "react";
import { readCache, writeCache } from "./cache";
import { registerRetry, reportSynced } from "./sync";
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

  // Responses can arrive out of order — a slow request issued before an edit
  // can land after the reload that followed it, reverting the screen AND
  // overwriting the cache with pre-edit data. Only the newest request may write.
  const latest = useRef(0);
  // Compared against the live response to spot a suspicious empty result
  const rowCount = useRef(cached?.data?.length ?? 0);

  const load = useCallback(async () => {
    const id = ++latest.current;

    let result: Result<T>;
    try {
      result = await fetcher();
    } catch (e) {
      // A throw from the fetcher is a bug in our own code, not a network
      // condition — supabase-js resolves transport failures into `error`.
      if (id !== latest.current) return;
      setError(e instanceof Error ? e.message : "Could not load");
      setLoading(false);
      return;
    }

    if (id !== latest.current) return; // superseded

    const { data, error, status } = result;

    if (!error) {
      const next = data ?? [];

      // An unauthenticated read returns 200 [] rather than an error, because RLS
      // filters rather than refusing. Treating that as truth would wipe the only
      // offline copy at the moment it is most needed. So the rows update — the
      // screen should not lie — but the cache is left alone. The cost is that a
      // genuinely emptied table keeps a stale cache until something is added
      // back; that is much the cheaper mistake.
      const suspiciousEmpty = next.length === 0 && rowCount.current > 0;

      setRows(next);
      rowCount.current = next.length;
      if (!suspiciousEmpty) reportSynced(writeCache(cacheKey, next));
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

  // Tell the banner when *this* table was last true, and give it something to
  // retry with, so a latched offline state isn't a dead end.
  useEffect(() => {
    reportSynced(readCache<T[]>(cacheKey)?.at ?? null);
    registerRetry(() => void load());
    return () => registerRetry(null);
  }, [cacheKey, load]);

  // Connectivity coming back should refresh without the user doing anything.
  useEffect(() => {
    const onBack = () => void load();
    window.addEventListener("online", onBack);
    return () => window.removeEventListener("online", onBack);
  }, [load]);

  return { rows, loading, error, reload: load };
}
