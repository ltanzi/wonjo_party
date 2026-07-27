import { ITEM_STATUS_CHIP } from "@/config";
import type { ItemStatus } from "@/config";

export function StatusChip({ status }: { status: ItemStatus }) {
  return (
    <span
      className={`inline-block px-1 font-mono text-[11px] leading-tight ${ITEM_STATUS_CHIP[status]}`}
    >
      {status}
    </span>
  );
}
