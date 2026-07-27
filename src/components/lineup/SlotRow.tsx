import { FormatBadge } from "@/components/ui/FormatBadge";
import type { Slot } from "@/lib/types";
import { formatRange, relativeTime } from "@/lib/time";

/**
 * Row treatment by booking status (SPEC.md):
 *   confirmed  — solid, exactly like the reference timetable
 *   idea/contacted — muted text, so a day's real content reads at a glance;
 *     the status word after the name says which stage it is at
 *   cancelled  — struck through in accent red, and hidden behind the
 *     per-stage reveal on the line-up page
 *
 * No rules or markers in the margin: the colour is the scannable signal and the
 * word is the precise one, which between them cover it.
 *
 * Note the strike is not set here. Text decoration on a block propagates to its
 * descendants and paints across the full width of each box — and this row's
 * children are grid containers, so it rendered as a bar spanning the whole row.
 * It belongs on the name span.
 */
const statusStyle: Record<Slot["status"], string> = {
  confirmed: "",
  idea: "text-muted",
  contacted: "text-muted",
  cancelled: "text-accent",
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
