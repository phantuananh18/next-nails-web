# Google Apps Script backend

`Code.gs` is the Web App called by the Next.js server (never by browsers). It stores appointment requests (preferred date/time + contact details) in Google Sheets (one tab per preferred date), is idempotent by `requestId` under a script lock, and emails the owner after the lock is released. Same-time requests are allowed; there is no overlap check.

Setup and deployment: see [`docs/apps-script-deployment.md`](../docs/apps-script-deployment.md). Data layout: [`docs/google-sheets-setup.md`](../docs/google-sheets-setup.md).

