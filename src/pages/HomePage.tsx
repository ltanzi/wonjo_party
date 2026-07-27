import { Link } from "react-router-dom";
import { SECTIONS } from "@/config";
import { Header } from "@/components/layout/Header";

/**
 * Eight plain labelled squares (SPEC.md, decision 14). No counts by choice —
 * the optional subtitle slot below is deliberately unused so live status can be
 * added later as a one-line change rather than a redesign.
 */
export function HomePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Header />

      <p className="mb-6 font-mono text-[11px] uppercase tracking-wider text-muted">
        15—17 January 2027 · Dallou, Gambia
      </p>

      <div className="grid grid-cols-2 gap-px bg-fg/15 sm:grid-cols-3">
        {SECTIONS.map((section) => (
          <Link
            key={section.key}
            to={`/${section.key}`}
            className="group flex aspect-square flex-col items-center justify-center bg-bg p-3 text-center no-underline transition-colors hover:bg-fg"
          >
            <span className="font-mono text-[11px] uppercase tracking-widest text-fg group-hover:text-bg sm:text-xs">
              {section.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
