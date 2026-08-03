/**
 * The entire hardcoded surface of the app, deliberately in one file.
 *
 * Days, stages and sections are config rather than data (SPEC.md, decision 9).
 * Changing a *label* here is a one-line edit and a deploy, and it is safe: the
 * database stores the `key`, so renaming PLAYA to anything cannot orphan a slot.
 * Changing a *key* is the opposite — existing rows keep the old one, and a row
 * whose key is no longer listed renders nowhere and appears in no count. Treat
 * keys as permanent unless you also write a migration.
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
 * Keep `blurb` under ~90 characters. The narrowest page that renders one is 736px
 * (max-w-3xl less px-4 either side) of Inconsolata at 13px — its advance is half
 * an em, so 6.5px a character, about 113 before it wraps. The line-up page is
 * wider, but 736px is the binding case; 90 leaves margin for edits.
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
    // Index 4 of nine, so it lands dead centre of the 3×3 grid on desktop —
    // the cell that used to be a deliberate blank.
    key: "calendar",
    label: "CALENDAR",
    bespoke: true,
    owner: "",
    blurb: "What has to happen when. Shared deadlines, month by month.",
  },
  {
    key: "compilation",
    label: "COMPILATION",
    bespoke: true,
    owner: "",
    blurb: "Artists on the record: who is in, and who has sent their track.",
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

/**
 * Board item states, for the seven non-line-up sections. Chips reuse the muted
 * grey and three of the format inks rather than introducing a second palette,
 * and are held at the same 85%. All four clear 4.5:1 at 11px.
 */
export const ITEM_STATUS = ["todo", "doing", "done", "blocked"] as const;

/**
 * A calendar entry is assigned to an area rather than a person — each section
 * already has one keeper, so the area answers "whose is this" and gives the month
 * a colour to be scanned by.
 *
 * Reuses the eight validated inks rather than starting a third palette. All eight
 * clear 4.5:1 at 11px composited over the paper; worst is BUDGET at 4.70.
 */
export const SECTION_CHIP: Record<string, string> = {
  lineup: "bg-[#1A1A1A]/85 text-bg", // black
  production: "bg-[#7A4B32]/85 text-white", // brown
  logistics: "bg-[#2B5CA8]/85 text-white", // blue
  communication: "bg-[#B82A1B]/85 text-white", // red
  compilation: "bg-[#6B4C8A]/85 text-white", // purple
  budget: "bg-[#2E6B4F]/85 text-white", // green
  site: "bg-[#B07A1E]/85 text-fg", // ochre
  team: "bg-[#8A8A8A]/85 text-fg", // grey
};

/** Areas a calendar entry can belong to — everything except the calendar itself. */
export const ASSIGNABLE_SECTIONS = SECTIONS.filter((s) => s.key !== "calendar");

export const ITEM_STATUS_CHIP: Record<(typeof ITEM_STATUS)[number], string> = {
  todo: "bg-[#8A8A8A]/85 text-fg",
  doing: "bg-[#2B5CA8]/85 text-white",
  done: "bg-[#2E6B4F]/85 text-white",
  blocked: "bg-[#B82A1B]/85 text-white",
};

/**
 * Format badges — a solid block of ink per format, so the shape of a day reads
 * by colour before you read a word.
 *
 * The inks are chosen to sit on the paper ground like screenprint: desaturated,
 * warm-leaning, none of them competing with the accent red used for errors and
 * cancellations. Held at 85% so the paper and its grain show through.
 *
 * All eleven pairings here and in ITEM_STATUS_CHIP clear 4.5:1 at the 11px they
 * render at, measured composited over #EDE8E0. The binding one is `performance`
 * at 4.71; the true floor is 0.83, where it reaches 4.55 — so 0.85 is that floor
 * plus a little margin, not a cliff.
 *
 * Only the white-label inks are constrained. Lightening an ink lowers contrast
 * against white but *raises* it against dark text, so `workshop` and `todo` gain
 * from the transparency — workshop is 4.68 opaque and 5.65 at 85%, and would
 * pass at any alpha.
 *
 * A/V is a deeper red than the UI accent because #E63B2E manages only 4.18 on
 * white, failing AA even fully opaque.
 *
 * Full class strings, not composed ones — Tailwind scans source text, so
 * `bg-[${hex}]` built at runtime would never be generated.
 */
export const FORMATS = [
  { key: "live", badge: "bg-[#1A1A1A]/85 text-bg" }, // black
  { key: "dj", badge: "bg-[#2B5CA8]/85 text-white" }, // blue
  { key: "performance", badge: "bg-[#2E6B4F]/85 text-white" }, // green
  { key: "workshop", badge: "bg-[#B07A1E]/85 text-fg" }, // ochre
  { key: "talk", badge: "bg-[#6B4C8A]/85 text-white" }, // purple
  { key: "film", badge: "bg-[#7A4B32]/85 text-white" }, // brown
  { key: "A/V", badge: "bg-[#B82A1B]/85 text-white" }, // red
] as const;

/** Stable identity for <Select options>, so the list isn't rebuilt every render. */
export const FORMAT_KEYS = FORMATS.map((f) => f.key);

export type SlotStatus = (typeof SLOT_STATUS)[number];
export type ItemStatus = (typeof ITEM_STATUS)[number];
export type Format = (typeof FORMATS)[number]["key"];

export const formatBadge = (format: string) =>
  FORMATS.find((f) => f.key === format)?.badge ?? "bg-fg text-bg";

export const findSection = (key: string) => SECTIONS.find((s) => s.key === key);

export const sectionLabel = (key: string) => findSection(key)?.label ?? key.toUpperCase();
