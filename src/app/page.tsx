import Link from "next/link";
import BeforeAfter from "@/components/BeforeAfter";
import ContactButtons from "@/components/ContactButtons";
import ContactInfo from "@/components/ContactInfo";
import ContactMap from "@/components/ContactMap";
import GalleryGrid from "@/components/GalleryGrid";
import BookingRequestForm from "@/components/booking/BookingRequestForm";
import ServicesSection from "@/components/ServicesSection";
import Testimonials from "@/components/Testimonials";
import { salonInfo } from "@/config/salon.config";
import { getHttpsHref, getMapEmbedHref } from "@/lib/contact";
import { galleryItems } from "@/config/gallery";

const steps = [
  { title: "Chọn ngày & giờ", text: "Chọn thời gian bạn mong muốn trong giờ mở cửa." },
  { title: "Để lại thông tin", text: "Họ tên và số điện thoại để tiệm liên hệ với bạn." },
  { title: "Tiệm gọi xác nhận", text: "Tiệm tư vấn dịch vụ và xác nhận lịch hẹn qua điện thoại." },
];

export default function HomePage() {
  // Gallery comes from src/config/gallery.ts (empty until real photos are added => section hidden).
  const featured = galleryItems.filter((g) => g.isFeatured);
  const featuredGallery = (featured.length > 0 ? featured : galleryItems).slice(0, 8);

  const mapHref = getHttpsHref(salonInfo.mapUrl);
  const mapEmbedHref = getMapEmbedHref(salonInfo.mapEmbedUrl);
  const hasMap = Boolean(mapHref || mapEmbedHref);

  return (
    <div>
      <section className="relative overflow-hidden px-4 pb-16 pt-16 sm:px-6 sm:pb-24 sm:pt-24">
        <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-surface opacity-80 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-page-alt opacity-90 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-page-alt opacity-80 blur-3xl" />

        <div className="animate-fade-up relative mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-accent">Nail studio</p>
          <h1 className="brand-font mt-4 text-5xl text-accent sm:text-7xl">2IN.CORNER</h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted">
            Một góc nhỏ dịu dàng để bạn thư giãn và có bộ móng xinh. Chọn ngày giờ mong muốn và gửi yêu cầu đặt lịch chỉ trong
            vài bước, tiệm sẽ gọi tư vấn và xác nhận cho bạn.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="#booking"
              className="inline-flex min-h-12 items-center rounded-full bg-rose-600 px-8 text-base font-semibold text-white shadow-md shadow-rose-200 transition-colors hover:bg-rose-700"
            >
              Đặt lịch ngay
            </Link>
            <Link
              href="#services"
              className="inline-flex min-h-12 items-center rounded-full border border-rose-300 bg-surface/70 px-8 text-base font-semibold text-accent transition-colors hover:bg-page-alt"
            >
              Xem dịch vụ
            </Link>
          </div>
          <ContactButtons className="mt-3 items-center justify-center" />
        </div>

        <ol className="relative mx-auto mt-14 grid max-w-4xl gap-4 sm:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="rounded-3xl border border-line bg-surface/70 p-5 shadow-sm shadow-black/5 backdrop-blur">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-page-alt text-sm font-semibold text-accent">
                {i + 1}
              </span>
              <h2 className="mt-3 font-display text-xl font-semibold text-ink">{s.title}</h2>
              <p className="mt-1 text-sm text-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {featuredGallery.length > 0 && (
        <section id="gallery" className="mx-auto max-w-5xl scroll-mt-24 px-4 py-16 sm:px-6">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-3xl text-ink sm:text-4xl">Thư viện cảm hứng</h2>
            <Link href="/gallery" className="py-2 text-sm font-medium text-accent hover:underline">
              Xem thêm
            </Link>
          </div>
          <GalleryGrid
            items={featuredGallery}
            variant="plain"
            listClassName="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
            sizes="(min-width: 1024px) 256px, (min-width: 640px) 25vw, 50vw"
          />
        </section>
      )}

      <BeforeAfter />

      <ServicesSection />

      <BookingRequestForm />

      <Testimonials />

      <section id="contact" className="scroll-mt-24 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-5xl rounded-4xl bg-success-bg p-6 dark:border dark:border-[#d4d4d4] dark:bg-white sm:p-12">
          <div className={`grid items-start gap-8 ${hasMap ? "lg:grid-cols-[9fr_11fr] lg:gap-12" : ""}`}>
            <ContactInfo />
            {hasMap && <ContactMap embedHref={mapEmbedHref} mapHref={mapHref} />}
          </div>
        </div>
      </section>
    </div>
  );
}
