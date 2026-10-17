"use client";

import { useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { bookingConfig } from "@/config/booking.config";
import ContactButtons, { getContactLinks } from "@/components/ContactButtons";
import { Field, inputClass } from "@/components/form";
import { getTimeOptions } from "@/lib/booking/schedule";
import { addDays, salonNow } from "@/lib/booking/time";
import { normalizePhone } from "@/lib/booking/validation";

interface BookingResponse {
  success?: boolean;
  bookingId?: string;
  code?: string;
  message?: string;
  errors?: Record<string, string>;
}

/** Digits only, auto-inserting "/" -> "dd/mm/yyyy". */
function maskDate(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 2) return d;
  return d.length <= 4 ? `${d.slice(0, 2)}/${d.slice(2)}` : `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

/** "dd/mm/yyyy" -> "yyyy-mm-dd", or null when it is not a real calendar date. */
function toIsoDate(text: string) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text);
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  const probe = new Date(Date.UTC(Number(yyyy), Number(mm) - 1, Number(dd)));
  const valid = probe.getUTCFullYear() === Number(yyyy) && probe.getUTCMonth() === Number(mm) - 1 && probe.getUTCDate() === Number(dd);
  return valid ? `${yyyy}-${mm}-${dd}` : null;
}

function toDisplayDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function noopSubscribe() {
  return () => {};
}

export default function BookingRequestForm() {
  const [date, setDate] = useState("");
  const [dateText, setDateText] = useState("");
  const nativeDateRef = useRef<HTMLInputElement>(null);
  const [time, setTime] = useState("");
  const [timeOptions, setTimeOptions] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const hasDirectContact = Boolean(getContactLinks().zalo || getContactLinks().tel);
  const submittingRef = useRef(false);
  const requestIdRef = useRef<string | null>(null); // idempotency key; reused for retries of the same form content

  // The page is prerendered, so "today" must be read on the client (server snapshot is empty => no hydration mismatch).
  const today = useSyncExternalStore(noopSubscribe, () => salonNow().date, () => "");
  const maxDate = today ? addDays(today, bookingConfig.maximumAdvanceDays) : undefined;

  /** Any edit changes the request content, so the next submit must use a fresh idempotency key. */
  function touch() {
    requestIdRef.current = null;
    setError(null);
  }

  function handleDateChange(value: string) {
    touch();
    setDate(value);
    setTime("");
    setTimeOptions(value ? getTimeOptions(value, Date.now()) : []);
  }

  function handleDateText(raw: string) {
    const text = maskDate(raw);
    setDateText(text);
    if (text.length < 10) {
      if (date) handleDateChange("");
      setFieldErrors((prev) => ({ ...prev, preferredDate: "" }));
      return;
    }
    const iso = toIsoDate(text);
    const inRange = iso !== null && (!today || (iso >= today && (!maxDate || iso <= maxDate)));
    if (!iso || !inRange) {
      handleDateChange("");
      setFieldErrors((prev) => ({ ...prev, preferredDate: "Ngày không hợp lệ hoặc ngoài thời gian có thể đặt lịch." }));
      return;
    }
    setFieldErrors((prev) => ({ ...prev, preferredDate: "" }));
    handleDateChange(iso);
  }

  function handleNativeDate(iso: string) {
    setDateText(iso ? toDisplayDate(iso) : "");
    setFieldErrors((prev) => ({ ...prev, preferredDate: "" }));
    handleDateChange(iso);
  }

  function openCalendar() {
    try {
      nativeDateRef.current?.showPicker();
    } catch {
      nativeDateRef.current?.focus();
    }
  }

  function validateLocally(): Record<string, string> {
    const errs: Record<string, string> = {};
    if (!date) errs.preferredDate = "Vui lòng chọn ngày hẹn.";
    else if (!time) errs.preferredTime = "Vui lòng chọn giờ hẹn.";
    if (name.trim().length < 2) errs.customerName = "Vui lòng nhập họ tên.";
    if (!normalizePhone(phone)) errs.phoneNumber = "Số điện thoại không hợp lệ.";
    return errs;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submittingRef.current) return;

    const errs = validateLocally();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      setError("Vui lòng kiểm tra lại thông tin.");
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);
    setError(null);
    requestIdRef.current ??= crypto.randomUUID();

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: requestIdRef.current,
          customerName: name,
          phoneNumber: phone,
          preferredDate: date,
          preferredTime: time,
          notes,
        }),
      });
      const body = (await res.json().catch(() => ({}))) as BookingResponse;

      if (res.ok && body.success && body.bookingId) {
        setBookingId(body.bookingId);
        return;
      }
      if (res.status === 400 && body.errors) setFieldErrors(body.errors);
      setError(body.message ?? "Gửi yêu cầu thất bại, vui lòng thử lại.");
    } catch {
      // Network failure: requestId is kept so a retry cannot create a duplicate request.
      setError("Không thể kết nối. Vui lòng kiểm tra mạng và thử lại.");
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  function reset() {
    requestIdRef.current = null;
    setBookingId(null);
    setDate("");
    setDateText("");
    setTime("");
    setTimeOptions([]);
    setName("");
    setPhone("");
    setNotes("");
    setFieldErrors({});
    setError(null);
  }

  return (
    <section id="booking" className="scroll-mt-24 bg-page-alt px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-2xl rounded-4xl bg-surface p-6 shadow-lg shadow-black/5 sm:p-10">
        <h2 className="text-3xl text-ink sm:text-4xl">Đặt lịch</h2>

        {hasDirectContact && (
          <div className="mt-6 rounded-3xl bg-page-alt p-5">
            <p className="text-sm font-medium text-ink">Bạn muốn đặt lịch nhanh? Liên hệ trực tiếp với tiệm:</p>
            <ContactButtons className="mt-3" />
            <p className="mt-3 text-xs text-muted">
              Đặt qua Zalo hoặc điện thoại sẽ được tiệm trao đổi trực tiếp với bạn. Hoặc gửi yêu cầu trực tuyến bên dưới.
            </p>
          </div>
        )}

        {bookingId ? (
          <div role="status" className="mt-6 rounded-3xl border border-success-line bg-success-bg p-6 text-success-fg">
            <h3 className="text-lg font-semibold">Đã gửi yêu cầu đặt lịch thành công!</h3>
            <p className="mt-3 text-sm">
              Mã yêu cầu: <span className="font-mono font-semibold">{bookingId}</span>
            </p>
            <p className="mt-3 text-sm">Cảm ơn bạn đã lựa chọn 2IN.CORNER.</p>
            <p className="mt-3 text-sm">
              Tiệm sẽ chủ động liên hệ qua số điện thoại bạn cung cấp để tư vấn dịch vụ và xác nhận thời gian hẹn.
            </p>
            <p className="mt-3 text-sm font-semibold">
              Lưu ý: Đây là yêu cầu đặt lịch, chưa phải lịch hẹn được xác nhận chính thức.
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-5 min-h-11 cursor-pointer rounded-full border border-success-fg px-5 text-sm font-semibold text-success-fg hover:bg-success-line"
            >
              Gửi yêu cầu khác
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-6">
            <p className="text-sm text-muted">
              Chọn ngày và giờ bạn mong muốn. Tiệm sẽ gọi điện tư vấn dịch vụ và xác nhận lịch hẹn cho bạn.
            </p>

            <Field label="Ngày hẹn mong muốn">
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="Ngày/tháng/năm"
                  maxLength={10}
                  value={dateText}
                  onChange={(e) => handleDateText(e.target.value)}
                  className={`${inputClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={openCalendar}
                  aria-label="Mở lịch chọn ngày"
                  className="absolute right-0.5 top-1/2 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:text-accent"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="5" width="18" height="16" rx="2" />
                    <path d="M3 10h18M8 3v4M16 3v4" />
                  </svg>
                </button>
                <input
                  ref={nativeDateRef}
                  type="date"
                  tabIndex={-1}
                  aria-hidden="true"
                  value={date}
                  min={today || undefined}
                  max={maxDate}
                  onChange={(e) => handleNativeDate(e.target.value)}
                  className="pointer-events-none absolute bottom-0 right-0 h-0 w-0 opacity-0"
                />
              </div>
              {fieldErrors.preferredDate && <span className="mt-1 block text-sm text-danger">{fieldErrors.preferredDate}</span>}
            </Field>

            <div>
              <span className="mb-1.5 block text-sm font-medium text-muted">Giờ hẹn mong muốn</span>
              {!date ? (
                <p className="text-sm text-muted">Chọn ngày để xem các khung giờ.</p>
              ) : timeOptions.length === 0 ? (
                <p className="text-sm text-muted">Không còn khung giờ trong ngày này. Vui lòng chọn ngày khác.</p>
              ) : (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {timeOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={time === option}
                      onClick={() => {
                        touch();
                        setTime(option);
                      }}
                      className={`min-h-11 cursor-pointer rounded-xl border py-2 text-sm font-medium transition-colors duration-200 ${
                        time === option
                          ? "border-rose-600 bg-rose-600 text-white"
                          : "border-line text-muted hover:border-rose-400 hover:bg-page-alt"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
              {fieldErrors.preferredTime && <span className="mt-1 block text-sm text-danger">{fieldErrors.preferredTime}</span>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Họ và tên">
                <input
                  type="text"
                  autoComplete="name"
                  maxLength={80}
                  value={name}
                  onChange={(e) => {
                    touch();
                    setName(e.target.value);
                  }}
                  className={inputClass}
                />
                {fieldErrors.customerName && <span className="mt-1 block text-sm text-danger">{fieldErrors.customerName}</span>}
              </Field>
              <Field label="Số điện thoại">
                <input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => {
                    touch();
                    setPhone(e.target.value);
                  }}
                  className={inputClass}
                />
                {fieldErrors.phoneNumber && <span className="mt-1 block text-sm text-danger">{fieldErrors.phoneNumber}</span>}
              </Field>
            </div>

            <Field label="Ghi chú (không bắt buộc)">
              <textarea
                rows={3}
                maxLength={300}
                value={notes}
                onChange={(e) => {
                  touch();
                  setNotes(e.target.value);
                }}
                className={inputClass}
                placeholder="Ví dụ: mình muốn làm nail màu pastel..."
              />
            </Field>

            {error && (
              <p role="alert" className="text-sm text-danger">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-12 w-full cursor-pointer rounded-full bg-rose-600 text-base font-semibold text-white shadow-md shadow-rose-200 transition-colors duration-200 hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Đang gửi yêu cầu..." : "Gửi yêu cầu đặt lịch"}
            </button>
            <p className="text-center text-xs text-muted">
              Đây là yêu cầu đặt lịch và lịch hẹn chỉ được xác nhận sau khi tiệm gọi điện cho bạn.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
