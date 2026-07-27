import { formatBadge } from "@/config";

/** A solid block of ink per format — see FORMATS in config.ts for the palette. */
export function FormatBadge({ format }: { format: string }) {
  return (
    <span
      className={`inline-block px-1 font-mono text-[11px] leading-tight ${formatBadge(format)}`}
    >
      {format}
    </span>
  );
}
