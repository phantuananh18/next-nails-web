import { bookingConfig } from "../../config/booking.config.ts";
import { addDays, dayOfWeek, minutesToTime, salonNow, timeToMinutes, wallMinutes } from "./time.ts";

export function getOpeningHours(date: string) {
  const hours = bookingConfig.openingHours[dayOfWeek(date)];
  if (!hours) return null;
  return { open: timeToMinutes(hours.open), close: timeToMinutes(hours.close) };
}

export type PreferredTimeProblem = "CLOSED" | "OUTSIDE_HOURS" | "OFF_GRID" | "PAST" | "TOO_SOON" | "TOO_FAR";

/** Reason a preferred date/time cannot be requested, or null if it is acceptable. */
export function checkPreferredTime(
  date: string,
  minutes: number,
  nowMs: number = Date.now()
): PreferredTimeProblem | null {
  const now = salonNow(nowMs);
  if (date > addDays(now.date, bookingConfig.maximumAdvanceDays)) return "TOO_FAR";

  const nowWall = wallMinutes(now.date, now.minutes);
  const startWall = wallMinutes(date, minutes);
  if (startWall < nowWall) return "PAST";
  if (startWall < nowWall + bookingConfig.minimumAdvanceMinutes) return "TOO_SOON";

  const hours = getOpeningHours(date);
  if (!hours) return "CLOSED";
  if (minutes < hours.open || minutes >= hours.close) return "OUTSIDE_HOURS";
  if ((minutes - hours.open) % bookingConfig.slotIntervalMinutes !== 0) return "OFF_GRID";
  return null;
}

/** Selectable preferred times ("HH:mm") for a date: opening hours, slot grid and lead time only. */
export function getTimeOptions(date: string, nowMs: number = Date.now()): string[] {
  const hours = getOpeningHours(date);
  if (!hours) return [];
  const options: string[] = [];
  for (let m = hours.open; m < hours.close; m += bookingConfig.slotIntervalMinutes) {
    if (checkPreferredTime(date, m, nowMs) === null) options.push(minutesToTime(m));
  }
  return options;
}
