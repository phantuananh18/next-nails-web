import Link from "next/link";
import { PhoneIcon } from "@/components/ContactButtons";
import SocialIcon, { type SocialIconName } from "@/components/SocialIcons";
import { galleryItems } from "@/config/gallery";
import { salonInfo } from "@/config/salon.config";
import { getHttpsHref, getTelHref } from "@/lib/contact";

interface FooterLink {
  key: string;
  ariaLabel: string;
  icon: SocialIconName | "phone";
  href: string | null;
  /** Brand colour revealed on hover */
  hover: string;
  external: boolean;
}

export default function Footer() {
  // Links come from the centralized salon config; unconfigured/invalid ones are hidden (nothing is invented).
  const links = (
    [
      { key: "facebook", ariaLabel: "Facebook của 2IN.CORNER", icon: "facebook", href: getHttpsHref(salonInfo.facebookUrl), hover: "hover:bg-[#1877f2]", external: true },
      { key: "zalo", ariaLabel: "Zalo của 2IN.CORNER", icon: "zalo", href: getHttpsHref(salonInfo.zaloUrl), hover: "hover:bg-[#0068ff]", external: true },
      { key: "instagram", ariaLabel: "Instagram của 2IN.CORNER", icon: "instagram", href: getHttpsHref(salonInfo.instagramUrl), hover: "hover:bg-[#d62976]", external: true },
      { key: "tiktok", ariaLabel: "TikTok của 2IN.CORNER", icon: "tiktok", href: getHttpsHref(salonInfo.tiktokUrl), hover: "hover:bg-[#161823]", external: true },
      { key: "phone", ariaLabel: "Gọi điện cho 2IN.CORNER", icon: "phone", href: salonInfo.phone ? getTelHref(salonInfo.phone) : null, hover: "hover:bg-rose-600", external: false },
    ] satisfies FooterLink[]
  ).filter((l) => l.href);

  return (
    <footer className="mt-8 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6">
        <div>
          <p className="brand-font text-2xl text-accent">2IN.CORNER</p>
          <p className="mt-2 max-w-xs text-sm text-muted">
            Một góc nhỏ dịu dàng để bạn thư giãn và có bộ móng xinh. Đặt lịch nhanh, chăm sóc tận tâm.
          </p>
        </div>
        <div className="text-sm text-muted sm:text-right">
          <nav aria-label="Liên kết chân trang" className="flex flex-wrap gap-x-5 gap-y-1 sm:justify-end">
            <Link href="/#services" className="py-2 hover:text-accent">Dịch vụ</Link>
            <Link href="/#booking" className="py-2 hover:text-accent">Đặt lịch</Link>
            {galleryItems.length > 0 && (
              <Link href="/gallery" className="py-2 hover:text-accent">Thư viện</Link>
            )}
            <Link href="/#contact" className="py-2 hover:text-accent">Liên hệ</Link>
          </nav>
          {links.length > 0 && (
            <ul aria-label="Kết nối với 2IN.CORNER" className="mt-4 flex flex-wrap justify-center gap-3 sm:justify-end">
              {links.map((l) => (
                <li key={l.key}>
                  <a
                    href={l.href ?? undefined}
                    {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    aria-label={l.ariaLabel}
                    title={l.ariaLabel}
                    className={`flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-accent transition-colors duration-200 hover:border-transparent hover:text-white focus-visible:ring-2 focus-visible:ring-rose-300 ${l.hover}`}
                  >
                    {l.icon === "phone" ? <PhoneIcon className="h-5 w-5" /> : <SocialIcon name={l.icon} className="h-5 w-5" />}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <p className="border-t border-line py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} 2IN.CORNER. Bảo lưu mọi quyền.
      </p>
    </footer>
  );
}
