import { useCallback, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Milestone } from "@/lib/types";
import { useTable } from "@/lib/useTable";
import { useOnline } from "@/lib/useOnline";
import { dateRange, isOverdue, monthKey, monthLabel, relativeTime } from "@/lib/time";
import { Header } from "@/components/layout/Header";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { LoadError } from "@/components/layout/LoadError";
import { SectionChip } from "@/components/calendar/SectionChip";
import { MilestoneForm } from "@/components/calendar/MilestoneForm";

type Editing = { kind: "edit"; id: string } | { kind: "new"; start?: string; end?: string } | null;

/**
 * The crew's plan as they write it: a month heading, then dated windows, then the
 * tasks inside each. Mirrors the line-up's structure — day bar, stage bar, rows —
 * so the two chronological pages read the same way.
 *
 * Grouping is derived from the dates rather than stored, so there is no separate
 * "period" entity to keep in step: two tasks sharing a window group because their
 * dates match.
 */
export function CalendarPage() {
  const fetcher = useCallback(
    () =>
      supabase
        .from("milestones")
        .select("*")
        .order("start_date", { ascending: true })
        .order("end_date", { ascending: true })
        .order("id", { ascending: true }),
    [],
  );

  const { rows, loading, error, reload } = useTable<Milestone>("milestones", fetcher);
  const online = useOnline();
  const [editing, setEditing] = useState<Editing>(null);

  const done = () => {
    setEditing(null);
    void reload();
  };

  // month → windows → tasks. Insertion order is already chronological because
  // the query sorted it, and both Map and object key order preserve that.
  const months = useMemo(() => {
    const byMonth = new Map<string, Map<string, Milestone[]>>();
    for (const row of rows) {
      const mk = monthKey(row.start_date);
      const wk = `${row.start_date}|${row.end_date}`;
      if (!byMonth.has(mk)) byMonth.set(mk, new Map());
      const windows = byMonth.get(mk)!;
      if (!windows.has(wk)) windows.set(wk, []);
      windows.get(wk)!.push(row);
    }
    return byMonth;
  }, [rows]);

  const showContent = !loading && (rows.length > 0 || !error);
  const finished = rows.filter((r) => r.status === "done").length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Header back />

      <SectionHeader
        sectionKey="calendar"
        meta={
          showContent &&
          rows.length > 0 && (
            <span className="whitespace-nowrap font-mono text-[11px] uppercase tracking-wider text-muted">
              {finished}/{rows.length} done
            </span>
          )
        }
      />

      {loading && <p className="font-mono text-[11px] uppercase tracking-wider text-muted">…</p>}
      {error && <LoadError message={error} stale={rows.length > 0} />}

      {showContent && (
        <>
          {rows.length === 0 && editing?.kind !== "new" && (
            <p className="py-1 text-[11px] uppercase tracking-wider text-muted">
              Nothing planned yet
            </p>
          )}

          {[...months.entries()].map(([mk, windows]) => (
            <section key={mk} className="mb-8">
              <div className="bar mb-3 text-center">{monthLabel(`${mk}-01`)}</div>

              {[...windows.entries()].map(([wk, tasks]) => {
                const [start, end] = wk.split("|");
                // A window is late only if something in it is still outstanding
                const late = isOverdue(end) && tasks.some((t) => t.status !== "done");

                return (
                  <div key={wk} className="mb-4">
                    <div
                      className={`mb-1 font-mono text-[11px] uppercase tracking-wider ${
                        late ? "text-accent" : "text-muted"
                      }`}
                    >
                      {dateRange(start, end)}
                      {late && " · overdue"}
                    </div>

                    {tasks.map((task) =>
                      editing?.kind === "edit" && editing.id === task.id ? (
                        <MilestoneForm
                          key={task.id}
                          milestone={task}
                          onDone={done}
                          onCancel={() => setEditing(null)}
                        />
                      ) : (
                        <button
                          key={task.id}
                          onClick={() => setEditing({ kind: "edit", id: task.id })}
                          disabled={!online}
                          className={`block w-full py-1 pl-2 pr-1 text-left ${
                            online ? "hover:bg-soft/60" : "cursor-default"
                          } ${task.status === "done" ? "text-muted" : ""}`}
                        >
                          <div className="grid grid-cols-[6.5rem_1fr] items-baseline gap-2">
                            <SectionChip sectionKey={task.section_key} />
                            <div className="flex flex-wrap items-baseline gap-x-2">
                              <span>
                                {task.title || <span className="text-muted">untitled</span>}
                              </span>
                              {/* Status as a word, not a second chip. The colour
                                  block is the area now, and two coloured chips
                                  drawn from one palette would read as two facts
                                  of the same kind. Mirrors SlotRow: done recedes,
                                  blocked shouts, todo is the silent default. */}
                              {task.status !== "todo" && (
                                <span
                                  className={`font-mono text-[11px] uppercase tracking-wider ${
                                    task.status === "blocked" ? "text-accent" : "text-muted"
                                  }`}
                                >
                                  · {task.status}
                                </span>
                              )}
                            </div>
                          </div>

                          {task.notes && (
                            <div className="grid grid-cols-[6.5rem_1fr] gap-2">
                              <span />
                              <span className="text-[11px] text-muted">{task.notes}</span>
                            </div>
                          )}

                          {task.updated_by && (
                            <div className="grid grid-cols-[6.5rem_1fr] gap-2">
                              <span />
                              <span className="text-[11px] text-muted/70">
                                └ {task.updated_by.split("@")[0]} · {relativeTime(task.updated_at)}
                              </span>
                            </div>
                          )}
                        </button>
                      ),
                    )}

                    {online && (
                      <button
                        onClick={() => setEditing({ kind: "new", start, end })}
                        className="mt-1 pl-2 font-mono text-[11px] uppercase tracking-wider text-muted hover:text-fg"
                      >
                        + Add here
                      </button>
                    )}
                  </div>
                );
              })}
            </section>
          ))}

          {editing?.kind === "new" && (
            <MilestoneForm
              defaultStart={editing.start}
              defaultEnd={editing.end}
              onDone={done}
              onCancel={() => setEditing(null)}
            />
          )}

          {online && editing?.kind !== "new" && (
            <button
              onClick={() => setEditing({ kind: "new" })}
              className="mt-2 font-mono text-[11px] uppercase tracking-wider text-muted hover:text-fg"
            >
              + Add a date
            </button>
          )}
        </>
      )}
    </div>
  );
}
