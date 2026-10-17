import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Bitcount_Ink, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import TopInfoBar from "@/components/TopInfoBar";
import Footer from "@/components/Footer";
import { getContactLinks } from "@/components/ContactButtons";
import StickyContactBar from "@/components/StickyContactBar";

// Both families ship a Vietnamese subset (needed for correct diacritics).
const body = Be_Vietnam_Pro({
  variable: "--font-body",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600", "700"],
  display: "swap",
});

// Brand name only ("2IN.CORNER", .brand-font). One static weight, latin subset: the brand has no diacritics.
const brand = Bitcount_Ink({
  variable: "--font-bitcount-ink",
  subsets: ["latin"],
  weight: "600",
  display: "swap",
  adjustFontFallback: false, // no fallback metrics published for this font
});

// Runs before first paint: saved choice wins, otherwise follow the system colour scheme.
const themeInitScript = `(function(){try{var t=localStorage.getItem("theme");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;if(d)document.documentElement.classList.add("dark")}catch(e){}})()`;

export const metadata: Metadata = {
  title: "Đặt lịch làm nails ở Tân Bình, TP.HCM · 2IN.CORNER",
  description: "Đặt lịch làm nail nhanh chóng: chọn ngày giờ mong muốn, tiệm sẽ gọi tư vấn và xác nhận cho bạn.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e5e5e5" },
    { media: "(prefers-color-scheme: dark)", color: "#242424" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const { zalo, tel } = getContactLinks();
  return (
    <html lang="vi" suppressHydrationWarning className={`${body.variable} ${display.variable} ${brand.variable} h-full antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-full flex-col bg-page text-ink">
        <a
          href="#main"
          className="sr-only z-50 rounded-full bg-surface px-4 py-2 text-sm font-semibold text-accent focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Bỏ qua điều hướng
        </a>
        <TopInfoBar />
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <StickyContactBar zaloHref={zalo} telHref={tel} />
      </body>
    </html>
  );
}
