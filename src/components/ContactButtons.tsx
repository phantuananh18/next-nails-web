import { salonInfo } from "@/config/salon.config";
import { getTelHref, getZaloHref } from "@/lib/contact";

export function getContactLinks() {
  return {
    zalo: salonInfo.zaloUrl ? getZaloHref(salonInfo.zaloUrl) : null,
    tel: salonInfo.phone ? getTelHref(salonInfo.phone) : null,
  };
}

export function ZaloIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2C6.48 2 2 5.97 2 10.86c0 2.6 1.28 4.93 3.3 6.55-.1.9-.5 2.1-1.4 3.1-.15.17-.02.44.2.4 1.6-.28 3.1-.98 4.1-1.72.9.24 1.8.37 2.8.37 5.52 0 10-3.97 10-8.7S17.52 2 12 2z"
      />
      <text x="12" y="13.6" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#0068ff" fontFamily="Arial, sans-serif">
        Zalo
      </text>
    </svg>
  );
}

export function PhoneIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 4h3.5l1.7 4.2-2 1.3a11 11 0 0 0 5.3 5.3l1.3-2 4.2 1.7V18a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z" />
    </svg>
  );
}

const base =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-base font-semibold transition-colors duration-200";

/**
 * "Đặt lịch qua Zalo" / "Gọi điện đặt lịch". Each button renders only when its setting is configured and valid,
 * and the whole component renders nothing otherwise. These are direct-contact links: they do NOT create a
 * booking record or send an email (only the online request form does).
 */
export default function ContactButtons({ className = "" }: { className?: string }) {
  const { zalo, tel } = getContactLinks();
  if (!zalo && !tel) return null;

  return (
    <div className={`flex flex-col gap-3 sm:flex-row ${className}`}>
      {zalo && (
        <a
          href={zalo}
          target="_blank"
          rel="noopener noreferrer"
          className={`${base} bg-[#0068ff] text-white shadow-md shadow-blue-100 hover:bg-[#0057d6]`}
        >
          <ZaloIcon />
          Đặt lịch qua Zalo
          <span className="sr-only"> (mở trong tab mới)</span>
        </a>
      )}
      {tel && (
        <a
          href={tel}
          aria-label={`Gọi điện đặt lịch ${salonInfo.phone}`}
          className={`${base} border border-rose-300 bg-white text-rose-700 hover:bg-rose-50`}
        >
          <PhoneIcon />
          Gọi điện đặt lịch
        </a>
      )}
    </div>
  );
}
