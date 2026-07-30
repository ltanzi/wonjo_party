/**
 * Last-known-good copy of each table in localStorage, so the app renders
 * instantly and still reads on a dead connection (SPEC.md, decision 13).
 *
 * Reads only. There is no write queue and no conflict resolution — editing is
 * blocked offline instead, which is the whole reason this stays small.
 *
 * This only helps while the tab stays open. There is no service worker, so a
 * reload must fetch the app itself before any of this runs, and the cache goes
 * unread (SPEC.md, known limit).
 */

/**
 * Bump the version whenever a row type in lib/types.ts gains or loses a field.
 * Cached rows outlive migrations: a browser holds the old shape indefinitely and
 * useTable renders it before any fetch can replace it, so a component written
 * against the new shape sees `undefined` where it expects a value. Changing the
 * prefix orphans the old entries instead of feeding them to the app.
 *
 * v2: compilation gained drive_link.
 */
const BASE = "wonjo:";
const PREFIX = `${BASE}2:`;

interface Entry<T> {
  at: string; // ISO
  data: T;
}

export function readCache<T>(key: string): Entry<T> | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as Entry<T>) : null;
  } catch {
    // Corrupt entry or storage disabled — behave as a cold start. A corrupt entry
    // is not removed, so it keeps failing until the next successful write
    // replaces it; until then the app simply runs online-only.
    return null;
  }
}

export function writeCache<T>(key: string, data: T): string {
  const at = new Date().toISOString();
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({ at, data } satisfies Entry<T>));
  } catch {
    // Quota or private mode: the app still works, it just won't read offline.
    // The timestamp returned below then describes a write that did not happen,
    // so the banner may claim a freshness the disk does not have — the lesser
    // evil against refusing to render at all.
  }
  return at;
}

/**
 * Called on sign-out — the cache holds crew data and shouldn't outlive a session —
 * and offered as an escape hatch by the error boundary.
 *
 * Clears every version, not just the current one, so orphaned entries from an
 * older shape don't sit in storage forever and a stuck browser really is reset.
 */
export function clearCache() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(BASE))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    // Storage unavailable — which means writeCache never persisted anything
    // either, so nothing is left behind and the promise above still holds.
  }
}
