/**
 * Postgres `time` comes back as 'HH:MM:SS'. The reference timetable writes times
 * with a dot separator, so that's what we render: "21.00-22.00", no spaces.
 */

export const toInputTime = (t: string | null) => (t ? t.slice(0, 5) : "");

export const formatTime = (t: string | null) => (t ? t.slice(0, 5).replace(":", ".") : "");

export function formatRange(start: string | null, end: string | null) {
  if (!start && !end) return "—";
  if (start && end) return `${formatTime(start)}-${formatTime(end)}`;
  return formatTime(start ?? end);
}

/** A timestamp as the offline banner wants it: 14.20. Always a past instant. */
export const clockLabel = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}.${String(d.getMinutes()).padStart(2, "0")}`;
};

/**
 * Board due dates: '2027-03-15' → '15 Mar' within the current year, and
 * '15 Mar 2027' outside it. So festival dates read with the year until 2027.
 */
export function shortDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const months = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ");
  return `${d} ${months[m - 1]}${y !== new Date().getFullYear() ? ` ${y}` : ""}`;
}

const MONTHS =
  "January February March April May June July August September October November December".split(
    " ",
  );

/** Calendar month heading: '2026-08-03' → 'August 2026'. The year is always shown
 *  because the plan spans into January 2027 and 'January' alone would be ambiguous. */
export function monthLabel(iso: string) {
  const [y, m] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

/** Groups milestones by the month their window opens in. */
export const monthKey = (iso: string) => iso.slice(0, 7);

/**
 * A window, written the way the crew write it:
 *   same day          → '3 Aug'
 *   within one month   → '3–16 Aug'
 *   spanning months    → '28 Sep – 2 Oct'
 */
export function dateRange(start: string, end: string) {
  const [, sm, sd] = start.split("-").map(Number);
  const [, em, ed] = end.split("-").map(Number);
  const short = (m: number) => MONTHS[m - 1].slice(0, 3);

  if (start === end) return `${sd} ${short(sm)}`;
  if (sm === em) return `${sd}–${ed} ${short(sm)}`;
  return `${sd} ${short(sm)} – ${ed} ${short(em)}`;
}

/** Compared by date, not instant — a task due today is not yet late. */
export function isOverdue(iso: string | null) {
  if (!iso) return false;
  const today = new Date();
  const midnight = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
    today.getDate(),
  ).padStart(2, "0")}`;
  return iso < midnight;
}

/** Coarse relative time for attribution lines: "2h ago", "3d ago". */
export function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}
