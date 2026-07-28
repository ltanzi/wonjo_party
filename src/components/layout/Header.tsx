import { useState } from "react";
import { Link } from "react-router-dom";
import { FESTIVAL } from "@/config";
import { useAuth } from "@/auth/AuthProvider";
import { useOnline } from "@/lib/useOnline";

export function Header({ back }: { back?: boolean }) {
  const { email, signOut } = useAuth();
  const online = useOnline();
  const [confirming, setConfirming] = useState(false);

  return (
    <header className="mb-6 flex items-baseline justify-between gap-4 border-b border-fg/15 pb-2">
      <div className="flex items-baseline gap-3">
        {back && (
          <Link
            to="/"
            className="font-mono text-[11px] uppercase tracking-wider text-muted no-underline hover:text-fg"
          >
            ← All
          </Link>
        )}
        <Link to="/" className="font-mono text-[11px] uppercase tracking-widest no-underline">
          {FESTIVAL}
        </Link>
      </div>

      <div className="flex items-baseline gap-3 font-mono text-[11px] uppercase tracking-wider">
        <span className="hidden normal-case tracking-normal text-muted sm:inline">{email}</span>

        {/* Signing out offline is unrecoverable: it wipes the cached data and
            logging back in needs the network. It is also the only destructive
            control in the header, so it gets the same two-step as a delete. */}
        {!online ? (
          <span className="text-muted/50" title="Not available offline">
            Out
          </span>
        ) : confirming ? (
          <>
            <span className="text-muted">Sign out?</span>
            <button
              onClick={signOut}
              className="text-accent underline underline-offset-2 hover:no-underline"
            >
              Yes
            </button>
            <button onClick={() => setConfirming(false)} className="text-muted hover:text-fg">
              No
            </button>
          </>
        ) : (
          <button onClick={() => setConfirming(true)} className="text-muted hover:text-fg">
            Out
          </button>
        )}
      </div>
    </header>
  );
}
