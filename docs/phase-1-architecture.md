# Phase 1 Architecture — Body Composition Scan (Data Collection)

## Existing project architecture

**Inspection result (2026-10-06):** The repository root (`BMA-MCP`) was empty — no framework, dependencies, Supabase config, authentication, or styling system were present.

Phase 1 therefore initializes a greenfield application in `body-mass-app/` using the preferred stack:

| Layer | Choice |
| --- | --- |
| Framework | Next.js (App Router) |
| UI | React + TypeScript (strict) |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Object storage | Supabase Storage (private bucket) |
| Auth | Deferred for Phase 1 local/research use (see Security) |
| State | React context for in-flow draft only (no Redux/Zustand) |
| Testing | Vitest |

---

## Proposed Phase 1 architecture

```text
Browser (App Router pages)
  └─ ScanWizardProvider (client draft: participant + local File blobs)
       ├─ /                     Landing
       ├─ /scan                 Redirect → /scan/participant
       ├─ /scan/participant     Participant form
       ├─ /scan/instructions    Photo instructions
       ├─ /scan/photo/[view]    Front | back | left | right
       ├─ /scan/review          Review + confirm
       ├─ /scan/submitting      Upload progress / retry
       ├─ /scans                History
       └─ /scans/[id]           Summary

Server (Route Handlers / Server Actions)
  └─ POST /api/scans            Create scan + upload images + scan_images rows
  └─ GET  /api/scans            List scans (history)
  └─ GET  /api/scans/[id]       Scan detail + signed image URLs (optional)

Supabase
  ├─ PostgreSQL: scans, scan_images
  └─ Storage bucket: body-scans (private)
```

### Design principles

1. **Data collection only** — no CV/ML, no body-fat estimates, no medical claims.
2. **Client holds draft photos as `File` blobs** until Confirm & Submit; permanent upload happens once.
3. **Server owns privileged Supabase access** — service role never exposed to the browser.
4. **Clear pipeline interface** for future analysis phases without coupling upload to AI.
5. **Mobile-first** capture/upload UX.

---

## Files / components to create

```text
docs/
  phase-1-architecture.md
  phase-1-completed.md

supabase/
  migrations/
    001_scans_and_storage.sql

src/
  app/
    layout.tsx
    page.tsx                          # Landing
    globals.css
    scan/
      layout.tsx                      # Wizard shell + provider
      page.tsx                        # Redirect
      participant/page.tsx
      instructions/page.tsx
      photo/[view]/page.tsx
      review/page.tsx
      submitting/page.tsx
    scans/
      page.tsx                        # History
      [id]/page.tsx                   # Summary
    api/
      scans/route.ts
      scans/[id]/route.ts

  components/
    layout/
      AppHeader.tsx
      Container.tsx
    ui/
      Button.tsx
      Field.tsx
      ProgressBar.tsx
      Alert.tsx
    scan/
      ParticipantForm.tsx
      PhotoInstructions.tsx
      PhotoStep.tsx
      SilhouetteGuide.tsx
      PhotoPreview.tsx
      ReviewGrid.tsx
      ScanSummaryCard.tsx
      ScanHistoryList.tsx

  lib/
    validation/
      participant.ts
      photo.ts
      views.ts
    bmi.ts
    types/
      scan.ts
    supabase/
      client.ts                       # Browser anon (future auth)
      server.ts                       # Server admin client
      types.ts                        # Generated/hand-written DB types
    analysis/
      pipeline.ts                     # Interface only — no fake impl
    scan/
      submit.ts                       # Server submission orchestration
      draft-context.tsx               # Client wizard state
      constants.ts

  test/
    participant.test.ts
    bmi.test.ts
    photo.test.ts
    views.test.ts
    submit.test.ts
```

---

## Database structure

### `scans`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID PK | `gen_random_uuid()` |
| `participant_id` | TEXT | Optional anonymized ID |
| `age` | INTEGER | 18–100 (app-validated) |
| `sex` | TEXT | `male` \| `female` \| `prefer_not_to_say` |
| `height_cm` | NUMERIC | |
| `weight_kg` | NUMERIC | |
| `status` | TEXT | Controlled set |
| `created_at` | TIMESTAMPTZ | default `now()` |
| `updated_at` | TIMESTAMPTZ | default `now()` |

