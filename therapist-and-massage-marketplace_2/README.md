# Serenity — Therapist & Massage Marketplace

Serenity is a marketplace app for discovering and booking therapists, massage centers, spas,
wellness centers, chiropractors, and physiotherapy providers. It is built with the Next.js App
Router, React 19, TypeScript, Drizzle ORM, and PostgreSQL, and ships with English + Malay (Bahasa
Melayu) localization.

## Features

- **Public marketplace** — browse, search, and filter active providers by city, type, and keyword.
- **Provider detail pages** — services, weekly availability, reviews, and a live booking widget.
- **Booking** — customers pick a slot generated from a provider's availability (past slots and
  conflicts are excluded), then request a booking. Providers/admin confirm, decline, complete, or
  cancel.
- **Reviews** — customers can review completed appointments; provider ratings are recalculated.
- **Role-based accounts** — `customer`, `provider`, and `admin` with access controlled on every API
  route (JWT session cookies via `jose`, password hashing via `bcryptjs`).
- **Dashboards** — provider dashboard (business profile, services, availability, bookings) and an
  admin dashboard (users, providers, all bookings).
- **i18n** — English (served unprefixed) and Malay (`/ms/...`) via a locale-aware middleware and
  client context.

## Tech stack

| Layer | Tool |
| --- | --- |
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript 5.9 (strict) |
| Database | PostgreSQL + Drizzle ORM |
| Auth | `jose` JWT session cookies + `bcryptjs` |
| Validation | Zod |
| Styling | Tailwind CSS v4, `lucide-react` |

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment

Copy the example env file and set your values:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string (e.g. `postgresql://postgres:postgres@127.0.0.1:5432/app_db`) |
| `AUTH_SECRET` | Long random secret used to sign session tokens |

### 3. Start the database

For quick local dev you can boot a local PostgreSQL with a single command. The script reuses an
already-running Postgres if one is reachable at `DATABASE_URL`, otherwise it starts an **embedded
PostgreSQL** cluster (stored in `.pgdata`) and creates the `app_db` database:

```bash
# run in its own terminal (or as a background process)
npm run db:start

# later, shut the embedded cluster down with:
npm run db:stop
```

Alternatively, point `DATABASE_URL` at any existing Postgres and create the schema + seed yourself.

### 4. Create the schema

With the database running, push the Drizzle schema:

```bash
npm run db:push
```

or generate + apply migrations:

```bash
npm run db:generate
npm run db:migrate
```

### 5. Seed sample data

```bash
npm run seed
```

This creates demo accounts:

- Admin: `admin@serenity.app` / `password123`
- Customer: `amelia@example.com` / `password123`
- Provider: `harmony.wellness@example.com` / `password123`

### 6. Run the app

```bash
npm run dev
```

Open http://localhost:3000.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Type-check with `tsc --noEmit` |
| `npm run seed` | Seed the database with demo data |
| `npm run db:start` | Start (or reuse) a local/embedded PostgreSQL and create `app_db` |
| `npm run db:stop` | Stop the embedded PostgreSQL cluster |
| `npm run db:push` | Push the Drizzle schema to the database |
| `npm run db:generate` | Generate a Drizzle migration |
| `npm run db:migrate` | Apply Drizzle migrations |

## Database schema

`users`, `providers`, `services`, `availability`, `bookings`, and `reviews` — defined declaratively
in `src/db/schema.ts` with relations and foreign keys.
