# BodyScan

Experimental web application for four-view body-composition analysis.

Phase 1 focuses on a polished **data-collection** workflow: participant details plus four standardized full-body photographs (front, back, left, right), stored privately in Supabase. Later phases will add computer vision and body-fat estimation as a range — none of that is implemented yet.

## Current status

**Phase 1 — Data Collection MVP**

## Tech stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase
- PostgreSQL
- Vitest

## Local development

```bash
cp .env.example .env.local
# Fill in Supabase values (see Environment variables)
# Apply the database migration (see Database)

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Validation commands

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

## Environment variables

Copy `.env.example` to `.env.local` and fill in real values. **Never commit `.env.local` or secrets.**

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key (reserved for future auth) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only key for Phase 1 API routes |

`.env.example` contains placeholder names only.

## Database

Apply the Supabase migration before submitting scans:

1. Open the Supabase SQL Editor (or use the Supabase CLI).
2. Run `supabase/migrations/001_scans_and_storage.sql`.
3. Confirm tables `scans` and `scan_images`, and private storage bucket `body-scans`.

## Current limitations

- No authentication yet
- No computer vision
- No body-fat estimation
- No machine learning
- No automatic height detection

Phase 1 only collects and stores scan data, and displays BMI as a simple weight-to-height metric (not body fat).

## Roadmap

| Phase | Focus |
| --- | --- |
| Phase 1 | Data collection |
| Phase 2 | Computer vision |
| Phase 3 | Height / calibration |
| Phase 4 | Body feature extraction |
| Phase 5 | Baseline estimation |
| Phase 6 | Dataset / model development |

## Documentation

- [Phase 1 architecture](./docs/phase-1-architecture.md)
- [Phase 1 completed](./docs/phase-1-completed.md)
- [Development workflow](./docs/development-workflow.md)

## Git / GitHub

`main` is the stable branch. Feature work happens on branches such as `feature/phase-2-computer-vision`, then merges via pull request. See [development workflow](./docs/development-workflow.md).
