import { useCallback, useEffect, useState } from "react";
import { DAYS, STAGES } from "@/config";
import { supabase } from "@/lib/supabase";
import type { Slot } from "@/lib/types";
import { Header } from "@/components/layout/Header";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { SlotRow } from "@/components/lineup/SlotRow";
import { SlotForm } from "@/components/lineup/SlotForm";

type Editing = { kind: "edit"; id: string } | { kind: "new"; day: string; stage: string } | null;

export function LineupPage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Editing>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("slots")
      .select("*")
      .order("start_time", { ascending: true, nullsFirst: false })
      .order("sort_order", { ascending: true });

    if (error) setError(error.message);
    else {
      setSlots(data as Slot[]);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const done = () => {
    setEditing(null);
    void load();
  };

  // Cancelled slots stay in the data — the note explaining why is the point — but
  // they're folded out of the timetable so the schedule reads clean. Revealed per
  // stage, keyed `day|stage`.
  const [revealed, setRevealed] = useState<ReadonlySet<string>>(new Set());
  const toggleRevealed = (key: string) =>
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const confirmed = slots.filter((s) => s.status === "confirmed").length;
  const active = slots.filter((s) => s.status !== "cancelled").length;

  return (
    // Widens at lg so the three day columns have room; narrower pages stay at 3xl
    <div className="mx-auto max-w-3xl px-4 py-6 lg:max-w-6xl">
      <Header back />

      <SectionHeader
        sectionKey="lineup"
        meta={
          !loading &&
          !error && (
            <span className="whitespace-nowrap font-mono text-[11px] uppercase tracking-wider text-muted">
              {confirmed}/{active} confirmed
            </span>
          )
        }
      />

      {loading && <p className="font-mono text-[11px] uppercase tracking-wider text-muted">…</p>}
      {error && <p className="font-mono text-[11px] text-accent">{error}</p>}

      {/* One column per day side by side on desktop; stacked below lg. Stage bars
          deliberately don't align across columns — each day reads as its own unit,
          the way a printed timetable sets them. */}
      <div className="grid gap-x-6 gap-y-8 lg:grid-cols-3">
        {!loading &&
          !error &&
          DAYS.map((day) => (
            <section key={day.key}>
              <div className="bar mb-3 text-center">{day.label}</div>

              {STAGES.map((stage) => {
                const all = slots.filter((s) => s.day_key === day.key && s.stage_key === stage.key);
                const rows = all.filter((s) => s.status !== "cancelled");
                const cancelled = all.filter((s) => s.status === "cancelled");
                const stageKey = `${day.key}|${stage.key}`;
                const showCancelled = revealed.has(stageKey);
                const addingHere =
                  editing?.kind === "new" && editing.day === day.key && editing.stage === stage.key;

                return (
                  <div key={stage.key} className="mb-5">
                    <div className="bar mb-1">{stage.label}</div>

                    {rows.length === 0 && !addingHere && (
                      <p className="py-1 pl-2 text-[11px] uppercase tracking-wider text-muted">
                        Nothing programmed
                      </p>
                    )}

                    {rows.map((slot) =>
                      editing?.kind === "edit" && editing.id === slot.id ? (
                        <SlotForm
                          key={slot.id}
                          slot={slot}
                          dayKey={day.key}
                          stageKey={stage.key}
                          onDone={done}
                          onCancel={() => setEditing(null)}
                        />
                      ) : (
                        <SlotRow
                          key={slot.id}
                          slot={slot}
                          onEdit={() => setEditing({ kind: "edit", id: slot.id })}
                        />
                      ),
                    )}

                    {addingHere && (
                      <SlotForm
                        dayKey={day.key}
                        stageKey={stage.key}
                        onDone={done}
                        onCancel={() => setEditing(null)}
                      />
                    )}

                    <div className="mt-1 flex items-baseline gap-4 pl-2 font-mono text-[11px] uppercase tracking-wider">
                      {!addingHere && (
                        <button
                          onClick={() =>
                            setEditing({ kind: "new", day: day.key, stage: stage.key })
                          }
                          className="text-muted hover:text-fg"
                        >
                          + Add
                        </button>
                      )}
                      {cancelled.length > 0 && (
                        <button
                          onClick={() => toggleRevealed(stageKey)}
                          aria-expanded={showCancelled}
                          className="text-muted hover:text-fg"
                        >
                          {cancelled.length} cancelled {showCancelled ? "▴" : "▾"}
                        </button>
                      )}
                    </div>

                    {showCancelled &&
                      cancelled.map((slot) =>
                        editing?.kind === "edit" && editing.id === slot.id ? (
                          <SlotForm
                            key={slot.id}
                            slot={slot}
                            dayKey={day.key}
                            stageKey={stage.key}
                            onDone={done}
                            onCancel={() => setEditing(null)}
                          />
                        ) : (
                          <SlotRow
                            key={slot.id}
                            slot={slot}
                            onEdit={() => setEditing({ kind: "edit", id: slot.id })}
                          />
                        ),
                      )}
                  </div>
                );
              })}
            </section>
          ))}
      </div>
    </div>
  );
}
