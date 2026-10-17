import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Cormorant_Garamond } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Đặt lịch làm nails ở Tân Bình, TP.HCM · 2IN.CORNER",
  description: "Đặt lịch làm nail nhanh chóng: chọn ngày giờ mong muốn, tiệm sẽ gọi tư vấn và xác nhận cho bạn.",
};

export const viewport: Viewport = { themeColor: "#fffaf7" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  const { zalo, tel } = getContactLinks();
  return (
    <html lang="vi" className={`${body.variable} ${display.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-cream text-ink">
        <a
          href="#main"
          className="sr-only z-50 rounded-full bg-white px-4 py-2 text-sm font-semibold text-rose-700 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
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
