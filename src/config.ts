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
 */
export const SECTIONS = [
  {
    key: "lineup",
    label: "LINE-UP",
    bespoke: true,
    owner: "Ikram Bouloum",
    blurb:
      "Who plays, when, and on which stage. Each booking from first idea through to confirmed.",
  },
  {
    key: "production",
    label: "PRODUCTION",
    owner: "",
    blurb:
      "Stage build, sound, power, gear and suppliers. Everything that has to physically exist before the first act.",
  },
  {
    key: "logistics",
    label: "LOGISTICS",
    owner: "",
    blurb:
      "Travel, transport, beds and food. Getting people and things to Dallou, and keeping them there.",
  },
  {
    key: "communication",
    label: "COMMUNICATION",
    owner: "",
    blurb:
      "Poster, socials, press and the announcement calendar. Everything the outside world sees.",
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
    blurb: "Money in and money out. Fees, quotes, what is committed and what is still a guess.",
  },
  {
    key: "site",
    label: "DALLOU / SITE",
    owner: "",
    blurb:
      "The house and the ground it stands on. What is finished, what is needed, what must be ready by January.",
  },
  {
    key: "team",
    label: "TEAM",
    owner: "",
    blurb: "Who is on the crew, what they are responsible for, and how to reach them.",
  },
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

export const findSection = (key: string) => SECTIONS.find((s) => s.key === key);

export const sectionLabel = (key: string) => findSection(key)?.label ?? key.toUpperCase();
