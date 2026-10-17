/** `tel:` URI from a human-readable phone number (keeps digits and one leading "+"), or null if unusable. */
export function getTelHref(phone: string): string | null {
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 8) return null;
  return `tel:${trimmed.startsWith("+") ? "+" : ""}${digits}`;
}

/** Accepts only https URLs so a bad env value can never become a `javascript:` link. */
export function getHttpsHref(url: string): string | null {
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === "https:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

export const getZaloHref = getHttpsHref;
