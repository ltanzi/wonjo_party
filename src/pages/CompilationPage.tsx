import { useCallback, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { CompilationArtist } from "@/lib/types";
import { useTable } from "@/lib/useTable";
import { reportFromStatus, useOnline } from "@/lib/useOnline";
import { relativeTime } from "@/lib/time";
import { Header } from "@/components/layout/Header";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { LoadError } from "@/components/layout/LoadError";
import { ArtistForm } from "@/components/compilation/ArtistForm";

/**
 * The spreadsheet this replaces, as a page: Artist | Email | Confirmed | Sent.
 *
 * Its own screen rather than the generic board because the shape is an address
 * book with two flags, not a task with a status and a due date. The flags toggle
 * straight from the row — this is used like a spreadsheet, so flipping a cell
 * should not mean opening a form.
 *
 * The two flag columns are fixed and the name/email columns are fractional; the
 * sideways scroll on a narrow screen comes from min-w on the inner div inside an
 * overflow-x-auto wrapper, not from the column widths. Removing that min-w makes
 * it reflow and stop reading as a table.
 */
const COLS = "grid grid-cols-[1fr_1.5fr_4.5rem_4.5rem] gap-2";

function Flag({
  on,
  label,
  onToggle,
  disabled,
  pending,
}: {
  on: boolean;
  label: string;
  onToggle: () => void;
  disabled?: boolean;
  pending?: boolean;
}) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled || pending}
      aria-pressed={on}
      aria-busy={pending}
      aria-label={`${label}: ${on ? "yes" : "no"}`}
      className={`inline-block px-1 font-mono text-[11px] leading-tight ${
        on ? "bg-[#2E6B4F]/85 text-white" : "bg-[#8A8A8A]/85 text-fg"
      } ${pending ? "opacity-50" : ""} ${disabled ? "cursor-default" : "hover:opacity-80"}`}
    >
      {pending ? "…" : on ? "yes" : "no"}
    </button>
  );
}

export function CompilationPage() {
  const fetcher = useCallback(
    () =>
      supabase
        .from("compilation")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("id", { ascending: true }), // deterministic tiebreak (see LineupPage)
    [],
  );

  const { rows, loading, error, reload } = useTable<CompilationArtist>("compilation", fetcher);
  const online = useOnline();
  const [editing, setEditing] = useState<string | "new" | null>(null);

  const done = () => {
    setEditing(null);
    void reload();
  };

  const [pendingFlag, setPendingFlag] = useState<string | null>(null);
  const [flagError, setFlagError] = useState<string | null>(null);

  /**
   * One flag at a time, and never silently. The new value is derived from `row`,
   * which only changes after a successful reload — so concurrent toggles would
   * all compute from the same stale row, and a discarded error would leave the
   * user tapping a cell that never moves.
   */
  async function toggle(row: CompilationArtist, field: "confirmed" | "sent") {
    if (pendingFlag) return;
    setPendingFlag(`${row.id}:${field}`);
    setFlagError(null);

    const { error, status } = await supabase
      .from("compilation")
      .update({ [field]: !row[field] })
      .eq("id", row.id);

    reportFromStatus(status);
    setPendingFlag(null);
    if (error) setFlagError(`Could not update ${row.artist || "this row"} · ${error.message}`);
    else await reload();
  }

  // Stale rows still render alongside the error (see LineupPage)
  const showContent = !loading && (rows.length > 0 || !error);

  const nextSortOrder = rows.length ? Math.max(...rows.map((r) => r.sort_order)) + 1 : 0;

  // Counted over the same set: sent-but-not-confirmed would otherwise let the
  // header read something impossible, like "3/2 tracks in".
  const confirmed = rows.filter((r) => r.confirmed).length;
  const sentAndConfirmed = rows.filter((r) => r.confirmed && r.sent).length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Header back />

      <SectionHeader
        sectionKey="compilation"
        meta={
          showContent &&
          rows.length > 0 && (
            <span className="whitespace-nowrap font-mono text-[11px] uppercase tracking-wider text-muted">
              {sentAndConfirmed}/{confirmed} tracks in
            </span>
          )
        }
      />

      {loading && <p className="font-mono text-[11px] uppercase tracking-wider text-muted">…</p>}
      {error && <LoadError message={error} stale={rows.length > 0} />}
      {flagError && <p className="mb-3 font-mono text-[11px] text-accent">{flagError}</p>}

      {showContent && (
        <>
          <div className="overflow-x-auto">
            <div className="min-w-[30rem]">
              <div className={`bar ${COLS}`}>
                <span>Artist</span>
                <span>Email</span>
                <span>Confirmed</span>
                <span>Sent</span>
              </div>

              {rows.length === 0 && editing !== "new" && (
                <p className="py-1 text-[11px] uppercase tracking-wider text-muted">
                  No artists yet
                </p>
              )}

              {rows.map((row) =>
                editing === row.id ? (
                  <ArtistForm
                    key={row.id}
                    artist={row}
                    nextSortOrder={nextSortOrder}
                    onDone={done}
                    onCancel={() => setEditing(null)}
                  />
                ) : (
                  <div key={row.id} className={`${COLS} items-baseline border-b border-fg/10 py-1`}>
                    <button
                      onClick={() => setEditing(row.id)}
                      disabled={!online}
                      className={`truncate text-left uppercase ${
                        online ? "hover:text-accent" : "cursor-default"
                      }`}
                    >
                      {row.artist || <span className="text-muted">untitled</span>}
                    </button>

                    <span className="truncate text-[11px] text-muted" title={row.email}>
                      {row.email || "—"}
                    </span>

                    <Flag
                      on={row.confirmed}
                      label="Confirmed"
                      disabled={!online}
                      pending={pendingFlag === `${row.id}:confirmed`}
                      onToggle={() => void toggle(row, "confirmed")}
                    />
                    <Flag
                      on={row.sent}
                      label="Sent"
                      disabled={!online}
                      pending={pendingFlag === `${row.id}:sent`}
                      onToggle={() => void toggle(row, "sent")}
                    />

                    {row.updated_by && (
                      <span className="col-span-4 text-[11px] text-muted/70">
                        └ {row.updated_by.split("@")[0]} · {relativeTime(row.updated_at)}
                      </span>
                    )}
                  </div>
                ),
              )}
            </div>
          </div>

          {editing === "new" && (
            <ArtistForm
              nextSortOrder={nextSortOrder}
              onDone={done}
              onCancel={() => setEditing(null)}
            />
          )}

          {online && editing !== "new" && (
            <button
              onClick={() => setEditing("new")}
              className="mt-2 font-mono text-[11px] uppercase tracking-wider text-muted hover:text-fg"
            >
              + Add
            </button>
          )}
        </>
      )}
    </div>
  );
}
