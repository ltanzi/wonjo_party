import { formatWeight } from "@/config";

/**
 * Three weights, one rule (SPEC.md): plain for evening stage acts (the majority —
 * badges everywhere would be noise), solid for daytime programming, accent for A/V.
 */
const weights = {
  plain: "text-muted",
  solid: "bg-fg text-bg px-1",
  accent: "bg-accent text-white px-1",
};

export function FormatBadge({ format }: { format: string }) {
  return (
    <span
      className={`inline-block font-mono text-[11px] leading-tight ${weights[formatWeight(format)]}`}
    >
      {format}
    </span>
  );
}
