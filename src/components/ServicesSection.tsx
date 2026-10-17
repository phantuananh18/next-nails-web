import Link from "next/link";
import { comboSale, discountNotice, serviceCategories, warrantyNotice, type ServiceCategory } from "@/config/services";

function CategoryHeading({ children }: { children: string }) {
  return (
    <h3 className="bg-menu-cream px-5 py-1.5 text-center font-display text-2xl font-semibold tracking-[0.12em] text-menu-ink sm:text-3xl">
      {children}
    </h3>
  );
}

function ComboSale() {
  return (
    <div className="mx-auto mb-12 max-w-2xl">
      <h3 className="text-center font-display text-4xl font-bold tracking-[0.1em] text-white sm:text-5xl">{comboSale.title}</h3>
      <div className="mt-5 rounded-3xl border border-white/20 bg-white/10 px-5 py-6 backdrop-blur-sm sm:px-8">
        {comboSale.groups.map((group, i) => (
          <div key={group.id}>
            {i > 0 && (
              <div aria-hidden className="my-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-white/25" />
                <span className="h-1.5 w-1.5 rotate-45 bg-white/60" />
                <span className="h-px flex-1 bg-white/25" />
              </div>
            )}
            <ul>
              {group.items.map((item) => (
                <li key={item.name} className="flex items-baseline justify-between gap-4 py-2">
                  <span className="text-base text-white">{item.name}</span>
                  <span className="shrink-0 text-right text-base font-semibold tabular-nums text-white">{item.priceLabel}</span>
                </li>
              ))}
            </ul>
            {group.note && <p className="mt-1 text-center text-sm italic text-white/70">{group.note}</p>}
          </div>
        ))}
      </div>
      <p className="mx-auto mt-5 w-fit rounded-full bg-menu-cream px-6 py-2 text-center text-sm font-semibold text-menu-ink sm:text-base">
        {comboSale.condition}
      </p>
      <p className="mt-3 text-center">
        <Link href="#booking" className="inline-flex min-h-11 items-center text-sm text-white/80 underline underline-offset-4 transition-colors hover:text-white">
          {comboSale.ctaLabel}
        </Link>
      </p>
    </div>
  );
}

function CategoryBlock({ category }: { category: ServiceCategory }) {
  const note = category.note && (
    <p className={`text-sm italic text-white/70 ${category.notePosition === "top" ? "mb-1 text-right" : "mt-3 text-center"}`}>
      {category.note}
    </p>
  );
  return (
    <div>
      <CategoryHeading>{category.title}</CategoryHeading>
      <div className="mt-4">
        {category.notePosition === "top" && note}
        <ul>
          {category.services.map((service) => (
            <li
              key={service.name}
              className="flex items-baseline justify-between gap-4 border-b border-white/10 py-2.5 last:border-b-0"
            >
              <span className="text-base text-white">{service.name}</span>
              <span className="shrink-0 text-right text-base font-semibold tabular-nums text-white">
                {service.priceLabel}
              </span>
            </li>
          ))}
        </ul>
        {category.notePosition !== "top" && note}
      </div>
    </div>
  );
}

/** Informational only: services are not part of the appointment request. */
export default function ServicesSection() {
  return (
    <section id="services" className="mx-auto max-w-5xl scroll-mt-24 px-4 py-16 sm:px-6">
      <h2 className="text-3xl text-ink sm:text-4xl">Dịch vụ</h2>
      <p className="mt-2 text-muted sm:whitespace-nowrap">
        Bạn không cần chọn dịch vụ khi đặt lịch, tiệm sẽ tư vấn và báo giá chi tiết khi gọi xác nhận.
      </p>

      <div className="marble-bg mt-8 rounded-3xl px-5 py-10 sm:px-10 sm:py-12">
        <ComboSale />

        <div className="grid gap-x-12 gap-y-10 md:grid-cols-2">
          {serviceCategories.map((category) => (
            <CategoryBlock key={category.id} category={category} />
          ))}
        </div>

        <div className="mt-12">
          <CategoryHeading>DISCOUNT</CategoryHeading>
          <p className="mt-4 text-center text-base text-white">{discountNotice}</p>
        </div>

        <p className="mt-8 text-center font-display text-xl font-semibold tracking-wide text-white">
          {warrantyNotice}
        </p>
      </div>

      <div className="mt-6">
        <Link
          href="#booking"
          className="inline-flex min-h-12 items-center rounded-full bg-rose-600 px-8 text-base font-semibold text-white shadow-md shadow-rose-200 transition-colors hover:bg-rose-700"
        >
          Đặt lịch ngay
        </Link>
      </div>
    </section>
  );
}
