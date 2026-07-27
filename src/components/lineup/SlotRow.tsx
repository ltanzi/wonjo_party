import { FormatBadge } from "@/components/ui/FormatBadge";
import type { Slot } from "@/lib/types";
import { formatRange, relativeTime } from "@/lib/time";

/**
 * Row treatment by booking status (SPEC.md):
 *   confirmed  — solid, exactly like the reference timetable
 *   idea/contacted — ghosted: dashed rule and muted text, so a day's real
 *     content reads at a glance; the status word says which stage it is at
 *   cancelled  — struck through in accent red, and hidden behind the
 *     per-stage reveal on the line-up page
 *
 * The dashed rule and the grey are the scannable signal; the word is the
 * precise one. There is deliberately no third marker duplicating them.
 *
 * Confirmed rows keep a transparent left border so nothing shifts
 * horizontally when a slot is confirmed.
 */
const ghost = "border-l border-dashed border-fg/30 text-muted";

/**
 * Deliberately no line-through here. Text decoration set on a block propagates to
 * its descendants and is painted across the full width of each box — and this
 * row's children are grid containers, so it rendered as a bar spanning the whole
 * row instead of a strike through the name. It belongs on the name span.
 */
const statusStyle: Record<Slot["status"], string> = {
  confirmed: "border-l border-transparent",
  idea: ghost,
  contacted: ghost,
  cancelled: "border-l border-dashed border-accent/40 text-accent",
};

export function SlotRow({ slot, onEdit }: { slot: Slot; onEdit: () => void }) {
  const unsettled = slot.status === "idea" || slot.status === "contacted";
  const cancelled = slot.status === "cancelled";
  const who = slot.updated_by ? slot.updated_by.split("@")[0] : null;

  return (
    <button
      onClick={onEdit}
      className={`block w-full pl-2 pr-1 py-1 text-left hover:bg-soft/60 ${statusStyle[slot.status]}`}
    >
      <div className="grid grid-cols-[4.75rem_1fr] items-baseline gap-2">
        <span className="text-[11px] tabular-nums text-muted">
          {formatRange(slot.start_time, slot.end_time)}
        </span>

        <div className="flex flex-wrap items-baseline gap-x-2">
          <FormatBadge format={slot.format} />
          <span className={`uppercase ${cancelled ? "line-through" : ""}`}>
            {slot.artist_name || <span className="text-muted">untitled</span>}
            {slot.country && <span className="text-muted"> ({slot.country})</span>}
          </span>
          {unsettled && (
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted">
              · {slot.status}
            </span>
          )}
        </div>
      </div>

      {slot.notes && (
        <div className="grid grid-cols-[4.75rem_1fr] gap-2">
          <span />
          <span className="text-[11px] text-muted">{slot.notes}</span>
        </div>
      )}

      {who && (
        <div className="grid grid-cols-[4.75rem_1fr] gap-2">
          <span />
          <span className="text-[11px] text-muted/70">
            └ {who} · {relativeTime(slot.updated_at)}
          </span>
        </div>
      )}
    </button>
  );
}
