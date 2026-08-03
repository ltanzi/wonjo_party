import { SECTION_CHIP, sectionLabel } from "@/config";

/**
 * Which area a calendar entry belongs to. Full labels rather than abbreviations —
 * the widest ("COMMUNICATION", "DALLOU / SITE") is 13 characters, about 93px at
 * 11px Inconsolata plus padding, so a 6.5rem column fits every one of them with
 * room to spare and nothing has to be made cryptic.
 */
export function SectionChip({ sectionKey }: { sectionKey: string | null }) {
  if (!sectionKey) return <span className="text-[11px] text-muted">—</span>;

  return (
    <span
      className={`inline-block truncate px-1 font-mono text-[11px] leading-tight ${
        SECTION_CHIP[sectionKey] ?? "bg-fg text-bg"
      }`}
    >
      {sectionLabel(sectionKey)}
    </span>
  );
}
