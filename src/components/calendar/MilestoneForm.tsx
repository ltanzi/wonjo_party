import { FormEvent, useState } from "react";
import { ITEM_STATUS } from "@/config";
import type { ItemStatus } from "@/config";
import type { Milestone } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { reportFromStatus } from "@/lib/useOnline";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";

interface Props {
  milestone?: Milestone; // absent = creating
  /** Pre-fills the window when adding inside an existing one. */
  defaultStart?: string;
  defaultEnd?: string;
  onDone: () => void;
  onCancel: () => void;
}

export function MilestoneForm({ milestone, defaultStart, defaultEnd, onDone, onCancel }: Props) {
  const [title, setTitle] = useState(milestone?.title ?? "");
  const [start, setStart] = useState(milestone?.start_date ?? defaultStart ?? "");
  const [end, setEnd] = useState(milestone?.end_date ?? defaultEnd ?? "");
  const [owner, setOwner] = useState(milestone?.owner ?? "");
  const [status, setStatus] = useState<ItemStatus>(milestone?.status ?? "todo");
  const [notes, setNotes] = useState(milestone?.notes ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    // A single-day item is a window of one, so an empty end mirrors the start
    // rather than tripping the not-null column.
    const payload = {
      title: title.trim(),
      start_date: start,
      end_date: end || start,
      owner: owner.trim() || null,
      status,
      notes: notes.trim(),
    };

    const { error, status: httpStatus } = milestone
      ? await supabase.from("milestones").update(payload).eq("id", milestone.id)
      : await supabase.from("milestones").insert(payload);

    reportFromStatus(httpStatus);
    setBusy(false);
    if (error) setError(error.message);
    else onDone();
  }

  async function onDelete() {
    if (!milestone) return;
    setBusy(true);
    const { error, status: httpStatus } = await supabase
      .from("milestones")
      .delete()
      .eq("id", milestone.id);
    reportFromStatus(httpStatus);
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
          <Label>From</Label>
          <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} required />
        </label>
        <label className="block">
          <Label>To</Label>
          <Input type="date" value={end} min={start} onChange={(e) => setEnd(e.target.value)} />
        </label>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2">
        <label className="block">
          <Label>Who</Label>
          <Input value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="—" />
        </label>
        <div>
          <Label>Status</Label>
          <Select
            aria-label="Status"
            value={status}
            onChange={(v) => setStatus(v as ItemStatus)}
            options={ITEM_STATUS}
          />
        </div>
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
        {milestone &&
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
