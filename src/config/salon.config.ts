/**
 * Public contact details. Intentionally empty by default: fill in the real values (nothing is invented here).
 * Only non-empty fields are rendered.
 *
 * `phone` and `zaloUrl` come from NEXT_PUBLIC_* environment variables (they are public by nature and are
 * inlined at build time, so redeploy after changing them):
 *   NEXT_PUBLIC_SALON_PHONE  e.g. "0901 234 567" (human-readable; normalized for the tel: link)
 *   NEXT_PUBLIC_ZALO_URL     official Zalo link from the owner, e.g. "https://zalo.me/<phone-or-id>"
 *   NEXT_PUBLIC_SALON_ADDRESS, NEXT_PUBLIC_SALON_HOURS (display text only, no open/closed logic),
 *   NEXT_PUBLIC_GOOGLE_MAPS_URL (https link to the salon's Google Maps place)
 */
export const salonInfo = {
  name: "2IN.CORNER",
  address: process.env.NEXT_PUBLIC_SALON_ADDRESS ?? "",
  phone: process.env.NEXT_PUBLIC_SALON_PHONE ?? "",
  openingHoursText: process.env.NEXT_PUBLIC_SALON_HOURS ?? "",
  facebookUrl: "https://www.facebook.com/inwy.nd00",
  instagramUrl: "",
  tiktokUrl: "",
  zaloUrl: process.env.NEXT_PUBLIC_ZALO_URL ?? "",
  mapUrl: process.env.NEXT_PUBLIC_GOOGLE_MAPS_URL ?? "",
};
