/**
 * 2IN.CORNER — appointment-request backend (Google Apps Script Web App).
 *
 * Called ONLY by the Next.js server (never by the browser). Customers submit a PREFERRED date/time plus contact
 * details; the salon owner phones them to discuss services and confirm. Several customers may request the same
 * time, so there is no overlap check. Storage: one Google Spreadsheet, one worksheet per preferred date,
 * named DD-MM-YYYY.
 *
 * Script Properties (Project Settings -> Script properties):
 *   API_SECRET      shared secret, must equal GOOGLE_APPS_SCRIPT_SECRET on the Next.js server
 *   ADMIN_EMAIL     where new-request notifications are sent
 *   SPREADSHEET_ID  (optional) id of the spreadsheet; defaults to the spreadsheet this script is bound to
 *
 * Columns are located BY HEADER NAME, so worksheets created by the earlier service-based version keep working:
 * their existing columns and rows are left untouched and any missing columns are appended to the right.
 */

var HEADERS = [
  'BookingId', 'RequestId', 'CreatedAt', 'CustomerName', 'PhoneNumber', 'PreferredDate', 'PreferredTime',
  'Notes', 'Status', 'ConfirmedTime', 'EmailNotificationStatus', 'EmailSentAt',
  'EmailAttempts' // bookkeeping for the email retry job
];
var NUMERIC_COLUMNS = ['EmailAttempts'];

var TIME_ZONE = 'Asia/Ho_Chi_Minh';
var LOCK_TIMEOUT_MS = 20000;
var MAX_EMAIL_ATTEMPTS = 5;
var PENDING_EMAIL_GRACE_MS = 2 * 60 * 1000;
var STALE_SENDING_MS = 15 * 60 * 1000;

// ---------------------------------------------------------------- entry points

function doGet() {
  return jsonResponse_({ ok: true, service: '2in-corner-booking' });
}

