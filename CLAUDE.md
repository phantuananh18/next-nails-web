# CLAUDE.md — 2IN.CORNER

Authoritative instructions for Claude Code in this repository. Setup, API reference and deployment live in [`README.md`](README.md); do not duplicate them here.

## 1. Project identity

- **2IN.CORNER**: landing page + online **appointment requests** for a nail salon.
- **MVP scope:** guests submit a **preferred date and time** plus name, phone and optional notes. They do **not** choose services. Requests land in Google Sheets; the owner is emailed, phones the customer to discuss services, and confirms by hand. No accounts, payments or customer emails.
- **Users:** customers (Vietnamese-speaking, mostly mobile) and the salon owner (works in Google Sheets).
- **Architecture:** Browser → Next.js client component → `POST /api/bookings` route handler → Google Apps Script web app → Google Sheets + owner email (MailApp).

## 2. Technology stack

**Next.js-first MVP**: Next.js 16 (App Router), React 19, TypeScript (strict), Tailwind CSS v4, ESLint 9, Google Apps Script (V8), Google Sheets, MailApp. There is **no backend API, database or authentication** in this repository.

The former ASP.NET Core/SQLite API (never in this repo) and its frontend client, account pages and old booking form were removed from the site. **Do not reintroduce .NET API dependencies, authentication or database infrastructure without explicit approval**, and avoid adding backend layers the MVP does not need. Marketing content (services, gallery, testimonials, contact info) stays in static TypeScript config under `src/config/`.

This Next.js version has breaking changes versus older releases: consult `node_modules/next/dist/docs/` before using framework APIs.

## 3. Repository structure (where to look)

| Need | Path |
|---|---|
| Landing page / layout / design tokens | `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/globals.css` |
| Request form (client) | `src/components/booking/BookingRequestForm.tsx` |
| Service showcase (informational) | `src/components/ServicesSection.tsx` |
| Top info bar (hours/address/phone, above navbar) | `src/components/TopInfoBar.tsx` |
| Zalo / phone CTAs | `src/components/ContactButtons.tsx`, `StickyContactBar.tsx`, `src/lib/contact.ts` |
| Shared UI | `src/components/` (`Header`, `Footer`, `form.tsx`, `Testimonials`, `BeforeAfter`) |
| API route | `src/app/api/bookings/route.ts` |
| Configuration | `src/config/booking.config.ts` (hours, slot grid, advance window), `services.ts` (price menu categories; display-only price strings, no calculation), `gallery.ts` (empty), `salon.config.ts` (single source of salon contact info; phone, Zalo, address, hours text and Google Maps URL come from `NEXT_PUBLIC_*` env vars, rest empty), `showcase.ts` (empty) |
| Request logic (pure) | `src/lib/booking/{schedule,time,validation}.ts` |
| Orchestration / server I/O | `src/lib/booking/booking-service.ts`, `apps-script-gateway.ts`, `rate-limit.ts` |
| Formatting | `src/lib/format.ts` |
| Apps Script backend + setup docs | `google-apps-script/Code.gs`, `appsscript.json`, `google-apps-script/docs/` |
| Env template | `env.example` |

## 4. Architecture rules

Claude MUST:

- Read the relevant code before changing it; follow existing conventions and reuse existing components/config.
- Keep UI and business logic separated (rules in `src/lib/booking`, not in components).
- Keep sensitive operations server-side; only the route handler talks to Apps Script.
- Preserve existing API contracts (`POST /api/bookings`: payload, codes, HTTP statuses).
- Avoid new dependencies, unrelated refactors and destructive data changes.
- Explain the impact of significant architectural changes **before** making them.
- Keep the architecture simple: Next.js pages + one route handler → Apps Script → Sheets. Prefer static config over API requests for content that rarely changes.
- Not assume planned features exist; verify in source.

## 5. Appointment request rules (approved requirements)

This is an **appointment request** system, not an auto-confirmed booking system.

