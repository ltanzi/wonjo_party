import { Component, ErrorInfo, ReactNode } from "react";
import { clearCache } from "@/lib/cache";

/**
 * Without this, any throw during render unmounts the whole tree and leaves a
 * white page with no way out — which is exactly what a single missing field on a
 * cached row did once. The crew are on phones on a site; a blank screen with no
 * affordance is the worst thing this app can do.
 *
 * "Clear saved data" is here because stale cached rows are the most likely cause
 * of a render crash in this app, and it is the one fix a non-technical person can
 * apply themselves. It only drops the offline copy — nothing in the database.
 */
interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // No logging service by design; the console is all there is
    console.error("Render failed:", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="bar mb-4">Something broke</div>

        <p className="mb-1 text-muted">
          This page failed to render. Nothing in the database has been affected.
        </p>
        <p className="mb-6 font-mono text-[11px] text-muted/70">{this.state.error.message}</p>

        <div className="flex flex-wrap items-baseline gap-4 font-mono text-[11px] uppercase tracking-wider">
          <button onClick={() => window.location.reload()} className="text-fg hover:text-accent">
            Reload
          </button>
          <button
            onClick={() => {
              clearCache();
              window.location.reload();
            }}
            className="text-muted hover:text-fg"
          >
            Clear saved data and reload
          </button>
        </div>
      </div>
    );
  }
}
