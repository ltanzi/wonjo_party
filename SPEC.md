# WONJO PARTY — internal ops web

Spec agreed 27 July 2026. Ready to hand to a build session.

## What this is

A private, internal organising tool for the crew running **WONJO PARTY**, the first
edition of a festival at a house being built in Dallou, Gambia.
**15–17 January 2027** (Friday, Saturday, Sunday).

Roughly **10 people**, each responsible for one area, all able to edit anything.
Not a public festival site. Not a promo page. A working tool.

Data volume is small. No file storage needed.

## Decisions

Each of these was argued through; the rationale matters as much as the choice.

| # | Decision | Why |
|---|---|---|
| 1 | **Internal only**, not public-facing | Contains contacts, fees, arrival times. A public version can be exported later once the line-up locks. |
| 2 | **Static frontend + Supabase**, edits happen in the web | Crew are non-technical; nobody can be asked to open a pull request. Browser talks to Supabase directly — no server to maintain. |
| 3 | **Email + password**, 10 accounts provisioned by hand | Supabase's built-in mailer is rate-limited and not production-grade; provisioning manually avoids needing any mail infrastructure at all. Email confirmation OFF. Password resets done by hand in the dashboard. |
| 4 | **Flat permissions + attribution** | Ten friends, not adversaries. The real risk is "who changed the set time", solved by `updated_by`, not by locks. Hard locks fail worst at 2am on-site. One RLS policy, no roles table. |
| 5 | **Vite + React + TS + Tailwind → GitHub Pages** | Whole app is behind a login: no SEO, no SSR value. It's an SPA. Next.js would be config overhead for zero gain. |
| 6 | **Public repo** | GitHub Pages free tier requires it. Safe — the Supabase anon key is designed to be public and is inert without a login. **Hard rule: no real data in git, ever.** |
| 7 | **Line-up tracks booking status**, not just the finished schedule | A poster-only view is useless until the line-up is done, and the real work happens in the messy middle. Single `slots` table — artists are not a separate entity. |
| 8 | **Stacked lists** per stage (reference layout), grid deferred | Times get decided last; a time-proportional grid is empty for months. Stacked degrades gracefully when `start_time` is null. Schema supports adding a two-column grid later with no migration. |
| 9 | **Days and stages hardcoded** in config | User's call. Mitigated by storing stable slug keys in the DB (see below) so renaming a label can't orphan data. |
| 10 | **Line-up covers all programming**, not only music | Workshops, talks, film, ceremony need a home, or the app's schedule won't match the schedule on the wall. |
| 11 | **One generic board** for the other seven squares | Every non-line-up section is the same shape: things with an owner, a state, and notes. One component, seven sections. Whole grid alive on day one. |
| 12 | **Eight squares** (see below) | Budget and Dallou/Site were added during the interview — money is the #1 first-festival risk, and the house build overlaps the festival timeline. |
| 13 | **Cached reads, writes blocked offline**, staleness banner | The highest-stakes moment (backstage, 22:40, one bar of signal) is a *read*. Offline writes would mean conflict resolution for a problem that barely occurs. |
| 14 | **Plain labelled squares** on the home page | User's call — the boldest, most beautiful version. Tile component takes an unused optional subtitle slot so live counts are a one-line addition later. |
| 15 | **English, no i18n** | Gambia's official language is English; the brutalist style means ~30 words of UI chrome total. |
| 16 | **Two passes, invite nobody until both land** | Decision 11 was made so the crew's first impression isn't a dead grid — that only holds if they're invited once. |

### Explicitly accepted trade-offs

- **Budget is visible to all ten people.** Confirmed acceptable — the ten are trusted.
- **Renames and date changes require a deploy by you.** Consequence of decision 9.
  Kept cheap by the slug-key design.
- **Supabase free projects pause after ~7 days of zero activity.** One click to wake.
  An actively-organising crew won't hit it; a quiet month before the festival might.
- **No comments or discussion.** The `notes` field is it. Discussion stays in WhatsApp.
  Low risk here: in practice each section is held by **one person at most**, so the app is
  eight mostly-solo workspaces rather than a shared real-time surface. That also means the
  quiet home page (decision 14) costs less than it would on a genuinely collaborative tool —
  people come to *their* square, not to watch others move.
