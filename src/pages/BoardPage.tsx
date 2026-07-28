import { useCallback, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { findSection } from "@/config";
import { supabase } from "@/lib/supabase";
import type { Item } from "@/lib/types";
import { useTable } from "@/lib/useTable";
import { useOnline } from "@/lib/useOnline";
import { Header } from "@/components/layout/Header";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { LoadError } from "@/components/layout/LoadError";
import { ItemRow } from "@/components/board/ItemRow";
import { ItemForm } from "@/components/board/ItemForm";

type Editing = { kind: "edit"; id: string } | { kind: "new" } | null;

/** The seven non-line-up sections, all the same board (SPEC.md, decision 11). */
export function BoardPage() {
  const { sectionKey } = useParams();
  const section = sectionKey ? findSection(sectionKey) : undefined;

  // Hooks must run unconditionally, so the redirect happens after them
  const key = section?.key ?? "";
  const fetcher = useCallback(
    () =>
      supabase
        .from("items")
        .select("*")
        .eq("section_key", key)
        .order("sort_order", { ascending: true })
        .order("id", { ascending: true }), // deterministic tiebreak (see LineupPage)
    [key],
  );

  const { rows, loading, error, reload } = useTable<Item>(`items:${key}`, fetcher);
  const online = useOnline();
  const [editing, setEditing] = useState<Editing>(null);
  const [showDone, setShowDone] = useState(false);

  if (!section) return <Navigate to="/" replace />;

  const done = () => {
    setEditing(null);
    void reload();
  };

  // Stale rows still render alongside the error (see LineupPage)
  const showContent = !loading && (rows.length > 0 || !error);

  // Append after the last row rather than tying at 0
  const nextSortOrder = rows.length ? Math.max(...rows.map((i) => i.sort_order)) + 1 : 0;

  // Completed work folds away, the same as cancelled slots on the line-up
  const open = rows.filter((i) => i.status !== "done");
  const finished = rows.filter((i) => i.status === "done");

  const renderRow = (item: Item) =>
    editing?.kind === "edit" && editing.id === item.id ? (
      <ItemForm
        key={item.id}
        item={item}
        sectionKey={section.key}
        nextSortOrder={nextSortOrder}
        onDone={done}
        onCancel={() => setEditing(null)}
      />
    ) : (
      <ItemRow
        key={item.id}
        item={item}
        disabled={!online}
        onEdit={() => setEditing({ kind: "edit", id: item.id })}
      />
    );

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Header back />

      <SectionHeader
        sectionKey={section.key}
        meta={
          showContent &&
          rows.length > 0 && (
            <span className="whitespace-nowrap font-mono text-[11px] uppercase tracking-wider text-muted">
              {finished.length}/{rows.length} done
            </span>
          )
        }
      />

      {loading && <p className="font-mono text-[11px] uppercase tracking-wider text-muted">…</p>}
      {error && <LoadError message={error} stale={rows.length > 0} />}

      {showContent && (
        <>
          {open.length === 0 && editing?.kind !== "new" && (
            <p className="py-1 text-[11px] uppercase tracking-wider text-muted">
              {finished.length > 0 ? "All done" : "Nothing here yet"}
            </p>
          )}

          {open.map(renderRow)}

          {editing?.kind === "new" && (
            <ItemForm
              sectionKey={section.key}
              nextSortOrder={nextSortOrder}
              onDone={done}
              onCancel={() => setEditing(null)}
            />
          )}

          <div className="mt-2 flex items-baseline gap-4 px-1 font-mono text-[11px] uppercase tracking-wider">
            {online && editing?.kind !== "new" && (
              <button
                onClick={() => setEditing({ kind: "new" })}
                className="text-muted hover:text-fg"
              >
                + Add
              </button>
            )}
            {finished.length > 0 && (
              <button
                onClick={() => setShowDone((s) => !s)}
                aria-expanded={showDone}
                className="text-muted hover:text-fg"
              >
                {finished.length} done {showDone ? "▴" : "▾"}
              </button>
            )}
          </div>

          {showDone && <div className="mt-1">{finished.map(renderRow)}</div>}
        </>
      )}
    </div>
  );
}
