import { FormEvent, useState } from "react";
import { ITEM_STATUS } from "@/config";
import type { ItemStatus } from "@/config";
import type { Item } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";

interface Props {
  item?: Item; // absent = creating
  sectionKey: string;
  onDone: () => void;
  onCancel: () => void;
}

/** Empty date inputs must become SQL NULL, not '' — Postgres `date` rejects ''. */
const orNull = (v: string) => (v.trim() === "" ? null : v.trim());

export function ItemForm({ item, sectionKey, onDone, onCancel }: Props) {
  const [title, setTitle] = useState(item?.title ?? "");
  const [owner, setOwner] = useState(item?.owner ?? "");
  const [status, setStatus] = useState<ItemStatus>(item?.status ?? "todo");
  const [dueDate, setDueDate] = useState(item?.due_date ?? "");
  const [notes, setNotes] = useState(item?.notes ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const payload = {
      section_key: sectionKey,
      title: title.trim(),
      owner: orNull(owner),
      status,
      due_date: orNull(dueDate),
      notes: notes.trim(),
    };

    const { error } = item
      ? await supabase.from("items").update(payload).eq("id", item.id)
      : await supabase.from("items").insert(payload);

    setBusy(false);
    if (error) setError(error.message);
    else onDone();
  }

  async function onDelete() {
    if (!item) return;
    setBusy(true);
    const { error } = await supabase.from("items").delete().eq("id", item.id);
    setBusy(false);
    if (error) setError(error.message);
    else onDone();
  }

  return (
    <form onSubmit={onSubmit} className="border-l border-fg/40 bg-soft/40 py-3 pl-3 pr-2">
      <div className="mb-3">
        <Label>What</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus required />
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2">
        <label className="block">
          <Label>Who</Label>
          <Input value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="—" />
        </label>
        <label className="block">
          <Label>By when</Label>
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </label>
      </div>

      <div className="mb-3">
        <Label>Status</Label>
        <Select
          aria-label="Status"
          value={status}
          onChange={(v) => setStatus(v as ItemStatus)}
          options={ITEM_STATUS}
        />
      </div>

      <div className="mb-3">
        <Label>Notes</Label>
        <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      {error && <p className="mb-2 font-mono text-[11px] text-accent">{error}</p>}

      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={busy}>
          {busy ? "…" : "Save"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        {item &&
          (confirmingDelete ? (
            <span className="ml-auto flex items-baseline gap-2 font-mono text-[11px] uppercase tracking-wider">
              <span className="text-muted">Delete?</span>
              <button
                type="button"
                onClick={onDelete}
                disabled={busy}
                className="text-accent underline underline-offset-2 hover:no-underline"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                disabled={busy}
                className="text-muted hover:text-fg"
              >
                No
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              disabled={busy}
              className="ml-auto font-mono text-[11px] uppercase tracking-wider text-muted hover:text-accent"
            >
              Delete
            </button>
          ))}
      </div>
    </form>
  );
}
