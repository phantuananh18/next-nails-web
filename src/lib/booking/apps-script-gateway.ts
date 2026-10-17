import type { BookingGateway, CreateResult, ValidatedRequest } from "./types.ts";

const TIMEOUT_MS = 28000;

type Json = Record<string, unknown>;

function isRecord(v: unknown): v is Json {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

/**
 * Server-to-server client for the Apps Script Web App.
 * The secret travels in the POST body over HTTPS (Apps Script cannot read custom headers).
 * Never import this from client components.
 */
export function createAppsScriptGateway(
  url: string | undefined = process.env.GOOGLE_APPS_SCRIPT_URL,
  secret: string | undefined = process.env.GOOGLE_APPS_SCRIPT_SECRET,
  fetchImpl: typeof fetch = fetch
): BookingGateway {
  async function call(payload: Json): Promise<Json | null> {
    if (!url || !secret) return null;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetchImpl(url, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ ...payload, secret }),
        redirect: "follow",
        cache: "no-store",
        signal: controller.signal,
      });
      if (!res.ok) return null;
      const json: unknown = await res.json();
      return isRecord(json) ? json : null;
    } catch {
      return null; // network error, timeout, or non-JSON body (e.g. a Google HTML error page)
    } finally {
      clearTimeout(timer);
    }
  }

  return {
    async createBooking(request: ValidatedRequest): Promise<CreateResult> {
      const json = await call({ action: "create", ...request });
      if (!json) return { ok: false, code: "UPSTREAM_ERROR", retryable: true };
      if (json.ok === true && typeof json.bookingId === "string") {
        return {
          ok: true,
          idempotent: json.idempotent === true,
          bookingId: json.bookingId,
          status: typeof json.status === "string" ? json.status : "Pending",
        };
      }
      return {
        ok: false,
        code: typeof json.code === "string" ? json.code : "UPSTREAM_ERROR",
        retryable: json.retryable === true,
      };
    },
  };
}
