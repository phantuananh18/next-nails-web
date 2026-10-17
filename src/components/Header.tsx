"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { galleryItems } from "@/config/gallery";

// Guest MVP: no accounts or backend API. The gallery link only appears once real gallery photos are configured.
const links = [
  { href: "/#services", label: "Dịch vụ" },
  ...(galleryItems.length > 0 ? [{ href: "/gallery", label: "Thư viện" }] : []),
  { href: "/#booking", label: "Đặt lịch" },
  { href: "/#contact", label: "Liên hệ" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-30 px-3 pt-3 sm:px-6">
      <div className="mx-auto max-w-5xl rounded-full border border-line bg-surface/85 shadow-sm shadow-black/5 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-2 sm:px-6">
          <Link href="/" className="brand-font text-2xl tracking-wide text-accent">
            2IN.CORNER
          </Link>

          <nav aria-label="Điều hướng chính" className="hidden items-center gap-1 text-sm font-medium text-muted md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-2 transition-colors hover:bg-page-alt hover:text-accent"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/#booking"
              className="ml-2 rounded-full bg-rose-600 px-5 py-2 font-semibold text-white transition-colors hover:bg-rose-700"
            >
              Đặt lịch ngay
            </Link>
          </nav>

          <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            type="button"
            className="-mr-2 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-muted hover:bg-page-alt md:hidden"
            aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
          </div>
        </div>

        {menuOpen && (
          <nav id="mobile-nav" aria-label="Điều hướng di động" className="flex flex-col gap-1 border-t border-line px-3 py-3 md:hidden">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-base font-medium text-muted hover:bg-page-alt"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/#booking"
              onClick={() => setMenuOpen(false)}
              className="mt-1 rounded-full bg-rose-600 px-4 py-3 text-center text-base font-semibold text-white"
            >
              Đặt lịch ngay
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
