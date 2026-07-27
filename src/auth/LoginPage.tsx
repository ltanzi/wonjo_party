import { FormEvent, useState } from "react";
import { FESTIVAL } from "@/config";
import { useAuth } from "./AuthProvider";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";

export function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await signIn(email.trim(), password);
    if (error) setError(error);
    setBusy(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-xs">
        <h1 className="mb-1 font-mono text-lg uppercase tracking-widest">{FESTIVAL}</h1>
        <p className="mb-8 font-mono text-[11px] uppercase tracking-wider text-muted">
          15—17 January 2027 · Dallou
        </p>

        <label className="mb-4 block">
          <Label>Email</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
            autoFocus
          />
        </label>

        <label className="mb-6 block">
          <Label>Password</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {error && <p className="mb-4 font-mono text-[11px] text-accent">{error}</p>}

        <Button type="submit" disabled={busy} className="w-full">
          {busy ? "…" : "Enter"}
        </Button>
      </form>
    </div>
  );
}
