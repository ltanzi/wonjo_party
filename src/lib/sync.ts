import { useEffect, useState } from "react";

/**
 * What the offline banner needs from whichever page is mounted: when *this
 * page's* data was last true, and a way to try again.
 *
 * The banner is global (rendered once in App) but the answer is per-table — a
 * single global "last synced" timestamp reports whichever table synced most
 * recently, so opening Budget at 14.00 would make the Line-up page claim its
 * 09.00 data was five hours fresher than it is. A confidently wrong timestamp
 * is worse than a vague one, so the mounted table reports its own.
 *
 * Same store carries the retry, because without one a transient failure latches
 * the tab offline: nothing clears the flag but a successful read, and reads are
 * only triggered by edits, which are disabled while offline.
 */

interface SyncState {
  at: string | null;
  retry: (() => void) | null;
}

let state: SyncState = { at: null, retry: null };
const listeners = new Set<() => void>();

const publish = (next: SyncState) => {
  state = next;
  listeners.forEach((l) => l());
};

export const reportSynced = (at: string | null) => publish({ ...state, at });
export const registerRetry = (retry: (() => void) | null) => publish({ ...state, retry });

export function useSyncState() {
  const [snapshot, setSnapshot] = useState(state);

  useEffect(() => {
    const sync = () => setSnapshot(state);
    listeners.add(sync);
    sync(); // a page may have reported before this subscribed
    return () => {
      listeners.delete(sync);
    };
  }, []);

  return snapshot;
}
