/** A fully validated appointment request. No services, price or duration: the salon discusses those by phone. */
export interface ValidatedRequest {
  requestId: string;
  customerName: string;
  phoneNumber: string;
  preferredDate: string; // YYYY-MM-DD
  preferredTime: string; // HH:mm
  notes: string;
}

export type CreateResult =
  | { ok: true; idempotent: boolean; bookingId: string; status: string }
  | { ok: false; code: string; retryable?: boolean };

/** Boundary to the request store (Google Apps Script in production). */
export interface BookingGateway {
  createBooking(request: ValidatedRequest): Promise<CreateResult>;
}

export interface ApiResult {
  status: number;
  body: Record<string, unknown>;
}
