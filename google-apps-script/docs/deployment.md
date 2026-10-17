# Deployment

## Local

```bash
cp env.example .env.local    # fill GOOGLE_APPS_SCRIPT_URL / GOOGLE_APPS_SCRIPT_SECRET
npm install
npm run dev                  # http://localhost:3000
npm run lint && npx tsc --noEmit && npm run build
```

Without the two variables `POST /api/bookings` answers `503` (the page still renders).

## Vercel

1. Import the repo; the project root is the repository root (where `package.json` is).
2. Add environment variables (Production + Preview): `GOOGLE_APPS_SCRIPT_URL`, `GOOGLE_APPS_SCRIPT_SECRET` (server-only; do **not** prefix with `NEXT_PUBLIC_`).
3. Deploy. The route handler sets `maxDuration = 30` (Apps Script can take several seconds).
4. Deploy the **new Apps Script version** at the same time – the request payload changed (`preferredDate` / `preferredTime`, no services), so the old script rejects it.

## Before going live (checklist)

- [ ] Confirm opening hours and slot size in `src/config/booking.config.ts`.
- [ ] Replace placeholder services/prices in `src/config/services.ts` (showcase only).
- [ ] Fill `src/config/salon.config.ts` (address, phone, hours text, social links).
- [ ] Spreadsheet + Apps Script deployed (see `apps-script-deployment.md`), `installTriggers` run.
- [ ] Submit a real test request, confirm the sheet row and the owner email, then delete the test row.
- [ ] Submit the same request again from the page and confirm it is saved as a second `Pending` row (same-time requests are allowed).
