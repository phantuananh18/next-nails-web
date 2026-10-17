# Architecture

```
Browser ─► Next.js client component (BookingRequestForm)
              │  POST /api/bookings
              ▼
        Next.js route handler  ── validate, rate-limit
              │  server-to-server POST (secret in body, HTTPS)
              ▼
        Apps Script Web App (Code.gs)
              ├─► Google Sheets: one worksheet per preferred date (DD-MM-YYYY)
              └─► MailApp: owner email (after the lock is released)
```

This is an **appointment request** system: the customer proposes a date/time, the owner phones to discuss services and confirm. See the root `README.md` for the full description and API.

| Concern | File |
|---|---|
| Hours, slot grid, advance window | `src/config/booking.config.ts` |
| Service showcase (informational) | `src/config/services.ts`, `src/components/ServicesSection.tsx` |
| Pure rules: date/time checks, validation | `src/lib/booking/{schedule,time,validation}.ts` |
| Apps Script client | `src/lib/booking/apps-script-gateway.ts` |
| HTTP endpoint | `src/app/api/bookings/route.ts` |
| UI | `src/components/booking/BookingRequestForm.tsx`, `src/app/page.tsx` |
| Backend script | `google-apps-script/Code.gs` |

## Responsibilities

- **Next.js** validates input (name, phone, date, time, opening hours, lead time, 30-day window) and forwards the request.
- **Apps Script** re-validates, de-duplicates by `requestId` and appends the row inside a `LockService` lock; the email is sent after the lock is released. It does **not** check for overlapping requests – several customers may ask for the same time.
- **Sheets** is the store; the owner edits `Status` / `ConfirmedTime` by hand.

## Authentication of Next.js → Apps Script

Apps Script web apps cannot read custom HTTP headers and an "Anyone" deployment cannot verify the caller's identity. The mechanism is a **shared secret in the POST body** (never in the URL), compared in constant time with the `API_SECRET` Script Property. Anyone who learns the `/exec` URL *and* the secret can call it; rotate both by changing the Script Property and the Vercel variable. Treat the script URL as private.

## Known limitations

- Rate limiting is in-memory and per server instance; on Vercel it only slows abuse on a warm instance.
- Apps Script latency is typically 1–3 s (cold starts longer); the response also waits for the owner email.
- Apps Script quotas apply (consumer account: ~100 emails/day).
- Email is at-least-once, not exactly-once.
- Idempotency is looked up in the preferred date's worksheet only; a reused `requestId` with a different phone/time is rejected (`REQUEST_ID_MISMATCH`).
- Because same-time requests are accepted, the owner must check the day's tab for clashes when confirming.
- The landing page is prerendered; the gallery strip (legacy .NET API) refreshes only on rebuild.
