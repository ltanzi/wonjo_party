/**
 * Postgres `time` comes back as 'HH:MM:SS'. The reference timetable writes times
 * with a dot separator ("21.00 - 22.00"), so that's what we render.
 */

export const toInputTime = (t: string | null) => (t ? t.slice(0, 5) : "");

export const formatTime = (t: string | null) => (t ? t.slice(0, 5).replace(":", ".") : "");

export function formatRange(start: string | null, end: string | null) {
  if (!start && !end) return "—";
  if (start && end) return `${formatTime(start)}-${formatTime(end)}`;
  return formatTime(start ?? end);
}

/** 'now' rendered the way the offline banner wants it: 14.20 */
export const clockLabel = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}.${String(d.getMinutes()).padStart(2, "0")}`;
};

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
