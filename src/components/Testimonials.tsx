import { testimonials } from "@/config/showcase";

/** Renders only real, configured testimonials; renders nothing when there are none. */
export default function Testimonials() {
  if (testimonials.length === 0) return null;
  return (
    <section id="testimonials" className="scroll-mt-24 bg-lavender-50 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl text-ink sm:text-4xl">Khách hàng nói gì</h2>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <li key={`${t.author}-${t.quote.slice(0, 20)}`}>
              <figure className="h-full rounded-3xl bg-white p-6 shadow-sm shadow-lavender-300/40">
                <blockquote className="text-zinc-700">“{t.quote}”</blockquote>
                <figcaption className="mt-4 text-sm">
                  <span className="font-semibold text-ink">{t.author}</span>
                  {t.service && <span className="text-zinc-500"> · {t.service}</span>}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
