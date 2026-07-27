/**
 * The entire hardcoded surface of the app, deliberately in one file.
 *
 * Days, stages and sections are config rather than data (SPEC.md, decision 9).
 * Changing a label here is a one-line edit and a deploy. It is safe because the
 * database stores the `key`, never the label — renaming PLAYA cannot orphan a slot.
 */

export const FESTIVAL = "WONJO PARTY";

export const DAYS = [
  { key: "day-1", label: "Friday 15 January" },
  { key: "day-2", label: "Saturday 16 January" },
  { key: "day-3", label: "Sunday 17 January" },
] as const;

export const STAGES = [
  { key: "stage-playa", label: "PLAYA" },
  { key: "stage-isla", label: "ISLA" },
] as const;

export const SECTIONS = [
  { key: "lineup", label: "LINE-UP", bespoke: true },
  { key: "production", label: "PRODUCTION" },
  { key: "logistics", label: "LOGISTICS" },
  { key: "communication", label: "COMMUNICATION" },
  { key: "compilation", label: "COMPILATION" },
  { key: "budget", label: "BUDGET" },
  { key: "site", label: "DALLOU / SITE" },
  { key: "team", label: "TEAM" },
] as const;

/** Booking pipeline for a line-up slot. */
export const SLOT_STATUS = ["idea", "contacted", "confirmed", "cancelled"] as const;

/** Board item states, for the seven non-line-up sections (pass 2). */
export const ITEM_STATUS = ["todo", "doing", "done", "blocked"] as const;

/**
 * Format badges. `weight` drives the visual treatment, following the Sónar
 * reference's logic: plain for the majority (badges everywhere would be noise),
 * solid for daytime programming, accent for the one special case.
 */
export const FORMATS = [
  { key: "live", weight: "plain" },
  { key: "Dj", weight: "plain" },
  { key: "performance", weight: "plain" },
  { key: "workshop", weight: "solid" },
  { key: "talk", weight: "solid" },
  { key: "film", weight: "solid" },
  { key: "A/V", weight: "accent" },
] as const;

export type DayKey = (typeof DAYS)[number]["key"];
export type StageKey = (typeof STAGES)[number]["key"];
export type SectionKey = (typeof SECTIONS)[number]["key"];
export type SlotStatus = (typeof SLOT_STATUS)[number];
export type ItemStatus = (typeof ITEM_STATUS)[number];
export type Format = (typeof FORMATS)[number]["key"];

export const formatWeight = (format: string) =>
  FORMATS.find((f) => f.key === format)?.weight ?? "plain";

export const sectionLabel = (key: string) =>
  SECTIONS.find((s) => s.key === key)?.label ?? key.toUpperCase();
