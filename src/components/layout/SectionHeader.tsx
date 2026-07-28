import { findSection } from "@/config";

/**
 * Shared by all eight section pages — the two bespoke ones and the six boards —
 * so their headers can't drift apart. `meta` is the optional right-hand slot — the line-up uses
 * it for its confirmed count.
 */
export function SectionHeader({
  sectionKey,
  meta,
}: {
  sectionKey: string;
  meta?: React.ReactNode;
}) {
  const section = findSection(sectionKey);
  if (!section) return null;

  return (
    <div className="mb-6">
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <h1 className="font-mono text-sm uppercase tracking-widest">{section.label}</h1>
        {meta}
      </div>

      {/* No max-width: blurbs are written short enough to sit on one line at the
          page's reading width. They still wrap on a phone, which is fine. */}
      <p className="text-muted">{section.blurb}</p>

      <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-muted">
        Kept by{" "}
        {section.owner ? (
          <span className="text-fg">{section.owner}</span>
        ) : (
          <span className="text-muted/70">&mdash; unassigned</span>
        )}
      </p>
    </div>
  );
}
