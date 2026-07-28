import { clockLabel } from "@/lib/time";
import { useSyncState } from "@/lib/sync";
import { useOnline } from "@/lib/useOnline";

/**
 * Honest about staleness rather than pretending: says when the data *on this
 * page* was last true, reported by the mounted table rather than read from a
 * single global timestamp that would name whichever table synced last.
 *
 * Uses the deeper red rather than the accent token: white on #E63B2E is 4.18,
 * the very failure config.ts calls out when picking A/V's ink. An alert nobody
 * can read is worse than no alert.
 *
 * Always in the DOM. A live region has to exist before its content changes or
 * screen readers don't announce it — and going offline silently disables every
 * edit control, which is exactly the transition worth announcing.
 */
export function OfflineBanner() {
  const online = useOnline();
  const { at, retry } = useSyncState();

  return (
    <div role="status" aria-live="polite" className="sticky top-0 z-30">
      {!online && (
        <div className="flex items-baseline justify-center gap-3 bg-[#B82A1B] px-4 py-1 text-center font-mono text-[11px] uppercase tracking-wider text-white">
          <span>
            Offline{at ? ` · last synced ${clockLabel(at)}` : " · never synced"} · editing
            unavailable
          </span>
          {retry && (
            <button
              onClick={retry}
              className="underline underline-offset-2 hover:no-underline"
              // Without this the offline flag can only be cleared by a browser
              // 'online' event, which never fires when the radio stayed up and
              // only the uplink died — the captive-portal case.
            >
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
}
