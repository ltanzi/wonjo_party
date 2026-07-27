import { FormEvent, useState } from "react";
import { FORMATS, SLOT_STATUS } from "@/config";
import type { Format, SlotStatus } from "@/config";
import type { Slot } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { toInputTime } from "@/lib/time";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Field";

interface Props {
  slot?: Slot; // absent = creating
  dayKey: string;
  stageKey: string;
  onDone: () => void;
  onCancel: () => void;
}

/** Empty time inputs must become SQL NULL, not '' — Postgres `time` rejects ''. */
const orNull = (v: string) => (v.trim() === "" ? null : v.trim());

export function SlotForm({ slot, dayKey, stageKey, onDone, onCancel }: Props) {
  const [artistName, setArtistName] = useState(slot?.artist_name ?? "");
  const [start, setStart] = useState(toInputTime(slot?.start_time ?? null));
  const [end, setEnd] = useState(toInputTime(slot?.end_time ?? null));
  const [format, setFormat] = useState<Format>(slot?.format ?? "live");
  const [country, setCountry] = useState(slot?.country ?? "");
  const [status, setStatus] = useState<SlotStatus>(slot?.status ?? "idea");
  const [notes, setNotes] = useState(slot?.notes ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      country: orNull(country.toUpperCase()),
      status,
      notes: notes.trim(),
    };

    const { error } = slot
      ? await supabase.from("slots").update(payload).eq("id", slot.id)
      : await supabase.from("slots").insert(payload);

    setBusy(false);
    if (error) setError(error.message);
    else onDone();
  }

  async function onDelete() {
    if (!slot) return;
    if (!confirm(`Delete "${slot.artist_name || "untitled"}"?`)) return;
    setBusy(true);
    const { error } = await supabase.from("slots").delete().eq("id", slot.id);
    setBusy(false);
    if (error) setError(error.message);
    else onDone();
  }

  return (
    <form onSubmit={onSubmit} className="border-l border-fg/40 bg-soft/40 py-3 pl-3 pr-2">
      <div className="mb-3">
        <Label>Name</Label>
        <Input
          value={artistName}
          onChange={(e) => setArtistName(e.target.value)}
          autoFocus
          required
        />
      </div>

      {/* Fixed at two columns: Tailwind breakpoints track the viewport, not the
          container, so sm:grid-cols-4 would cram four fields into a ~380px day
          column on desktop. Two columns fit everywhere this form appears. */}
      <div className="mb-3 grid grid-cols-2 gap-2">
        <label className="block">
          <Label>Start</Label>
          <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} />
        </label>
        <label className="block">
          <Label>End</Label>
          <Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
        </label>
        <label className="block">
          <Label>Format</Label>
          <Select value={format} onChange={(e) => setFormat(e.target.value as Format)}>
            {FORMATS.map((f) => (
              <option key={f.key} value={f.key}>
                {f.key}
              </option>
            ))}
          </Select>
        </label>
        <label className="block">
          <Label>Country</Label>
          <Input
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            maxLength={3}
            placeholder="GM"
          />
        </label>
      </div>

      <div className="mb-3">
        <Label>Status</Label>
        <Select value={status} onChange={(e) => setStatus(e.target.value as SlotStatus)}>
          {SLOT_STATUS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
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
        {slot && (
          <button
            type="button"
            onClick={onDelete}
            disabled={busy}
            className="ml-auto font-mono text-[11px] uppercase tracking-wider text-muted hover:text-accent"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
