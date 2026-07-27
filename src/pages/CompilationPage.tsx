import { useCallback, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { CompilationArtist } from "@/lib/types";
import { useTable } from "@/lib/useTable";
import { useOnline } from "@/lib/useOnline";
import { relativeTime } from "@/lib/time";
import { Header } from "@/components/layout/Header";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { ArtistForm } from "@/components/compilation/ArtistForm";

/**
 * The spreadsheet this replaces, as a page: Artist | Email | Confirmed | Sent.
 *
 * Its own screen rather than the generic board because the shape is an address
 * book with two flags, not a task with a status and a due date. The flags toggle
 * straight from the row — this is used like a spreadsheet, so flipping a cell
 * should not mean opening a form.
 *
 * Columns are fixed width and the table scrolls sideways on a narrow screen
 * rather than reflowing, which keeps it readable as a table.
 */
const COLS = "grid grid-cols-[1fr_1.5fr_4.5rem_4.5rem] gap-2";

function Flag({
  on,
  label,
  onToggle,
  disabled,
}: {
  on: boolean;
  label: string;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={on}
      aria-label={`${label}: ${on ? "yes" : "no"}`}
      className={`inline-block px-1 font-mono text-[11px] leading-tight ${
        on ? "bg-[#2E6B4F]/85 text-white" : "bg-[#8A8A8A]/85 text-fg"
      } ${disabled ? "cursor-default" : "hover:opacity-80"}`}
    >
      {on ? "yes" : "no"}
    </button>
  );
}

export function CompilationPage() {
  const fetcher = useCallback(
    () => supabase.from("compilation").select("*").order("sort_order", { ascending: true }),
    [],
  );

  const { rows, loading, error, reload } = useTable<CompilationArtist>("compilation", fetcher);
  const online = useOnline();
  const [editing, setEditing] = useState<string | "new" | null>(null);

  const done = () => {
    setEditing(null);
    void reload();
  };

  async function toggle(row: CompilationArtist, field: "confirmed" | "sent") {
    await supabase
      .from("compilation")
      .update({ [field]: !row[field] })
      .eq("id", row.id);
    void reload();
  }

  const sent = rows.filter((r) => r.sent).length;
  const confirmed = rows.filter((r) => r.confirmed).length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Header back />

      <SectionHeader
        sectionKey="compilation"
        meta={
          !loading &&
          !error &&
          rows.length > 0 && (
            <span className="whitespace-nowrap font-mono text-[11px] uppercase tracking-wider text-muted">
              {sent}/{confirmed} tracks in
            </span>
          )
        }
      />

      {loading && <p className="font-mono text-[11px] uppercase tracking-wider text-muted">…</p>}
      {error && <p className="font-mono text-[11px] text-accent">{error}</p>}

      {!loading && !error && (
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
                      onToggle={() => void toggle(row, "confirmed")}
                    />
                    <Flag
                      on={row.sent}
                      label="Sent"
                      disabled={!online}
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

          {editing === "new" && <ArtistForm onDone={done} onCancel={() => setEditing(null)} />}

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
