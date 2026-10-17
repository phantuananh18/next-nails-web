import { beforeAfter } from "@/config/showcase";

/** Renders only real, configured before/after photos; renders nothing when there are none. */
export default function BeforeAfter() {
  if (beforeAfter.length === 0) return null;
  return (
    <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
      <h3 className="text-2xl text-ink">Trước & sau</h3>
      <ul className="mt-6 grid gap-5 sm:grid-cols-2">
        {beforeAfter.map((item) => (
          <li key={item.afterUrl} className="overflow-hidden rounded-3xl bg-surface shadow-sm shadow-black/5">
            <div className="grid grid-cols-2 gap-px bg-line">
              {/* eslint-disable-next-line @next/next/no-img-element -- admin-supplied URLs */}
              <img src={item.beforeUrl} alt="Móng trước khi làm" loading="lazy" className="aspect-square w-full object-cover" />
              {/* eslint-disable-next-line @next/next/no-img-element -- admin-supplied URLs */}
              <img src={item.afterUrl} alt="Móng sau khi làm" loading="lazy" className="aspect-square w-full object-cover" />
            </div>
            {item.caption && <p className="p-4 text-sm text-muted">{item.caption}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