**Status values:** `draft` | `uploading` | `submitted` | `saved` | `failed`

Constraints:

- `sex` CHECK
- `status` CHECK
- `age` CHECK (18–100) at DB level for defense in depth
- `height_cm` CHECK (100–230)
- `weight_kg` CHECK (30–300)

### `scan_images`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID PK | |
| `scan_id` | UUID FK → scans(id) ON DELETE CASCADE | |
| `view` | TEXT | `front` \| `back` \| `left` \| `right` |
| `storage_path` | TEXT | e.g. `{scan_id}/front.jpg` |
| `original_filename` | TEXT | nullable |
| `mime_type` | TEXT | |
| `file_size_bytes` | INTEGER | |
| `width` | INTEGER | nullable |
| `height` | INTEGER | nullable |
| `created_at` | TIMESTAMPTZ | |

Constraints:

- UNIQUE (`scan_id`, `view`)
- `view` CHECK

---

## Storage structure

- **Bucket:** `body-scans` (private)
- **Object path:** `{scan_id}/{view}.{ext}`  
  Example: `a1b2…/front.jpg`
- Access via server-side service role for Phase 1 uploads; signed URLs for later viewing if needed.
- Never public ACLs on body photos.

---

## Security decisions

1. **No authentication in Phase 1** — this is a private research / local data-collection tool. Documented deliberately rather than inventing weak auth.
2. **Architecture for auth later:**
   - Add `user_id UUID REFERENCES auth.users` to `scans`
   - RLS: `auth.uid() = user_id`
   - Browser uses anon key + user session; uploads via authenticated policies or keep server mediation
3. **Phase 1 RLS:** Policies deny direct anon/authenticated client access to tables/storage; all writes go through Next.js API routes using the **service role on the server only**.
4. **Never expose** `SUPABASE_SERVICE_ROLE_KEY` to client bundles.
5. Env via `.env.local` (gitignored); `.env.example` has placeholders only.

---

## Data flow (submission)

```text
1. User completes wizard (participant + 4 local Files)
2. Confirm & Submit → POST /api/scans (multipart)
3. Server validates fields + image metadata
4. Insert scans row (status = uploading)
5. Upload 4 objects to body-scans bucket
6. Insert 4 scan_images rows
7. Update status = saved (or failed + cleanup on partial failure)
8. Client redirects to /scans/[id]
```

**Partial failure:** If an image upload fails, mark scan `failed`, attempt storage cleanup for that scan prefix, return actionable error; client may retry (creates a new scan attempt or retry endpoint — Phase 1 uses explicit retry that re-submits).

---

## Future CV/ML integration points

Interface placeholder (no fake implementations):

```ts
interface BodyAnalysisPipeline {
  validateImages(input: ScanImages): Promise<ValidationResult>;
  extractPose(input: ScanImages): Promise<PoseResult>;
  segmentBody(input: ScanImages): Promise<SegmentationResult>;
  extractFeatures(input: ScanImages): Promise<BodyFeatures>;
  estimateBodyFat(input: BodyFeatures): Promise<BodyFatEstimate>;
}
```

Upload and persistence remain independent of this pipeline. Later phases can enqueue jobs after `status = saved`.

---

## Implementation plan

1. Initialize Next.js + Tailwind + TypeScript + Vitest
2. Supabase migration (tables, constraints, storage bucket, RLS)
3. Shared types, validation, BMI util, analysis interface
4. App shell + landing page
5. Scan wizard context + participant form
6. Instructions + four-photo steps + review
7. Submission API + summary + history
8. Tests, lint, typecheck, build
9. Document completion in `phase-1-completed.md`

---

## Validation ranges (documented assumptions)

These are Phase 1 product guards for adult experimental collection — not clinical standards:

| Field | Range | Rationale |
| --- | --- | --- |
| Age | 18–100 | Adult participants only for experimental dataset |
| Height | 100–230 cm | Covers typical adult stature; rejects obvious typos |
| Weight | 30–300 kg | Covers broad adult range; rejects obvious typos |
| Image size | 50 KB–15 MB | Reject empty/tiny and oversized uploads |
| Image dimensions | min 480×640 (either orientation) | Reject obviously unusable photos |

---

## Environment variables

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```
