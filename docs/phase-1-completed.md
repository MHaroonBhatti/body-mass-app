# Phase 1 Completed — Body Composition Scan (Data Collection)

## What was implemented

Phase 1 delivers a polished **data-collection** web app (no CV/ML):

- Landing page with privacy-forward positioning and **Start a Scan** CTA
- Guided scan workflow:
  - Participant information (age, sex, height cm, weight kg, optional participant ID)
  - Photo instructions
  - Four photo steps (front / back / left / right) with silhouette guides
  - Client-side image validation (type, size, decode, dimensions)
  - Review grid with replace
  - Confirm & submit with retry on failure
- Scan summary (ID, date, height, weight, BMI + disclaimer, photos submitted)
- Scan history list
- Supabase schema + private `body-scans` storage migration
- Server-mediated uploads via service role (never exposed to the browser)
- Future `BodyAnalysisPipeline` interface placeholder (no fake implementations)
- Vitest coverage for BMI, participant validation, photo validation, views, submit helpers

Application code lives in **`body-mass-app/`** (repo root was empty at inspection).

## What remains (later phases)

- Authentication / per-user RLS ownership
- Body-fat estimation and CV pipeline (pose, segmentation, features)
- Signed URL photo viewing on summary
- Production hardening (rate limits, virus scanning, abuse controls)

## Known limitations

- **No auth in Phase 1** — intentional for local/research collection. API routes using the service role can read/write all scans; do not expose this deployment publicly without auth.
- Photos stay in browser memory/`File` objects until confirm; refreshing mid-flow loses photo drafts (participant fields persist in `sessionStorage`).
- HEIC/HEIF accepted by mime allowlist but may fail decode in some browsers.
- History is global (all scans) until user accounts exist.

## How to run locally

```bash
cd body-mass-app
cp .env.example .env.local
# Fill in Supabase values
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables required

| Variable | Where used | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Server (+ future browser) | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Future browser auth | Present for completeness; Phase 1 APIs use service role |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | **Never** commit or expose to client |

## Database migration instructions

1. Create a Supabase project.
2. Open **SQL Editor**.
3. Run `body-mass-app/supabase/migrations/001_scans_and_storage.sql`.
4. Confirm:
   - Tables `scans`, `scan_images`
   - Private bucket `body-scans`
   - RLS enabled (no anon allow policies)

Alternatively with Supabase CLI:

```bash
cd body-mass-app
supabase db push
```

## How to test

### Automated

```bash
cd body-mass-app
npm run test
npm run typecheck
npm run lint
npm run build
```

### Manual checklist

1. Complete a full scan with four photos
2. Replace a photo on a step and on review
3. Reject an invalid/tiny image
4. Submit without Supabase configured → clear error + retry path
5. Refresh during participant step (values restore) / during photos (photos reset)
6. Mobile portrait + desktop layout of capture controls
7. Open history and an individual scan summary

## Security decisions

- Body photos stored in a **private** bucket
- Client cannot read/write tables or storage under RLS
- All persistence goes through Next.js API routes with the service role
- Auth deferred and documented rather than inventing weak auth