function doPost(e) {
  var p;
  try {
    p = JSON.parse((e && e.postData && e.postData.contents) || '');
  } catch (err) {
    return jsonResponse_({ ok: false, code: 'BAD_REQUEST' });
  }
  if (!authenticateRequest(p)) return jsonResponse_({ ok: false, code: 'UNAUTHORIZED' });

  try {
    if (p.action === 'create') return jsonResponse_(handleCreate_(p));
    return jsonResponse_({ ok: false, code: 'BAD_REQUEST' });
  } catch (err) {
    console.error('doPost failed: ' + (err && err.message)); // never log request bodies (customer data)
    return jsonResponse_({ ok: false, code: 'INTERNAL', retryable: true });
  }
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// ---------------------------------------------------------------- auth & validation

function authenticateRequest(p) {
  var expected = PropertiesService.getScriptProperties().getProperty('API_SECRET');
  if (!expected || !p || typeof p.secret !== 'string') return false;
  return constantTimeEquals_(p.secret, expected);
}

function constantTimeEquals_(a, b) {
  var diff = a.length ^ b.length;
  var len = Math.max(a.length, b.length);
  for (var i = 0; i < len; i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

function isIsoDate_(s) {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  var d = new Date(s + 'T00:00:00Z');
  return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

function sheetNameForDate_(iso) {
  return iso.slice(8, 10) + '-' + iso.slice(5, 7) + '-' + iso.slice(0, 4);
}

function displayDate_(iso) {
  return iso.slice(8, 10) + '/' + iso.slice(5, 7) + '/' + iso.slice(0, 4);
}

/** Defence in depth: Next.js already validated; the script re-checks required fields and formats. */
function validateRequest(p) {
  if (!p || !isIsoDate_(p.preferredDate)) return false;
  if (typeof p.preferredTime !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(p.preferredTime)) return false;
  if (typeof p.requestId !== 'string' || !/^[A-Za-z0-9_-]{16,64}$/.test(p.requestId)) return false;
  if (typeof p.customerName !== 'string' || p.customerName.length < 2) return false;
  if (typeof p.phoneNumber !== 'string' || !/^0\d{9}$/.test(p.phoneNumber)) return false;
  if (p.notes != null && typeof p.notes !== 'string') return false;
  return true;
}

/** Prevent spreadsheet formula injection: neutralise cells that start with a formula trigger. */
function sanitizeCell_(value) {
  var s = String(value == null ? '' : value);
  return /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
}

// ---------------------------------------------------------------- spreadsheet access

function getSpreadsheet_() {
  var id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  return id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Finds or creates the DD-MM-YYYY worksheet. A new sheet gets the header row; an existing sheet only gets
 * missing columns appended to the right (existing columns/rows are never moved, renamed or overwritten).
 */
function getOrCreateDailyWorksheet(date) {
  var ss = getSpreadsheet_();
  var name = sheetNameForDate_(date);
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    try {
      sheet = ss.insertSheet(name);
    } catch (err) {
      sheet = ss.getSheetByName(name); // created concurrently elsewhere
      if (!sheet) throw err;
    }
  }
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setNumberFormat('@').setValues([HEADERS]);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  } else {
    var header = readHeader_(sheet);
    var next = header.length;
    HEADERS.forEach(function (h) {
      if (header.indexOf(h) === -1) {
        next++;
        sheet.getRange(1, next).setNumberFormat('@').setValue(h).setFontWeight('bold');
      }
    });
  }
  return sheet;
}

function readHeader_(sheet) {
  var lastCol = sheet.getLastColumn();
  if (lastCol < 1) return [];
  return sheet.getRange(1, 1, 1, lastCol).getDisplayValues()[0].map(function (h) { return String(h).trim(); });
}

/** Reads all request rows. Columns are resolved by header name; missing columns read as ''. */
function getExistingBookings(sheet) {
  var header = readHeader_(sheet);
  var lastRow = sheet.getLastRow();
  var rows = [];
  if (lastRow >= 2 && header.length > 0) {
    var values = sheet.getRange(2, 1, lastRow - 1, header.length).getDisplayValues();
    for (var i = 0; i < values.length; i++) {
      var v = values[i];
      var get = function (name) { var c = header.indexOf(name); return c === -1 ? '' : v[c]; };
      if (!get('BookingId') && !get('RequestId')) continue; // blank row
      rows.push({
        rowIndex: i + 2,
        bookingId: get('BookingId'),
        requestId: get('RequestId'),
        createdAt: get('CreatedAt'),
        customerName: get('CustomerName'),
        phoneNumber: get('PhoneNumber'),
        // Rows written by the earlier service-based version used StartTime/BookingDate.
        preferredTime: get('PreferredTime') || get('StartTime'),
        notes: get('Notes'),
        status: String(get('Status') || '').trim(),
        emailStatus: get('EmailNotificationStatus'),
        emailAttempts: Number(get('EmailAttempts')) || 0
      });
    }
  }
  return { header: header, rows: rows };
}

function findBookingByRequestId(rows, requestId) {
  for (var i = 0; i < rows.length; i++) if (rows[i].requestId === requestId) return rows[i];
  return null;
}

function nextBookingId_(rows, date) {
  var prefix = 'BK-' + date.replace(/-/g, '') + '-';
  var max = 0;
  rows.forEach(function (r) {
    if (String(r.bookingId).indexOf(prefix) === 0) max = Math.max(max, Number(String(r.bookingId).slice(prefix.length)) || 0);
  });
  return prefix + ('000' + (max + 1)).slice(-3);
}

// ---------------------------------------------------------------- handler

function handleCreate_(p) {
  if (!validateRequest(p)) return { ok: false, code: 'BAD_REQUEST' };

  var booking, sheet;

  // ---- critical section: idempotency check + append (no overlap check: same-time requests are allowed) ----
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(LOCK_TIMEOUT_MS)) return { ok: false, code: 'LOCK_TIMEOUT', retryable: true };
  try {
    sheet = getOrCreateDailyWorksheet(p.preferredDate);
    var data = getExistingBookings(sheet);

    var existing = findBookingByRequestId(data.rows, p.requestId);
    if (existing) {
      if (existing.preferredTime !== p.preferredTime || existing.phoneNumber !== p.phoneNumber) {
        return { ok: false, code: 'REQUEST_ID_MISMATCH' };
      }
      return { ok: true, idempotent: true, bookingId: existing.bookingId, status: existing.status || 'Pending' };
    }

    booking = createBooking(sheet, data, p);
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }
  // ---- lock released: only now do slow side effects (email) ----

  recordEmailOutcome_(sheet, booking, 1, sendNotificationSafely_(booking, sheet));
  return { ok: true, idempotent: false, bookingId: booking.bookingId, status: 'Pending' };
}

function createBooking(sheet, data, p) {
  var bookingId = nextBookingId_(data.rows, p.preferredDate);
  var values = {
    BookingId: bookingId,
    RequestId: p.requestId,
    CreatedAt: Utilities.formatDate(new Date(), TIME_ZONE, "yyyy-MM-dd'T'HH:mm:ssXXX"),
    CustomerName: sanitizeCell_(p.customerName),
    PhoneNumber: sanitizeCell_(p.phoneNumber),
    PreferredDate: displayDate_(p.preferredDate),
    PreferredTime: p.preferredTime,
    Notes: sanitizeCell_(p.notes || ''),
    Status: 'Pending',
    ConfirmedTime: '',
    EmailNotificationStatus: 'Pending',
    EmailSentAt: '',
    EmailAttempts: 0
  };
  var header = data.header.length ? data.header : HEADERS;
  var row = header.map(function (h) { return values.hasOwnProperty(h) ? values[h] : ''; });
  var formats = header.map(function (h) { return NUMERIC_COLUMNS.indexOf(h) === -1 ? '@' : '0'; });

  var target = sheet.getRange(sheet.getLastRow() + 1, 1, 1, header.length);
  target.setNumberFormats([formats]); // text format keeps "09:00", "0901234567", dates exactly as written
  target.setValues([row]);

  return {
    bookingId: bookingId,
    customerName: p.customerName,
    phoneNumber: p.phoneNumber,
    preferredDate: p.preferredDate,
    preferredTime: p.preferredTime,
    notes: p.notes || '',
    status: 'Pending'
  };
}

// ---------------------------------------------------------------- email

function worksheetUrl_(sheet) {
  return getSpreadsheet_().getUrl() + '#gid=' + sheet.getSheetId();
}

function sendAdminNotification(b, sheet) {
  var admin = PropertiesService.getScriptProperties().getProperty('ADMIN_EMAIL');
  if (!admin) throw new Error('ADMIN_EMAIL is not configured');
  var d = displayDate_(b.preferredDate);
  var body = [
    'NEW APPOINTMENT REQUEST', '',
    'Customer: ' + b.customerName,
    'Phone: ' + b.phoneNumber, '',
    'Preferred Date: ' + d,
    'Preferred Time: ' + b.preferredTime, '',
    'Notes: ' + (b.notes ? b.notes : 'None'), '',
    'Status: ' + b.status, '',
    'Please contact the customer by phone to confirm the appointment.', '',
    'Google Sheets: ' + worksheetUrl_(sheet)
  ].join('\n');
  MailApp.sendEmail({ to: admin, subject: '[2IN.CORNER] New Appointment Request - ' + d + ' ' + b.preferredTime, body: body });
}

function sendNotificationSafely_(booking, sheet) {
  try {
    sendAdminNotification(booking, sheet);
    return true;
  } catch (err) {
    console.error('Email failed: ' + (err && err.message)); // request is kept; retryPendingEmails will retry
    return false;
  }
}

/** Finds the row by BookingId at write time (rows may have been sorted/inserted by the admin). */
function findRowIndex_(sheet, bookingId) {
  var rows = getExistingBookings(sheet).rows;
  for (var i = 0; i < rows.length; i++) if (rows[i].bookingId === bookingId) return rows[i].rowIndex;
  return -1;
}

function setCellByHeader_(sheet, rowIndex, headerName, value) {
  var c = readHeader_(sheet).indexOf(headerName);
  if (c === -1) return;
  sheet.getRange(rowIndex, c + 1).setValue(value);
}

function recordEmailOutcome_(sheet, booking, attempts, success) {
  try {
    var r = findRowIndex_(sheet, booking.bookingId);
    if (r === -1) return;
    setCellByHeader_(sheet, r, 'EmailNotificationStatus', success ? 'Sent' : 'Failed');
    setCellByHeader_(sheet, r, 'EmailSentAt',
      success ? Utilities.formatDate(new Date(), TIME_ZONE, "yyyy-MM-dd'T'HH:mm:ssXXX") : '');
    setCellByHeader_(sheet, r, 'EmailAttempts', attempts);
  } catch (err) {
    console.error('Could not record email status: ' + (err && err.message));
  }
}

/**
 * Time-driven recovery (see installTriggers). Re-sends notifications that failed, or whose original
 * request died before recording an outcome. Delivery is at-least-once, never guaranteed exactly-once.
 */
function retryPendingEmails() {
  var ss = getSpreadsheet_();
  var now = Date.now();
  var cutoffDate = Utilities.formatDate(new Date(now - 24 * 3600 * 1000), TIME_ZONE, 'yyyy-MM-dd');
  ss.getSheets().forEach(function (sheet) {
    var m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(sheet.getName());
    if (!m || m[3] + '-' + m[2] + '-' + m[1] < cutoffDate) return;
    var iso = m[3] + '-' + m[2] + '-' + m[1];
    getExistingBookings(sheet).rows.forEach(function (r) {
      if (!isEmailRetryable_(r, now)) return;
      var claimed = claimEmailRetry_(sheet, r.bookingId, now);
      if (!claimed) return;
      var booking = {
        bookingId: claimed.bookingId,
        customerName: claimed.customerName,
        phoneNumber: claimed.phoneNumber,
        preferredDate: iso,
        preferredTime: claimed.preferredTime,
        notes: claimed.notes,
        status: claimed.status || 'Pending'
      };
      recordEmailOutcome_(sheet, booking, claimed.emailAttempts + 1, sendNotificationSafely_(booking, sheet));
    });
  });
}

function isEmailRetryable_(r, now) {
  if (r.status.toLowerCase() === 'cancelled' || r.emailAttempts >= MAX_EMAIL_ATTEMPTS) return false;
  var age = now - new Date(r.createdAt).getTime();
  if (r.emailStatus === 'Failed') return true;
  if (r.emailStatus === 'Pending') return age >= PENDING_EMAIL_GRACE_MS;
  if (r.emailStatus === 'Sending') return age >= STALE_SENDING_MS;
  return false;
}

/** Marks the row 'Sending' under the lock so two overlapping retry runs cannot both send. */
function claimEmailRetry_(sheet, bookingId, now) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return null;
  try {
    var rows = getExistingBookings(sheet).rows;
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      if (r.bookingId === bookingId && isEmailRetryable_(r, now)) {
        setCellByHeader_(sheet, r.rowIndex, 'EmailNotificationStatus', 'Sending');
        SpreadsheetApp.flush();
        return r;
      }
    }
    return null;
  } finally {
    lock.releaseLock();
  }
}

/** Run once from the Apps Script editor to schedule the email recovery job. */
function installTriggers() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'retryPendingEmails') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('retryPendingEmails').timeBased().everyMinutes(15).create();
}
