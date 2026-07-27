import { useCallback, useEffect, useState } from "react";
import { DAYS, SLOT_STATUS, STAGES } from "@/config";
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

  const confirmed = slots.filter((s) => s.status === "confirmed").length;
  const active = slots.filter((s) => s.status !== "cancelled").length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
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

      {!loading &&
        !error &&
        DAYS.map((day) => (
          <section key={day.key} className="mb-8">
            <div className="bar mb-3 text-center">{day.label}</div>

            {STAGES.map((stage) => {
              const rows = slots.filter((s) => s.day_key === day.key && s.stage_key === stage.key);
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

                  {addingHere ? (
                    <SlotForm
                      dayKey={day.key}
                      stageKey={stage.key}
                      onDone={done}
                      onCancel={() => setEditing(null)}
                    />
                  ) : (
                    <button
                      onClick={() => setEditing({ kind: "new", day: day.key, stage: stage.key })}
                      className="mt-1 pl-2 font-mono text-[11px] uppercase tracking-wider text-muted hover:text-fg"
                    >
                      + Add
                    </button>
                  )}
                </div>
              );
            })}
          </section>
        ))}

      {!loading && !error && (
        <p className="border-t border-fg/15 pt-3 font-mono text-[11px] uppercase tracking-wider text-muted">
          {SLOT_STATUS.join(" → ")}
        </p>
      )}
    </div>
  );
}
