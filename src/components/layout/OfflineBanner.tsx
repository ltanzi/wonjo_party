import { lastSynced } from "@/lib/cache";
import { clockLabel } from "@/lib/time";
import { useOnline } from "@/lib/useOnline";

/**
 * Honest about staleness rather than pretending: says when the data on screen
 * was last true. Sticky, because the answer matters most when you're scrolled
 * into a day looking at set times.
 */
export function OfflineBanner() {
  const online = useOnline();
  if (online) return null;

  const at = lastSynced();

  return (
    <div
      role="status"
      className="sticky top-0 z-30 bg-accent px-4 py-1 text-center font-mono text-[11px] uppercase tracking-wider text-white"
    >
      Offline{at ? ` · last synced ${clockLabel(at)}` : " · never synced"} · editing unavailable
    </div>
  );
}
