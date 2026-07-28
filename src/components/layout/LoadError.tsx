/**
 * Shown when the server refused a read. Transport failures don't come here —
 * those raise the offline banner instead (see useTable).
 *
 * `stale` distinguishes the two cases that matter to the reader: there are rows
 * on screen but they may be out of date, versus there is nothing at all.
 */
export function LoadError({ message, stale }: { message: string; stale: boolean }) {
  return (
    <p className="mb-3 font-mono text-[11px] text-accent">
      {stale ? "Could not refresh — this may be out of date · " : "Could not load · "}
      {message}
    </p>
  );
}