- **Considered and rejected:** Notion (free tier does most of this — building anyway for
  design control and because it's a gift), Google Sheets as CMS (splits the tool in two),
  Apps Script write-back (worst of both worlds), full offline-first sync (a project of its own).

## Squares

Eight, in home-page order. Line-up is bespoke; the other seven are the same board component.

```
LINE-UP        PRODUCTION     LOGISTICS      COMMUNICATION
COMPILATION    BUDGET         DALLOU / SITE  TEAM
```

## Data model

Two tables. Days, stages and sections are config, not data.

```
slots                              -- LINE-UP only
  id            uuid pk
  day_key       text               -- 'day-1' | 'day-2' | 'day-3'
  stage_key     text               -- 'stage-1' | 'stage-2'
  start_time    time null          -- null until scheduling happens
  end_time      time null
  format        text               -- see FORMATS
  artist_name   text
  country       text null          -- 'GM', 'SN', … optional; blank renders nothing
  status        text               -- see SLOT_STATUS
  notes         text
  sort_order    int                -- ordering within a stage when times are null
  updated_by    text               -- email
  updated_at    timestamptz

items                              -- all seven other squares
  id            uuid pk
  section_key   text               -- 'production' | 'logistics' | …
  title         text
  owner         text null          -- free text; a name, not a user FK
  status        text               -- see ITEM_STATUS
  notes         text
  due_date      date null
  sort_order    int
  updated_by    text
  updated_at    timestamptz
```

**Slug keys are load-bearing.** `day_key` / `stage_key` / `section_key` are stable strings,
never array indices and never display names. Renaming `"Stage 1"` → `"Mango Tree"` in config
must not touch a single row.

### RLS

One policy per table: authenticated users may `select`, `insert`, `update`, `delete`.
Anonymous users get nothing. `updated_by` / `updated_at` set by trigger from `auth.jwt()`,
not trusted from the client.

## Config constants

`src/config.ts` — the whole "hardcoded" surface, deliberately in one file.

```ts
FESTIVAL = 'WONJO PARTY'

DAYS = [
  { key: 'day-1', label: 'Friday 15 January' },
  { key: 'day-2', label: 'Saturday 16 January' },
  { key: 'day-3', label: 'Sunday 17 January' },
]

STAGES = [
  { key: 'stage-playa', label: 'PLAYA' },
  { key: 'stage-isla',  label: 'ISLA'  },
]

SECTIONS = [
  { key: 'lineup',        label: 'LINE-UP',       bespoke: true },
  { key: 'production',    label: 'PRODUCTION'    },
  { key: 'logistics',     label: 'LOGISTICS'     },
  { key: 'communication', label: 'COMMUNICATION' },
  { key: 'compilation',   label: 'COMPILATION'   },
  { key: 'budget',        label: 'BUDGET'        },
  { key: 'site',          label: 'DALLOU / SITE' },
  { key: 'team',          label: 'TEAM'          },
]

SLOT_STATUS  = ['idea', 'contacted', 'confirmed', 'cancelled']
ITEM_STATUS  = ['todo', 'doing', 'done', 'blocked']

FORMATS = [                         // weight drives the badge style
  { key: 'live',        weight: 'plain' },
  { key: 'Dj',          weight: 'plain' },
  { key: 'performance', weight: 'plain' },
  { key: 'workshop',    weight: 'solid' },
  { key: 'talk',        weight: 'solid' },
  { key: 'film',        weight: 'solid' },
  { key: 'A/V',         weight: 'accent' },
]
```

Badge weights follow one rule, no arbitrary cases: **plain** = evening stage acts (the
majority — badges everywhere would be noise), **solid** (white on `#1A1A1A`) = daytime
programming, **accent** (white on `#E63B2E`) = the special one. Same logic as the Sónar
reference.

## Design

Ported from `../xarxa`. It already reads as the same language as the Sónar timetable
reference in `reference/` — black bars, mono type, red tags.

```
bg      #EDE8E0    warm paper
fg      #1A1A1A    near-black
muted   #8A8A8A
accent  #E63B2E    red — reserved for A/V, cancelled, blocked, overdue
soft    #E0DBD2

font    Inconsolata (next/font → @fontsource or Google Fonts link), 13px, line-height 1.6
radius  0 everywhere — hard edges, no exceptions
texture SVG fractal-noise overlay on <html> at 0.035 opacity (copy from xarxa globals.css)
labels  uppercase, tracking-wider, 11px for micro-labels
```

`Button`, `Badge`, `Input`, `Select`, `Textarea` in `xarxa/src/components/ui/` are plain
React with no Next.js dependency — copy them across verbatim.

### Line-up rendering

Matches the reference. Day bar, then per stage a bar, then rows.

```
██ SATURDAY 16 JANUARY ██████████████████████

██ PLAYA █████████████████████████████████████
 10.00-12.00  workshop   KORA BASICS
 17.00-18.00  talk       BUILDING DALLOU
 21.00-22.00  live       FATOU N. (GM)
┆      —      Dj       ? SIRA B. (SN)          ← contacted: dashed, muted
└ lamin · 2h ago
```

- `confirmed` renders solid, exactly like the reference.
- `idea` / `contacted` render ghosted: dashed border, muted text, leading `?`.
- `cancelled` renders struck through in accent red.
- Null times render as `—`; rows fall back to `sort_order`.
- Attribution is a quiet grey line under the row.
- Section header reads `LINE-UP · kept by <name>` — social ownership, not enforced.

## Offline behaviour

- Every successful fetch writes to `localStorage`, keyed by table.
- On load: render cache immediately, then revalidate in the background.
- Offline: render cache with a top banner — `OFFLINE · LAST SYNCED 14.20` — and all edit
  controls disabled. No write queue, no conflict resolution.
- PWA install (service worker + manifest) is a clean later addition; the caching layer
  being built now is the hard part.

## Build sequence

Nobody outside you and your friend gets an account until Pass 2 ships.

### Pass 1 — skeleton + line-up
1. Vite + React + TS + Tailwind scaffold, xarxa theme ported, Inconsolata wired up.
2. GitHub Actions → Pages, including `cp dist/index.html dist/404.html` for SPA routing.
   Vite `base` must be `/wonjo_party/`.
3. Supabase project, both tables, RLS policy, `updated_by` trigger. Two accounts.
4. Login screen. Auth guard on everything.
5. Home page: eight plain squares.
6. Line-up: full CRUD, three days, two stages, status, format badges, attribution.

Stop here and get your friend to actually use it. Line-up is the only bespoke screen and
the one you have opinions about — if the design language is wrong, this is when to find
out, not after it's replicated seven more times.

### Pass 2 — boards + offline + handover ✅ built
7. Generic board component wired to the seven remaining sections.
8. Offline read cache + staleness banner.
9. Provision the remaining eight accounts, hand over. ← still to do

### What changed during the build

Decisions that were revised in use, and why:

- **Country dropped** from slots entirely. The festival is largely regional; the field
  was blank or `(GM)` on nearly every row.
- **Format badges became seven inks** rather than three shared weights, so the shape of
  a day reads by colour. Held at 85%; below that several pairings fall under 4.5:1.
- **No margin rules.** The dashed left rule marking unconfirmed slots was removed —
  muted colour plus the status word already carry it, and a third marker was noise.
- **Cancelled and done fold away** behind a `N cancelled` / `N done` reveal rather than
  sitting in the list. Same pattern in both places.
- **Native popups replaced.** `window.confirm` became an inline two-step; `<select>`
  became a custom listbox, since a native one hands its dropdown to the OS. Time inputs
  keep the native picker deliberately — it is the better control on a phone.
- **Days laid side by side** on desktop, one column each.

Estimate was 3–4 days of focused work; that held.

## Open items

- **Seed data must be fictional.** Public repo — see decision 6.
- **Deferred by choice, all cheap to add later:** two-column time grid, live counts on the
  home squares, activity feed, PWA install, per-item owner on line-up slots.
