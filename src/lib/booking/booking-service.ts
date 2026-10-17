import type { ApiResult, BookingGateway } from "./types.ts";
import { validateRequestInput } from "./validation.ts";

const UNAVAILABLE_MESSAGE = "Hệ thống đặt lịch tạm thời không khả dụng. Vui lòng thử lại sau ít phút.";

export async function submitRequest(
  gateway: BookingGateway,
  raw: unknown,
  nowMs: number = Date.now()
): Promise<ApiResult> {
  const validation = validateRequestInput(raw, nowMs);
  if (!validation.ok) {
    return {
      status: 400,
      body: {
        success: false,
        code: "INVALID_REQUEST",
        message: Object.values(validation.errors)[0] ?? "Yêu cầu không hợp lệ.",
        errors: validation.errors,
      },
    };
  }

  const result = await gateway.createBooking(validation.value);
  if (result.ok) {
    return {
      status: result.idempotent ? 200 : 201,
      body: {
        success: true,
        bookingId: result.bookingId,
        status: result.status,
        message: "Đã gửi yêu cầu đặt lịch thành công.",
      },
    };
  }
  if (result.code === "REQUEST_ID_MISMATCH") {
    return {
      status: 400,
      body: { success: false, code: "INVALID_REQUEST", message: "Yêu cầu không hợp lệ. Vui lòng thử lại." },
    };
  }
  return {
    status: 503,
    body: {
      success: false,
      code: "SERVICE_UNAVAILABLE",
      retryable: result.retryable ?? true,
      message: UNAVAILABLE_MESSAGE,
    },
  };
}
