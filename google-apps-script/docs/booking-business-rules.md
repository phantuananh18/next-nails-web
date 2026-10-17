# Appointment request rules

- The customer provides a **preferred date**, **preferred time**, **name**, **phone** and optional **notes**. No services, prices, durations, customer email or payment.
- The chosen time is a preference, not a reservation. **Several customers may request the same date and time**; every valid request is saved as `Pending`. The owner phones each customer, advises on services and decides the final schedule.
- Validation (Next.js and Apps Script): required fields; `YYYY-MM-DD` date and `HH:mm` time; no past times; within opening hours; start times on the 30-minute grid; at least 60 minutes ahead; at most 30 days ahead; time zone `Asia/Ho_Chi_Minh`. Values come from `src/config/booking.config.ts`.
- Customer: name 2–80 chars; Vietnamese phone `0[2-9]xxxxxxxx` (`+84` accepted and normalised); notes ≤ 300 chars; control characters stripped; formula-leading characters neutralised in Sheets.
- Statuses: `Pending` (default), `Confirmed`, `Completed`, `Cancelled`, edited by the owner. They do not affect acceptance of new requests.
- The UI never says the appointment is confirmed.
- Idempotency: `requestId` (UUID generated in the browser per unique form content) is stored in the `RequestId` column; a replay returns the original request (HTTP 200) and sends no email.
- API codes: 201 created, 200 idempotent replay, 400 invalid, 429 rate limited, 503 unavailable / lock timeout (retryable). There is no 409.
