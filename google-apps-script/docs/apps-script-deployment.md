# Apps Script deployment

1. Open the spreadsheet → **Extensions → Apps Script** (script is then *bound*; otherwise set `SPREADSHEET_ID`).
2. Replace the contents of `Code.gs` with `google-apps-script/Code.gs`. In **Project Settings** tick *Show "appsscript.json" manifest file* and paste `google-apps-script/appsscript.json` (time zone `Asia/Ho_Chi_Minh`, V8).
3. **Project Settings → Script properties**:

   | Property | Value |
   |---|---|
   | `API_SECRET` | long random string (`openssl rand -hex 32`) |
   | `ADMIN_EMAIL` | address that receives booking notifications |
   | `SPREADSHEET_ID` | optional; only if the script is not bound to the sheet |

4. Run `installTriggers` once from the editor (authorize when prompted). It schedules `retryPendingEmails` every 15 minutes to re-send failed notifications. Required scopes: Spreadsheets, send mail (`MailApp`), script triggers.
5. **Deploy → New deployment → Web app**: *Execute as* **Me**, *Who has access* **Anyone**. Copy the `/exec` URL. (Anonymous access is required because Vercel cannot sign in to Google; the shared secret protects the endpoint – see `architecture.md`.)
6. After every code change: **Deploy → Manage deployments → Edit → New version** (the URL stays the same).
7. Verify: open the `/exec` URL in a browser – it should return `{"ok":true,"service":"2in-corner-booking"}` only. `POST` without the correct secret returns `{"ok":false,"code":"UNAUTHORIZED"}`.

## Test request and email

From a terminal (replace values; use a future date inside opening hours):

```bash
curl -L -X POST "$GOOGLE_APPS_SCRIPT_URL" -H "Content-Type: text/plain" -d '{
 "secret":"<API_SECRET>","action":"create","requestId":"manual-test-0123456789",
 "customerName":"Test","phoneNumber":"0901234567",
 "preferredDate":"2026-12-01","preferredTime":"10:00","notes":""}'
```

Expected: `{"ok":true,"idempotent":false,"bookingId":"BK-20261201-001","status":"Pending"}`, a new `01-12-2026` tab, and an email at `ADMIN_EMAIL`. Run the same command again: `idempotent:true` and no second email. Delete the test row afterwards (or set it `Cancelled`).

After changing `Code.gs`, create a **new version** under *Deploy → Manage deployments*; otherwise the old script keeps running.

Email limits: consumer Gmail accounts can send about 100 recipients/day via `MailApp`; delivery is at-least-once.
