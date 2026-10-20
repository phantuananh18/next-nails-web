import Link from "next/link";
import { notFound } from "next/navigation";
import GalleryGrid from "@/components/GalleryGrid";
import { galleryItems } from "@/config/gallery";

export const metadata = { title: "Thư viện — 2IN.CORNER" };

export default async function GalleryPage({ searchParams }: { searchParams: Promise<{ style?: string }> }) {
  // No photos configured yet (src/config/gallery.ts) => there is no gallery page.
  if (galleryItems.length === 0) notFound();

  const { style } = await searchParams;
  const styles = [...new Set(galleryItems.map((g) => g.style).filter((s): s is string => Boolean(s)))];
  const items = style ? galleryItems.filter((g) => g.style === style) : galleryItems;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl text-ink sm:text-4xl">Thư viện cảm hứng</h1>
      <p className="mt-2 text-muted">Tham khảo các mẫu nail tại 2IN.CORNER.</p>

      {styles.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/gallery"
            className={`inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium ${
              !style ? "bg-rose-600 text-white" : "border border-line text-muted hover:bg-page-alt"
            }`}
          >
            Tất cả
          </Link>
          {styles.map((s) => (
            <Link
              key={s}
              href={`/gallery?style=${encodeURIComponent(s)}`}
              className={`inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium ${
                style === s ? "bg-rose-600 text-white" : "border border-line text-muted hover:bg-page-alt"
              }`}
            >
              {s}
            </Link>
          ))}
        </div>
      )}

      <GalleryGrid
        items={items}
        variant="card"
        listClassName="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
      />
    </div>
  );
}
