import type { NextRequest } from "next/server";
import { createAppsScriptGateway } from "@/lib/booking/apps-script-gateway";
import { submitRequest } from "@/lib/booking/booking-service";
import { clientKey, rateLimit } from "@/lib/booking/rate-limit";

export const maxDuration = 30;

const MAX_BODY_BYTES = 8 * 1024;

export async function POST(request: NextRequest) {
  if (!rateLimit(`book:${clientKey(request)}`, 8, 10 * 60_000)) {
    return Response.json(
      { success: false, code: "RATE_LIMITED", message: "Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) throw new Error("too large");
    body = JSON.parse(text);
  } catch {
    return Response.json(
      { success: false, code: "INVALID_REQUEST", message: "Yêu cầu không hợp lệ." },
      { status: 400 }
    );
  }

  const result = await submitRequest(createAppsScriptGateway(), body);
  return Response.json(result.body, { status: result.status, headers: { "Cache-Control": "no-store" } });
}
