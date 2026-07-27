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

/**
 * `owner` is social, not enforced — anyone may edit anything (decision 4). It just
 * says who keeps this section, so people know whom to ask. Fill in the names;
 * an empty string renders as unassigned.
 *
 * Keep `blurb` under ~90 characters. The page is 736px of Inconsolata at 13px,
 * which is about 113 characters, so anything longer wraps to a second line.
 */
export const SECTIONS = [
  {
    key: "lineup",
    label: "LINE-UP",
    bespoke: true,
    owner: "Ikram Bouloum",
    blurb: "Who plays, when and where — from first idea to confirmed.",
  },
  {
    key: "production",
    label: "PRODUCTION",
    owner: "",
    blurb: "Stage, sound, power, gear and suppliers. Everything that must physically exist.",
  },
  {
    key: "logistics",
    label: "LOGISTICS",
    owner: "",
    blurb: "Travel, transport, beds and food. Getting people and things to Dallou.",
  },
  {
    key: "communication",
    label: "COMMUNICATION",
    owner: "",
    blurb: "Poster, socials, press and the announcement calendar.",
  },
  {
    key: "compilation",
    label: "COMPILATION",
    owner: "",
    blurb: "The record. Tracks, masters, artwork and credits.",
  },
  {
    key: "budget",
    label: "BUDGET",
    owner: "",
    blurb: "Money in and money out. Fees, quotes, and what is still a guess.",
  },
  {
    key: "site",
    label: "DALLOU / SITE",
    owner: "",
    blurb: "The house and the ground. What is done, and what must be ready by January.",
  },
  {
    key: "team",
    label: "TEAM",
    owner: "",
    blurb: "Who is on the crew, what they do, and how to reach them.",
  },
] as const;

/** Booking pipeline for a line-up slot. */
export const SLOT_STATUS = ["idea", "contacted", "confirmed", "cancelled"] as const;

/** Board item states, for the seven non-line-up sections (pass 2). */
export const ITEM_STATUS = ["todo", "doing", "done", "blocked"] as const;

/**
 * Format badges — a solid block of ink per format, so the shape of a day reads
 * by colour before you read a word.
 *
 * The inks are chosen to sit on the paper ground like screenprint: desaturated,
 * warm-leaning, none of them competing with the accent red used for errors and
 * cancellations. Every pairing clears 4.5:1 against its text colour, checked at
 * the 11px the badges actually render at.
 *
 * Full class strings, not composed ones — Tailwind scans source text, so
 * `bg-[${hex}]` built at runtime would never be generated.
 */
export const FORMATS = [
  { key: "live", badge: "bg-[#1A1A1A] text-bg" }, // black
  { key: "dj", badge: "bg-[#2B5CA8] text-white" }, // blue
  { key: "performance", badge: "bg-[#2E6B4F] text-white" }, // green
  { key: "workshop", badge: "bg-[#B07A1E] text-fg" }, // ochre
  { key: "talk", badge: "bg-[#6B4C8A] text-white" }, // purple
  { key: "film", badge: "bg-[#7A4B32] text-white" }, // brown
  { key: "A/V", badge: "bg-[#C9301F] text-white" }, // red
] as const;

/** Stable identity for <Select options>, so the list isn't rebuilt every render. */
export const FORMAT_KEYS = FORMATS.map((f) => f.key);

export type DayKey = (typeof DAYS)[number]["key"];
export type StageKey = (typeof STAGES)[number]["key"];
export type SectionKey = (typeof SECTIONS)[number]["key"];
export type SlotStatus = (typeof SLOT_STATUS)[number];
export type ItemStatus = (typeof ITEM_STATUS)[number];
export type Format = (typeof FORMATS)[number]["key"];

export const formatBadge = (format: string) =>
  FORMATS.find((f) => f.key === format)?.badge ?? "bg-fg text-bg";

export const findSection = (key: string) => SECTIONS.find((s) => s.key === key);

export const sectionLabel = (key: string) => findSection(key)?.label ?? key.toUpperCase();
