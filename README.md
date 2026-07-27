# WONJO PARTY

Internal organising tool for **WONJO PARTY**, 15—17 January 2027, Dallou, Gambia.

Private tool for the crew, not a public festival site. Design decisions and their
reasoning live in [`SPEC.md`](./SPEC.md) — read that before changing anything structural.

Vite + React + TypeScript + Tailwind, static, talking directly to Supabase from the
browser. No server. Deployed free to GitHub Pages.

> **The repo is public. Never commit real data** — no artist names, contacts, fees or
> phone numbers. All of that lives in Supabase and only in Supabase. The seed file
> (`supabase/seed.sql`) is deliberately fictional; keep it that way.

## Setup

### 1. Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. **SQL Editor → New query** → paste [`supabase/schema.sql`](./supabase/schema.sql) → Run.
   Optionally run [`supabase/seed.sql`](./supabase/seed.sql) too, for fictional rows to
   check the rendering against.
3. **Authentication → Sign In / Providers → Email** → turn **Confirm email OFF**.
   There is no mail provider wired up; accounts are created by hand.
4. **Authentication → Users → Add user → Create new user**, with **Auto Confirm User**
   ticked. Two accounts for now — you and your friend. The other eight come in pass 2.
5. **Project Settings → API** → copy the **Project URL** and the **anon public** key.

### 2. Local development

```bash
cp .env.example .env.local     # paste the URL and anon key from step 5
npm install
npm run dev
```

### 3. GitHub Pages

1. Create the repo named **`wonjo_party`** — the name is baked into `base` in
   `vite.config.ts`, so a different name means editing that too.
2. **Settings → Secrets and variables → Actions → New repository secret**, twice:
   `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
   (Both end up in the public JS bundle regardless — the anon key is designed to be
   public and is inert without a login. Secrets here are tidiness, not security.)
3. **Settings → Pages → Source: GitHub Actions**.
4. Push to `main`. The workflow builds, copies `index.html` to `404.html` so deep links
   work, and deploys.

Live at `https://<your-username>.github.io/wonjo_party/`.

## Editing days, stages and sections

All in [`src/config.ts`](./src/config.ts) — labels, the eight squares, the status and
format vocabularies. Changing a label is a one-line edit and a push.

This is safe because the database stores the `key`, never the label. Renaming `PLAYA`
cannot orphan a slot. **Never change an existing `key`** without migrating the rows that
reference it.

## Status

**Pass 1 — done.** Auth, the eight-square home page, and the full line-up section.

**Pass 2 — not started.** The generic board across the other seven squares, and the
offline read cache with staleness banner. The other eight crew accounts get created at
the end of pass 2, not before — see decision 16 in `SPEC.md`.

## Commands

| | |
|---|---|
| `npm run dev` | dev server |
| `npm run build` | typecheck + production build to `dist/` |
| `npm run typecheck` | types only |
| `npm run preview` | serve the built `dist/` |
