import { FormEvent, useState } from "react";
import { FORMAT_KEYS, SLOT_STATUS } from "@/config";
import type { Format, SlotStatus } from "@/config";
import type { Slot } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { reportFromStatus } from "@/lib/useOnline";
import { toInputTime } from "@/lib/time";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { Autocomplete } from "@/components/ui/Autocomplete";

interface Props {
  slot?: Slot; // absent = creating
  dayKey: string;
  stageKey: string;
  /** Next free position in this stage; nothing set it before, so rows all tied at 0. */
  nextSortOrder: number;
  /**
   * Artist names from the COMPILATION list, for type-ahead only — never enforced.
   * Booking someone who isn't on that list is a normal case, not an error, so this
   * feeds Autocomplete (free text with hints) rather than the closed-set Select.
   */
  suggestions: string[];
  onDone: () => void;
  onCancel: () => void;
}

/** Empty time inputs must become SQL NULL, not '' — Postgres `time` rejects ''. */
const orNull = (v: string) => (v.trim() === "" ? null : v.trim());

export function SlotForm({
  slot,
  dayKey,
  stageKey,
  nextSortOrder,
  suggestions,
  onDone,
  onCancel,
}: Props) {
  const [artistName, setArtistName] = useState(slot?.artist_name ?? "");
  const [start, setStart] = useState(toInputTime(slot?.start_time ?? null));
  const [end, setEnd] = useState(toInputTime(slot?.end_time ?? null));
  const [format, setFormat] = useState<Format>(slot?.format ?? "live");
  const [status, setStatus] = useState<SlotStatus>(slot?.status ?? "idea");
  const [notes, setNotes] = useState(slot?.notes ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const payload = {
      day_key: dayKey,
      stage_key: stageKey,
      artist_name: artistName.trim(),
      start_time: orNull(start),
      end_time: orNull(end),
      format,
      status,
      notes: notes.trim(),
    };

    const { error, status: httpStatus } = slot
      ? await supabase.from("slots").update(payload).eq("id", slot.id)
      : await supabase.from("slots").insert({ ...payload, sort_order: nextSortOrder });

    reportFromStatus(httpStatus);
    setBusy(false);
    if (error) setError(error.message);
    else onDone();
  }

  // Confirmation is the inline two-step in the button row below, not window.confirm —
  // a browser dialog is the one popup no CSS can touch.
  async function onDelete() {
    if (!slot) return;
    setBusy(true);
    const { error, status: httpStatus } = await supabase.from("slots").delete().eq("id", slot.id);
    reportFromStatus(httpStatus);
    setBusy(false);
    if (error) setError(error.message);
    else onDone();
  }

  return (
    <form onSubmit={onSubmit} className="border-l border-fg/40 bg-soft/40 py-3 pl-3 pr-2">
      <div className="mb-3">
        <Label>Name</Label>
        <Autocomplete
          value={artistName}
          onChange={setArtistName}
          options={suggestions}
          aria-label="Name"
          autoFocus
          required
        />
      </div>

      {/* Two columns, fixed. Tailwind breakpoints track the viewport, not the
          container (no container-query plugin), so a responsive count could not
          see that this form sits in a day column 315-357px wide on desktop —
          992px or 1120px of content, three columns, 24px gaps. Two fit. */}
      <div className="mb-3 grid grid-cols-2 gap-2">
        <label className="block">
          <Label>Start</Label>
          <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} />
        </label>
        <label className="block">
          <Label>End</Label>
          <Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
        </label>
      </div>

      <div className="mb-3">
        <Label>Format</Label>
        <Select
          aria-label="Format"
          value={format}
          onChange={(v) => setFormat(v as Format)}
          options={FORMAT_KEYS}
        />
      </div>

      <div className="mb-3">
        <Label>Status</Label>
        <Select
          aria-label="Status"
          value={status}
          onChange={(v) => setStatus(v as SlotStatus)}
          options={SLOT_STATUS}
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
        {slot &&
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
