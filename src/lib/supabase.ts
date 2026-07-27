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
});
