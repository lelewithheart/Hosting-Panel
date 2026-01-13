# Open-Sourcing / Releasing Checklist

Before pushing this repository to a public Git host, follow this checklist to avoid leaking private data or branding you don't want to share.

## Must-do (Blockers)
- Secrets: Ensure no real secrets are tracked by git.
  - Verify with: `git ls-files | grep -E "(\.env$|\.env\.|\.pem$|certs/)" || true`
  - Backend secrets should only be in `backend/.env.example` (no `.env`).
  - Rotate any keys that may have been committed previously (Stripe, JWT, DB, etc.).
  - If secrets were committed, remove them and rewrite history: `git filter-repo` or `git filter-branch`.
- Certificates: Never commit private keys or real certs.
  - `backend/certs/` must not contain real `*.pem` files in git history.
  - Keep only a placeholder `README.md` in that folder.
- Build artifacts and deps:
  - Ensure `node_modules/`, `.next/`, `dist/`, `build/`, `coverage/` are not tracked.

## Branding
- Public brand: Check `dashboard/app/branding.ts` and `.env*` in `dashboard/`.
  - Use generic defaults or environment-driven values.
  - Remove `dashboard/.env.local` and `.env.production` from git; keep `.env.example` only.
- Domain/IPs: Replace real domains/IPs with placeholders in examples and docs.
  - See `deploy/nginx/aureliohost.conf` — uses placeholder `example.com` already.

## Payment (Stripe)
- Verify no live keys are committed.
  - Expected: only `STRIPE_SECRET` and `STRIPE_WEBHOOK_SECRET` placeholders in `backend/.env.example`.
  - At runtime, inject secrets via environment (or secret manager), never commit.

## Database
- `docker-compose.yml` may contain demo credentials — keep obviously non-production values and document.
  - Do not reuse in production.

## Pre-publish sanity checks
- Search for common secret patterns:
  - `git grep -I -n "BEGIN .*PRIVATE KEY|sk_live|whsec_|DATABASE_URL|JWT_SECRET|client_secret|Authorization: Bearer"`
- Use a scanner (optional but recommended):
  - `trufflehog filesystem --entropy=False --path .`
  - `gitleaks detect --source .`
- Confirm ignored files aren’t tracked:
  - `git status --ignored`

## After publishing
- Rotate any realistically exposed keys (better safe than sorry).
- Set repo topics and a clear `README.md` with local dev instructions using `.env.example` files.
