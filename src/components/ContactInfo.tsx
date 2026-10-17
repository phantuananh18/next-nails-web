import type { ReactNode } from "react";
import { PhoneIcon, ZaloIcon, getContactLinks } from "@/components/ContactButtons";
import SocialIcon from "@/components/SocialIcons";
import { salonInfo } from "@/config/salon.config";
import { getHttpsHref } from "@/lib/contact";

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

function MapPinIcon() {
  return (
    <svg {...iconProps} className="h-5 w-5">
      <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg {...iconProps} className="h-5 w-5">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

const linkClass = "text-accent underline-offset-2 hover:underline dark:text-[#8c3d55]";
const actionBase =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors duration-200";

function InfoRow({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 shrink-0 text-accent dark:text-rose-700">{icon}</span>
      <div>
        <dt className="font-semibold text-ink dark:text-[#222222]">{label}</dt>
        <dd>{children}</dd>
      </div>
    </div>
  );
}

/** Contact details and direct-contact links. Every item renders only when configured; these links never create a booking. */
export default function ContactInfo() {
  const { zalo, tel } = getContactLinks();
  const facebook = getHttpsHref(salonInfo.facebookUrl);

  return (
    <div>
      <h2 className="text-3xl text-ink dark:text-[#222222] sm:text-4xl">Liên hệ</h2>
      <dl className="mt-6 space-y-4 text-base text-muted dark:text-[#555555]">
        {salonInfo.address && (
          <InfoRow icon={<MapPinIcon />} label="Địa chỉ">
            {salonInfo.mapUrl ? (
              <a href={salonInfo.mapUrl} className={linkClass} target="_blank" rel="noreferrer">
                {salonInfo.address}
              </a>
            ) : (
              salonInfo.address
            )}
          </InfoRow>
        )}
        {salonInfo.phone && (
          <InfoRow icon={<PhoneIcon className="h-5 w-5" />} label="Điện thoại">
            <a href={tel ?? undefined} className={linkClass}>
              {salonInfo.phone}
            </a>
          </InfoRow>
        )}
        {salonInfo.openingHoursText && (
          <InfoRow icon={<ClockIcon />} label="Giờ mở cửa">
            {salonInfo.openingHoursText}
          </InfoRow>
        )}
      </dl>

      {(zalo || tel || facebook) && (
        <div className="mt-6 flex flex-wrap gap-3">
          {zalo && (
            <a href={zalo} target="_blank" rel="noopener noreferrer" className={`${actionBase} bg-[#0068ff] text-white hover:bg-[#0057d6]`}>
              <ZaloIcon className="h-5 w-5" />
              Nhắn Zalo
              <span className="sr-only"> (mở trong tab mới)</span>
            </a>
          )}
          {tel && (
            <a href={tel} className={`${actionBase} bg-rose-600 text-white hover:bg-rose-700`}>
              <PhoneIcon className="h-5 w-5" />
              Gọi điện
            </a>
          )}
          {facebook && (
            <a
              href={facebook}
              target="_blank"
              rel="noopener noreferrer"
              className={`${actionBase} border border-line bg-surface text-ink hover:bg-page-alt dark:border-[#d4d4d4] dark:bg-white dark:text-[#222222] dark:hover:bg-[#f5f5f5]`}
            >
              <SocialIcon name="facebook" className="h-5 w-5" />
              Facebook
              <span className="sr-only"> (mở trong tab mới)</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
}
