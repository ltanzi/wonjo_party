import { Link } from "react-router-dom";
import { SECTIONS } from "@/config";
import { Header } from "@/components/layout/Header";

/**
 * Nine plain labelled squares (SPEC.md, decision 14). No counts by choice — the
 * optional subtitle slot below is deliberately unused so live status can be added
 * later as a one-line change rather than a redesign.
 *
 * Nine fills the three-column grid exactly, so the centre cell that used to be a
 * deliberate blank is now CALENDAR and no nudge is needed. Two columns don't
 * divide nine evenly though, so the last tile spans both on mobile — a full-width
 * block rather than an orphan next to a hole.
 */
export function HomePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Header />

      <p className="mb-6 font-mono text-[11px] uppercase tracking-wider text-muted">
        15—17 January 2027 · Dallou, Gambia
      </p>

      <div className="grid grid-cols-2 gap-px bg-fg/15 sm:grid-cols-3">
        {SECTIONS.map((section, i) => {
          const isLast = i === SECTIONS.length - 1;
          const evenColumns = SECTIONS.length % 2 === 0;

          return (
            <Link
              key={section.key}
              to={`/${section.key}`}
              className={`group flex flex-col items-center justify-center bg-bg p-3 text-center no-underline transition-colors hover:bg-fg sm:aspect-square ${
                isLast && !evenColumns
                  ? "max-sm:col-span-2 max-sm:py-8 aspect-auto"
                  : "aspect-square"
              }`}
            >
              <span className="font-mono text-[11px] uppercase tracking-widest text-fg group-hover:text-bg sm:text-xs">
                {section.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
