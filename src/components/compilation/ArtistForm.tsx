import { FormEvent, useState } from "react";
import type { CompilationArtist } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { reportFromStatus } from "@/lib/useOnline";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";

interface Props {
  artist?: CompilationArtist; // absent = creating
  /** Next free position; nothing set it before, so rows all tied at 0. */
  nextSortOrder: number;
  onDone: () => void;
  onCancel: () => void;
}

export function ArtistForm({ artist, nextSortOrder, onDone, onCancel }: Props) {
  const [name, setName] = useState(artist?.artist ?? "");
  const [email, setEmail] = useState(artist?.email ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    // confirmed / sent are toggled straight from the row, not set here
    const payload = { artist: name.trim(), email: email.trim() };
    const { error, status } = artist
      ? await supabase.from("compilation").update(payload).eq("id", artist.id)
      : await supabase.from("compilation").insert({ ...payload, sort_order: nextSortOrder });

    reportFromStatus(status);
    setBusy(false);
    if (error) setError(error.message);
    else onDone();
  }

  async function onDelete() {
    if (!artist) return;
    setBusy(true);
    const { error, status } = await supabase.from("compilation").delete().eq("id", artist.id);
    reportFromStatus(status);
    setBusy(false);
    if (error) setError(error.message);
    else onDone();
  }

  return (
    <form onSubmit={onSubmit} className="border-l border-fg/40 bg-soft/40 py-3 pl-3 pr-2">
      <div className="mb-3 grid gap-2 sm:grid-cols-2">
        <label className="block">
          <Label>Artist</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus required />
        </label>
        <label className="block">
          <Label>Email</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="off"
          />
        </label>
      </div>

      {error && <p className="mb-2 font-mono text-[11px] text-accent">{error}</p>}

      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={busy}>
          {busy ? "…" : "Save"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        {artist &&
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
