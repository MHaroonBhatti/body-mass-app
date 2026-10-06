# Development workflow (GitHub source of truth)

GitHub is the source of truth for this project. Local work should stay in sync with the remote, and `main` should remain stable.

## Branches

| Branch | Purpose |
| --- | --- |
| `main` | Stable production-ready code |
| `feature/...` | New work (example: `feature/phase-2-computer-vision`) |

Do not put experimental Phase work directly on `main`.

## Before starting a new phase

1. Pull latest `main`
2. Create a feature branch
3. Implement the work
4. Run tests (`npm run test`)
5. Run typecheck (`npm run typecheck`)
6. Run lint (`npm run lint`)
7. Run build (`npm run build`)
8. Review changes
9. Commit
10. Push the branch
11. Create a pull request into `main`
12. Merge only after validation

Example:

```bash
git checkout main
git pull origin main
git checkout -b feature/phase-2-computer-vision
# ... implement ...
npm run typecheck && npm run lint && npm run test && npm run build
git add -A
git commit -m "feat: ..."
git push -u origin HEAD
# open PR into main
```

## Small changes

A direct commit on a development/feature branch is fine for small fixes. `main` should still only receive reviewed, validated changes (preferably via PR).

## Cursor / agent rules

Before making substantial changes:

1. Inspect the current Git status
2. Inspect the current branch
3. Read relevant documentation
4. Do not overwrite existing work blindly
5. Keep changes scoped to the requested task
6. Preserve working functionality
7. Run validation before declaring the task complete

## Forbidden unless explicitly requested

Never silently:

- `git reset --hard`
- `git clean -fd`
- `git push --force`

Do not rewrite published history or delete remote branches without an explicit request.

## Secrets

Never commit:

- `.env` / `.env.local` / `.env.*.local`
- `SUPABASE_SERVICE_ROLE_KEY` or other API keys
- private credentials

Use `.env.example` for variable names only.
