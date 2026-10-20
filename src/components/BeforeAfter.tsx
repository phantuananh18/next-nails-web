import GalleryGrid from "@/components/GalleryGrid";
import type { GalleryItem } from "@/config/gallery";
import { beforeAfter } from "@/config/showcase";

/** Renders only real, configured before/after photos; renders nothing when there are none. */
export default function BeforeAfter() {
  if (beforeAfter.length === 0) return null;

  // Each pair becomes two consecutive tiles (before, after) so the shared lightbox can step through them.
  const items: GalleryItem[] = beforeAfter.flatMap((item, i) => {
    const suffix = item.caption ? ` · ${item.caption}` : "";
    return [
      { id: `before-${i}`, imageUrl: item.beforeUrl, title: `Trước${suffix}` },
      { id: `after-${i}`, imageUrl: item.afterUrl, title: `Sau${suffix}` },
    ];
  });

  return (
    // No vertical padding: the neighbouring sections (gallery above, services below) already add py-16.
    <section className="mx-auto max-w-5xl px-4 sm:px-6">
      <h2 className="text-3xl text-ink sm:text-4xl">Trước & sau</h2>
      <GalleryGrid
        items={items}
        variant="card"
        listClassName="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
      />
    </section>
  );
}
