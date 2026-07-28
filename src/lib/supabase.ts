import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Missing config is a setup mistake, not a runtime condition to paper over —
 * fail loudly here rather than surfacing confusing auth errors later.
 */
if (!url || !anonKey) {
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. " +
      "Copy .env.example to .env.local for local dev, or set the GitHub Actions secrets for deploys.",
  );
}

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
  global: {
    /**
     * A stalled connection — the characteristic rural-mobile failure, as opposed
     * to a clean rejection — leaves fetch neither resolving nor rejecting. With
     * no timeout the spinner runs forever and no error path is ever reached.
     * Aborting turns that into an ordinary transport failure, which surfaces as
     * status 0 and raises the offline banner.
     *
     * Only applied when nothing upstream set a signal, so supabase's own
     * cancellation still wins where it uses one.
     */
    fetch: (input, init) =>
      init?.signal
        ? fetch(input, init)
        : fetch(input, { ...init, signal: AbortSignal.timeout(20_000) }),
  },
});
