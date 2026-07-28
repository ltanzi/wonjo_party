import { useEffect, useState } from "react";

/**
 * navigator.onLine only knows whether there is *a* network, not whether Supabase
 * is reachable — a captive portal or a dead uplink both report online. So a
 * failed request also counts as offline, via reportOffline(), until one succeeds
 * or the browser sees the connection come back.
 */

let forcedOffline = false;
const listeners = new Set<() => void>();

const isOnline = () => navigator.onLine && !forcedOffline;
const notify = () => listeners.forEach((l) => l());

export function reportOffline() {
  if (!forcedOffline) {
    forcedOffline = true;
    notify();
  }
}

export function reportOnline() {
  if (forcedOffline) {
    forcedOffline = false;
    notify();
  }
}

/**
 * Mutations must move the flag too. Reads were the only thing reporting, so
 * losing signal while editing left the banner down and every control enabled —
 * and editing is precisely what offline mode exists to block.
 */
export function reportFromStatus(status?: number) {
  if (status === 0) reportOffline();
  else if (status !== undefined) reportOnline();
}

export function useOnline() {
  const [online, setOnline] = useState(isOnline);

  useEffect(() => {
    const sync = () => setOnline(isOnline());
    // The browser reporting a connection clears our own failed-request flag;
    // the next request decides whether it really is back.
    const onBrowserOnline = () => {
      forcedOffline = false;
      sync();
    };

    listeners.add(sync);
    window.addEventListener("online", onBrowserOnline);
    window.addEventListener("offline", sync);

    return () => {
      listeners.delete(sync);
      window.removeEventListener("online", onBrowserOnline);
      window.removeEventListener("offline", sync);
    };
  }, []);

  return online;
}
