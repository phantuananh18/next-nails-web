# Google Sheets setup

1. Sign in to the Google account that will own the salon data and go to <https://sheets.new>.
2. Name the spreadsheet e.g. `2IN.CORNER Requests`. Leave the default `Sheet1` (it is ignored) or delete it.
3. Do **not** create daily tabs – the script creates one tab per **preferred date**, named `DD-MM-YYYY` (e.g. `18-10-2026`), with this header:

   `BookingId, RequestId, CreatedAt, CustomerName, PhoneNumber, PreferredDate, PreferredTime, Notes, Status, ConfirmedTime, EmailNotificationStatus, EmailSentAt, EmailAttempts`

4. **Existing tabs** from the earlier service-based version are kept as they are. The script finds columns by header name and only appends missing ones (`PreferredDate`, `PreferredTime`, `ConfirmedTime`, …) to the right; old rows and columns are never changed.
5. Owner workflow: after phoning the customer, set `Status` to `Confirmed` or `Cancelled` and optionally fill `ConfirmedTime`; mark finished appointments `Completed`. A data-validation dropdown on `Status` is optional. Do not edit other columns by hand.
6. Two customers may ask for the same time – check the day's tab for clashes before confirming.
7. Share the spreadsheet only with the owner/admins. Customers never access it.