1. The customer supplies only: preferred date (required), preferred time (required), full name (required), phone (required), notes (optional). **No service selection, price, duration, end time or customer email.**
2. The selected date/time is a *preference*. Nothing is calculated from services.
3. **Different customers may request the same date and time.** Do NOT reject requests because another request exists for that time, and do NOT reintroduce overlap, capacity or buffer checks without approval.
4. Validate: required fields, date/time formats, no past times, opening hours, `minimumAdvanceMinutes` / `maximumAdvanceDays`, time zone `Asia/Ho_Chi_Minh` (all in `src/config/booking.config.ts`).
5. New requests default to `Pending`. Statuses: `Pending`, `Confirmed`, `Completed`, `Cancelled` – edited by the owner in Sheets; they do not affect acceptance of new requests.
6. The owner confirms by phone and may fill `ConfirmedTime`. The UI must never say the appointment is confirmed; the success message must state it is a request, not an official appointment.
7. No online payment, no customer account, no customer email.
8. The services section on the landing page stays as informational marketing content.
9. **Three ways to book:** the online request form (creates a Sheets row + owner email), "Đặt lịch qua Zalo" (plain link to the owner's Zalo) and "Gọi điện đặt lịch" (`tel:` link). Zalo and phone **never** create a Sheets record or send an email – do not wire them to the booking API. Config: `NEXT_PUBLIC_ZALO_URL` (https only) and `NEXT_PUBLIC_SALON_PHONE` via `src/config/salon.config.ts`; never invent a number or Zalo account; buttons must not render when unconfigured (`ContactButtons.tsx`, `StickyContactBar.tsx`, `src/lib/contact.ts`).

Opening hours and services are **placeholders awaiting salon confirmation** – do not present them as final. Do not change these rules without approval.

## 6. Google Sheets rules

Preserve: one spreadsheet; one worksheet per **preferred date** named `DD-MM-YYYY`; automatic worksheet creation; the column set defined by `HEADERS` in `Code.gs` (`BookingId, RequestId, CreatedAt, CustomerName, PhoneNumber, PreferredDate, PreferredTime, Notes, Status, ConfirmedTime, EmailNotificationStatus, EmailSentAt, EmailAttempts`). The script locates columns **by header name** and only appends missing columns, so older worksheets (service-based layout) and their rows stay intact – never delete, reorder, rename or overwrite existing columns/rows, and never silently change column mappings. Review the impact on existing records before any schema change.

## 7. Concurrency and idempotency

Google Sheets has no transactions. Keep the `LockService` critical section in `Code.gs` (idempotency lookup + append + `SpreadsheetApp.flush()`), release it in `finally`, and never do slow work (email) while holding it. Preserve `requestId` idempotency: a replay returns the stored request (HTTP 200) with no duplicate row and no duplicate email; the browser keeps the same `requestId` for identical content and regenerates it on any edit. Do not introduce changes that create duplicate records.

## 8. Email notification rules

Owner only (`ADMIN_EMAIL`). Send after the request is persisted and the lock is released; never for rejected requests or idempotent replays; no customer emails. A failed email must never delete or roll back a saved request; keep `EmailNotificationStatus` / `EmailSentAt` / `EmailAttempts` tracking and the `retryPendingEmails` trigger. Delivery is at-least-once.

## 9. UI/UX guidelines

Design direction: *"Design a serene beauty spa landing page with soft UI elements, service menu, before/after gallery, booking system preview, and testimonials. Use soft pastels and calming aesthetics."*

- Brand 2IN.CORNER; style Serene Beauty Spa; soft pastel, elegant, minimal luxury; subtle animations (respect `prefers-reduced-motion`).
- Website language is **Vietnamese**; mobile-first; accessible (contrast ≥ 4.5:1, visible focus, ≥ 44px touch targets, labelled inputs).
- Tokens live in `src/app/globals.css` (the Tailwind `rose` scale is re-tinted dusty rose; `cream`, `ink`, `lavender-*`, `sage-*` added; fonts via `font-display` / `font-sans`). Reuse them instead of hard-coding colors.
- Clear booking CTA ("Đặt lịch ngay"); reuse existing components. Direct-contact buttons: Zalo uses its brand blue (`#0068ff`) with the Zalo icon, phone uses the rose outline style; the mobile sticky bar must hide while `#booking` is visible so it never covers form controls.
- Never fabricate testimonials, reviews, before/after results or contact details; `showcase.ts` and `salon.config.ts` stay empty until real data is supplied, and their sections hide when empty.
- For UI redesigns use the installed skill via `/ui-ux-pro-max` and follow its workflow. Do not redesign unrelated areas without approval.

## 10. Coding conventions

Follow existing TypeScript style (strict mode, `@/` alias for `src`, relative `.ts`-suffixed imports inside `src/lib/booking` and `src/config`, Tailwind utility classes). Prefer strong types, avoid `any`, keep functions focused, centralize business config, avoid duplicated rules (the Apps Script necessarily mirrors some validation – update both together), handle errors explicitly, keep secrets out of client components, avoid needless abstractions, match the comment density of surrounding code.

## 11. Security rules

Never expose or commit credentials (`.env*`, secrets, deployment URLs belong in env/Script Properties). Validate all request input server-side. Keep customer data private: API responses never contain other customers' data; do not log names/phones; request records are never exposed publicly. Keep formula-injection protection (`sanitizeCell_` in `Code.gs`) and the shared-secret server-to-server flow (secret only in the POST body, never in URLs or the browser). Respect Google permissions/scopes in `appsscript.json`.

## 12. Scope and change management

1. Understand the request. 2. Inspect relevant files. 3. Identify affected modules. 4. Consider side effects. 5. Reuse existing code. 6. Make minimal, targeted changes. 7. Summarize modified files and behavior. Ask for approval first when a change touches existing data, API contracts or architecture.

## 13. Testing policy (explicit)

**DO NOT create automated tests unless the user explicitly asks.** That covers unit, integration and E2E tests, fixtures, mock suites, test configuration and test-only dependencies. Do not add testing frameworks or generate test files during normal feature work, and **do not run automated test suites unless explicitly asked.**

The project has no test directory or test script (removed at the owner's request – this is a landing page MVP). Verify changes through code review, TypeScript, linting, build verification when appropriate, clear error handling and manual verification steps. Type checks, lint and production builds are allowed. Never claim something was verified if it was not actually checked.

## 14. Development commands

```bash
npm install            # dependencies
npm run dev            # dev server, http://localhost:3000
npx tsc --noEmit       # type check
npm run lint           # ESLint
npm run build          # production build
```

If a type error mentions a deleted route under `.next/types`, delete the `.next` folder and rebuild.

## 15. Forbidden actions

Claude MUST NOT: create automated tests without approval · delete existing functionality without approval · reintroduce a .NET/other backend API, authentication or a database without approval · delete external data or infrastructure (the former .NET backend/database are outside this repo) · modify unrelated modules · replace the real request API with mocks or static previews · expose credentials · change the appointment request rules without approval · add unnecessary dependencies · rewrite the application · assume planned functionality exists.
