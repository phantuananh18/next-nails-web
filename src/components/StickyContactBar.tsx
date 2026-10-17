"use client";

import { useEffect, useState } from "react";
import { PhoneIcon, ZaloIcon } from "@/components/ContactButtons";

interface Props {
  zaloHref: string | null;
  telHref: string | null;
}

const item =
  "flex min-h-12 flex-1 items-center justify-center gap-1.5 rounded-full px-3 text-sm font-semibold transition-colors";

/**
 * Compact mobile-only contact bar. Hidden while the online request form is on screen so it never covers
 * the form controls, and a spacer keeps the footer from being hidden behind it.
 */
export default function StickyContactBar({ zaloHref, telHref }: Props) {
  const [formVisible, setFormVisible] = useState(false);

  useEffect(() => {
    const target = document.getElementById("booking");
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => setFormVisible(entry.isIntersecting), { threshold: 0.05 });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  if (!zaloHref && !telHref) return null;

  return (
    <>
      <div aria-hidden="true" className="h-20 md:hidden" />
      <nav
        aria-label="Liên hệ nhanh"
        className={`fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-transform duration-300 md:hidden ${
          formVisible ? "translate-y-full" : "translate-y-0"
        }`}
        inert={formVisible}
      >
        <div className="mx-auto flex max-w-md gap-2 rounded-full border border-line bg-surface/95 p-2 shadow-lg shadow-black/10 backdrop-blur">
          {telHref && (
            <a href={telHref} className={`${item} text-accent hover:bg-page-alt`}>
              <PhoneIcon className="h-5 w-5" />
              Gọi điện
            </a>
          )}
          {zaloHref && (
            <a
              href={zaloHref}
              target="_blank"
              rel="noopener noreferrer"
              className={`${item} bg-[#0068ff] text-white hover:bg-[#0057d6]`}
            >
              <ZaloIcon className="h-5 w-5" />
              Zalo
            </a>
          )}
          <a href="#booking" className={`${item} bg-rose-600 text-white hover:bg-rose-700`}>
            Đặt lịch
          </a>
        </div>
      </nav>
    </>
  );
}
