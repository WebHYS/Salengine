# SalesCoach Dashboard (MVP)

SalesCoach Dashboard is a Next.js + Prisma web app for door-to-door sales coaching. Admins can manage performance metrics and coaching notes, then generate AI tips. Managers get a read-only summary dashboard.

## Stack
- Next.js 14 App Router + TypeScript
- Tailwind CSS
- PostgreSQL + Prisma
- Cookie/JWT auth with roles (`ADMIN`, `MANAGER`)
- Zod validation
- Vitest unit tests

## Features
- Seller performance tracking (`Shift` CRUD)
- Coaching notes (`CoachingNote` CRUD)
- Admin dashboard + leaderboard
- Seller detail analytics (7/30 day stats + trend list)
- AI recommendations endpoint and persistence
- Manager read-only performance summary

## Setup (Development)
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start Postgres:
   ```bash
   docker compose up -d
   ```
3. Create env file:
   ```bash
   cp .env.example .env
   ```
4. Run Prisma migrations and seed:
   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed
   ```
5. Start the app:
   ```bash
   npm run dev
   ```
6. Login at `http://localhost:3000/login` with:
   - `admin@salescoach.local` / `admin1234`
   - `manager@salescoach.local` / `manager1234`

## Scripts
- `npm run dev` - start dev server
- `npm run build` - production build
- `npm run start` - run prod server
- `npm run test` - run unit tests

## Production Notes
- Set a strong `AUTH_SECRET`.
- Use managed Postgres and secure networking.
- Replace placeholder AI generation with a production LLM provider implementation.
- Add CSRF protection and hardened session policies for internet-facing deployment.

## Data Model
Prisma models implemented:
- `User`
- `Company`
- `Seller`
- `Shift`
- `CoachingNote`
- `AiRecommendation`

## AI Tips
`POST /api/sellers/:id/ai-tips` aggregates last 30 days shifts + last 20 coaching notes and stores:
```json
{
  "summary": "...",
  "top_3_issues": [],
  "coaching_plan_week": [],
  "suggested_script_lines": [],
  "metrics_to_track": []
}
```

If `OPENAI_API_KEY` is missing, a deterministic placeholder recommendation is returned.
