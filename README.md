# Nūr Salah — Prayer Tracker

A calm, mobile-first web app for tracking the five daily prayers, built on the
"Serene Nūr" design system.

## Stack

- **Next.js 16** (App Router, Turbopack, Server Actions)
- **Prisma 7** + Postgres (via `@prisma/adapter-pg`) — provisioned on Prisma Postgres
- **NextAuth v5** (Credentials provider, JWT sessions) for multi-user auth
- **Tailwind CSS v4** — design tokens (light/dark) live in `src/app/globals.css`
- **Aladhan API** for real, location-based prayer times (see below)

## Getting started

```bash
npm install
cp .env.example .env   # then set DATABASE_URL and AUTH_SECRET (see comments in the file)
npx prisma migrate dev
npm run dev
```

`DATABASE_URL` needs a real Postgres connection string. The fastest way to get
one: [console.prisma.io](https://console.prisma.io) → create a project → copy
the **direct** connection string for local dev (use the **pooled** one in
serverless/production, e.g. Vercel, to avoid exhausting connections).

## Deploying (Vercel)

1. Push this repo to GitHub.
2. Import it in Vercel.
3. Set environment variables in the Vercel project: `DATABASE_URL` (the
   **pooled** Prisma Postgres connection string) and `AUTH_SECRET`.
4. Deploy. Migrations aren't run automatically — after the first deploy (or
   whenever the schema changes), run `npx prisma migrate deploy` locally
   against the production `DATABASE_URL`, or wire it into a CI step.

## How it's organized

- `prisma/schema.prisma` — `User` and `PrayerLog` models. A `PrayerLog` is
  unique per `(userId, date, prayer)`; date is stored as a `YYYY-MM-DD` string.
- `src/lib/scoring.ts` — the five prayers, statuses, and the points table
  (on time +5, late +1, Fajr on time +15, not performed -5 → 35-point daily max).
- `src/lib/data.ts` — read-side queries: today's log, history, streaks, and
  the daily/weekly/monthly/overall stats used by the Stats page.
- `src/lib/actions/*` — Server Actions for auth, logging a prayer, updating
  settings, and setting the theme.
- `src/lib/prayer-times.ts` — fetches real prayer times from the Aladhan API
  for a user's `city`/`country` + calculation method/madhab, and works out
  which prayers are unlocked yet today.
- `src/lib/auth.config.ts` vs `src/lib/auth.ts` — the config is split so
  `proxy.ts` (Next's middleware/edge runtime) never has to load Prisma or
  bcrypt, which need the Node.js runtime.
- `src/app/(auth)/*` — sign in / sign up (public).
- `src/app/(app)/*` — Today, History, Stats, Settings (behind auth).

## Scope decisions / what's simplified

- **Prayer times require a City + Country in Settings.** Without one, prayer
  windows fall back to static labels ("Before sunrise", "Midday", …) and
  nothing is locked. With a location set, each prayer's three status buttons
  stay disabled until that prayer's real time (per the Aladhan API, using the
  chosen calculation method/madhab) actually begins — already-logged prayers
  stay editable regardless. "Today" for fetching times is the **server's**
  calendar date, not the location's, so there's a small chance of an
  off-by-one day right at midnight if they're in very different timezones.
- **A prayer only has a status once you tap it** (and its time has started).
  There's no automatic "missed" marking for a prayer whose window has passed;
  the three buttons (On Time / Late / Not Performed) are the only way a log
  gets created.
- **Streak definition:** a day counts toward a streak if all five prayers
  were logged as On Time or Late (i.e. none missed, none skipped). "Current
  streak" walks backward from today and doesn't break on an in-progress today.
- **Theme preference is per-account** (stored on `User.theme`), not a
  device-local cookie — it follows you across sign-ins, and defaults to
  the OS `prefers-color-scheme` until a user picks Light or Dark explicitly.
- Auth is session-only (JWT), no email verification or password reset flow.

## Design system

The Stitch project (`stitch.withgoogle.com/projects/888051854653635968`) has
the full "Serene Nūr" design system and mobile/desktop screen mocks this app
was built from — colors, type scale, and card/status styling in
`src/app/globals.css` mirror it directly (light mode tokens in `:root`, dark
mode under `.dark` / `prefers-color-scheme: dark`).
