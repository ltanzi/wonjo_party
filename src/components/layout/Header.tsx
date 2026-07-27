import { Link } from "react-router-dom";
import { FESTIVAL } from "@/config";
import { useAuth } from "@/auth/AuthProvider";

export function Header({ back }: { back?: boolean }) {
  const { email, signOut } = useAuth();

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

      <div className="flex items-baseline gap-3">
        <span className="hidden font-mono text-[11px] text-muted sm:inline">{email}</span>
        <button
          onClick={signOut}
          className="font-mono text-[11px] uppercase tracking-wider text-muted hover:text-fg"
        >
          Out
        </button>
      </div>
    </header>
  );
}
