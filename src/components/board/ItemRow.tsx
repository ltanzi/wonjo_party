import type { Item } from "@/lib/types";
import { isOverdue, relativeTime, shortDate } from "@/lib/time";
import { StatusChip } from "./StatusChip";

/**
 * Mirrors SlotRow's shape — a fixed left column, then the content — so the
 * boards and the line-up read as the same tool. There the left column is the
 * time; here it is the status chip.
 *
 * Done items are muted, the same way unconfirmed slots are: the colour is what
 * lets you see remaining work without reading every line.
 */
export function ItemRow({
  item,
  onEdit,
  disabled,
}: {
  item: Item;
  onEdit: () => void;
  disabled?: boolean;
}) {
  const done = item.status === "done";
  const overdue = !done && isOverdue(item.due_date);
  const who = item.updated_by ? item.updated_by.split("@")[0] : null;

  return (
    <button
      onClick={onEdit}
      disabled={disabled}
      className={`block w-full px-1 py-1 text-left ${
        disabled ? "cursor-default" : "hover:bg-soft/60"
      } ${done ? "text-muted" : ""}`}
    >
      <div className="grid grid-cols-[5.25rem_1fr] items-baseline gap-2">
        <StatusChip status={item.status} />

        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="uppercase">
            {item.title || <span className="text-muted">untitled</span>}
          </span>
          {item.owner && <span className="text-[11px] text-muted">{item.owner}</span>}
          {item.due_date && (
            <span className={`text-[11px] ${overdue ? "text-accent" : "text-muted"}`}>
              {shortDate(item.due_date)}
              {overdue && " · overdue"}
            </span>
          )}
        </div>
      </div>

      {item.notes && (
        <div className="grid grid-cols-[5.25rem_1fr] gap-2">
          <span />
          <span className="text-[11px] text-muted">{item.notes}</span>
        </div>
      )}

      {who && (
        <div className="grid grid-cols-[5.25rem_1fr] gap-2">
          <span />
          <span className="text-[11px] text-muted/70">
            └ {who} · {relativeTime(item.updated_at)}
          </span>
        </div>
      )}
    </button>
  );
}
