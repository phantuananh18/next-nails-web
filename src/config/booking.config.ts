export interface DayHours {
  /** "HH:mm" */
  open: string;
  /** "HH:mm" — the last preferred time must be earlier than this */
  close: string;
}

/**
 * Appointment *requests*: the customer proposes a preferred date/time, the salon confirms by phone.
 * Several customers may request the same time, so there is no capacity or overlap rule.
 */
export const bookingConfig = {
  timezone: "Asia/Ho_Chi_Minh",
  slotIntervalMinutes: 30,
  minimumAdvanceMinutes: 60,
  maximumAdvanceDays: 30,
  /**
   * Keys are weekdays (0 = Sunday … 6 = Saturday); `null` = closed.
   */
  openingHours: {
    0: { open: "09:00", close: "21:00" },
    1: { open: "09:00", close: "21:00" },
    2: { open: "09:00", close: "21:00" },
    3: { open: "09:00", close: "21:00" },
    4: { open: "09:00", close: "21:00" },
    5: { open: "09:00", close: "21:00" },
    6: { open: "09:00", close: "21:00" },
  } as Record<number, DayHours | null>,
};
