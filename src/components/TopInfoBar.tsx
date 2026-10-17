import { PhoneIcon } from "@/components/ContactButtons";
import { salonInfo } from "@/config/salon.config";
import { getHttpsHref, getTelHref } from "@/lib/contact";

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-[#C9A38F]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-[#C9A38F]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

const linkClass = "underline-offset-2 transition-colors hover:text-white hover:underline";

/**
 * Compact information bar above the main navbar (not sticky: it scrolls away, the navbar stays).
 * Every item renders only when configured in `salonInfo`; with nothing configured the bar is not rendered.
 * Opening hours are informational text only (no open/closed logic).
 */
export default function TopInfoBar() {
  const hours = salonInfo.openingHoursText.trim();
  const address = salonInfo.address.trim();
  const phone = salonInfo.phone.trim();
  const mapsHref = salonInfo.mapUrl ? getHttpsHref(salonInfo.mapUrl) : null;
  const telHref = phone ? getTelHref(phone) : null;

  if (!hours && !address && !phone) return null;

  const addressItem = address ? (
    <span className="flex items-center gap-1.5">
      <MapPinIcon />
      {mapsHref ? (
        <a href={mapsHref} target="_blank" rel="noopener noreferrer" className={linkClass}>
          {address}
          <span className="sr-only"> (mở Google Maps trong tab mới)</span>
        </a>
      ) : (
        <span>{address}</span>
      )}
    </span>
  ) : null;

  return (
    <div className="bg-[#2D2826] text-xs text-[#E8DCD7] sm:text-[13px]">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-2 sm:px-6">
        {hours && (
          <span className="flex items-center gap-1.5">
            <ClockIcon />
            <span>{hours}</span>
          </span>
        )}

        <div className="ml-auto flex items-center gap-x-5">
          {/* Address sits beside the phone on tablet/desktop; on mobile it moves to its own row below */}
          {addressItem && <div className="hidden sm:block">{addressItem}</div>}
          {phone && (
            <span className="flex items-center gap-1.5">
              <PhoneIcon className="h-4 w-4 shrink-0 text-[#C9A38F]" />
              {telHref ? (
                <a href={telHref} className={`${linkClass} font-medium`}>
                  {phone}
                </a>
              ) : (
                <span>{phone}</span>
              )}
            </span>
          )}
        </div>

        {addressItem && <div className="w-full sm:hidden">{addressItem}</div>}
      </div>
    </div>
  );
}
