import { bookingConfig } from "../../config/booking.config.ts";
import { checkPreferredTime, type PreferredTimeProblem } from "./schedule.ts";
import type { ValidatedRequest } from "./types.ts";
import { TIME_RE, isValidDateString, timeToMinutes } from "./time.ts";

export type ValidationResult = { ok: true; value: ValidatedRequest } | { ok: false; errors: Record<string, string> };

const REQUEST_ID_RE = /^[A-Za-z0-9_-]{16,64}$/;
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/** Vietnamese phone numbers: normalises +84/84 prefix and separators to a 10-digit "0xxxxxxxxx". */
export function normalizePhone(raw: string): string | null {
  let digits = raw.replace(/[\s.\-()]/g, "");
  if (digits.startsWith("+84")) digits = "0" + digits.slice(3);
  else if (digits.startsWith("84") && digits.length === 11) digits = "0" + digits.slice(2);
  return /^0[2-9]\d{8}$/.test(digits) ? digits : null;
}

function cleanText(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(CONTROL_CHARS, "").trim().slice(0, max);
}

const TIME_ERRORS: Record<PreferredTimeProblem, string> = {
  TOO_FAR: `Chỉ nhận đặt lịch trong vòng ${bookingConfig.maximumAdvanceDays} ngày tới.`,
  PAST: "Không thể đặt lịch trong quá khứ.",
  TOO_SOON: `Vui lòng đặt trước ít nhất ${bookingConfig.minimumAdvanceMinutes} phút.`,
  CLOSED: "Tiệm không mở cửa vào ngày này.",
  OUTSIDE_HOURS: "Giờ hẹn nằm ngoài giờ mở cửa.",
  OFF_GRID: "Giờ hẹn không hợp lệ.",
};

export function validateRequestInput(raw: unknown, nowMs: number = Date.now()): ValidationResult {
  const errors: Record<string, string> = {};
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, errors: { _: "Yêu cầu không hợp lệ." } };
  }
  const body = raw as Record<string, unknown>;

  const requestId = typeof body.requestId === "string" ? body.requestId : "";
  if (!REQUEST_ID_RE.test(requestId)) errors.requestId = "Mã yêu cầu không hợp lệ.";

  const customerName = cleanText(body.customerName, 80);
  if (customerName.length < 2) errors.customerName = "Vui lòng nhập họ tên.";

  const phoneNumber = typeof body.phoneNumber === "string" ? normalizePhone(body.phoneNumber) : null;
  if (!phoneNumber) errors.phoneNumber = "Số điện thoại không hợp lệ.";

  const preferredDate = typeof body.preferredDate === "string" ? body.preferredDate : "";
  if (!isValidDateString(preferredDate)) errors.preferredDate = "Ngày hẹn không hợp lệ.";

  const preferredTime = typeof body.preferredTime === "string" ? body.preferredTime : "";
  if (!TIME_RE.test(preferredTime)) errors.preferredTime = "Giờ hẹn không hợp lệ.";

  if (!errors.preferredDate && !errors.preferredTime) {
    const problem = checkPreferredTime(preferredDate, timeToMinutes(preferredTime), nowMs);
    if (problem) errors.preferredTime = TIME_ERRORS[problem];
  }

  if (Object.keys(errors).length > 0 || !phoneNumber) return { ok: false, errors };

  return {
    ok: true,
    value: { requestId, customerName, phoneNumber, preferredDate, preferredTime, notes: cleanText(body.notes, 300) },
  };
}
