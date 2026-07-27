/**
 * Last-known-good copy of each table in localStorage, so the app renders
 * instantly and still reads on a dead connection (SPEC.md, decision 13).
 *
 * Reads only. There is no write queue and no conflict resolution — editing is
 * blocked offline instead, which is the whole reason this stays small.
 */

const PREFIX = "wonjo:";
const SYNCED_AT = `${PREFIX}syncedAt`;

interface Entry<T> {
  at: string; // ISO
  data: T;
}

export function readCache<T>(key: string): Entry<T> | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as Entry<T>) : null;
  } catch {
    // Corrupt entry or storage disabled — behave as a cold start
    return null;
  }
}

export function writeCache<T>(key: string, data: T): string {
  const at = new Date().toISOString();
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({ at, data } satisfies Entry<T>));
    localStorage.setItem(SYNCED_AT, at);
  } catch {
    // Quota or private mode: the app still works, it just won't read offline
  }
  return at;
}

/** Most recent successful fetch of anything, for the offline banner. */
export const lastSynced = () => localStorage.getItem(SYNCED_AT);

/** Called on sign-out — the cache holds crew data and shouldn't outlive a session. */
export function clearCache() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    /* nothing sensible to do */
  }
}
