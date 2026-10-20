"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { GalleryItem } from "@/config/gallery";

interface GalleryGridProps {
  items: GalleryItem[];
  /** Layout of the thumbnail list (grid columns and gaps). */
  listClassName: string;
  /** `sizes` hint for the thumbnails, matching the grid columns. */
  sizes: string;
  /** "card" shows a bordered card with the optional title (/gallery); "plain" is the compact home variant. */
  variant: "card" | "plain";
}

const FALLBACK_ALT = "Mẫu nail của 2IN.CORNER";

/** Thumbnail grid with a lightbox (native <dialog>: focus trap and Esc come from the browser). */
export default function GalleryGrid({ items, listClassName, sizes, variant }: GalleryGridProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState<number | null>(null);
  const open = index !== null;
  const current = index !== null ? items[index] : null;

  // Keep the dialog in sync with state (showModal gives the backdrop, focus trap and Esc).
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const step = (delta: number) =>
    setIndex((i) => (i === null ? i : (i + delta + items.length) % items.length));

  const onKeyDown = (e: React.KeyboardEvent<HTMLDialogElement>) => {
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  };

  // The <img> fills the whole stage (object-contain), so a click on its empty letterbox area still targets it:
  // close unless the click lands on a control or on the visible picture itself.
  const onBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest("button")) return;
    if (target instanceof HTMLImageElement && target.naturalWidth > 0) {
      const box = target.getBoundingClientRect();
      const scale = Math.min(box.width / target.naturalWidth, box.height / target.naturalHeight);
      const shownW = target.naturalWidth * scale;
      const shownH = target.naturalHeight * scale;
      const insideX = Math.abs(e.clientX - (box.left + box.width / 2)) <= shownW / 2;
      const insideY = Math.abs(e.clientY - (box.top + box.height / 2)) <= shownH / 2;
      if (insideX && insideY) return;
    }
    setIndex(null);
  };

  const navButton =
    "absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

  return (
    <>
      <ul className={listClassName}>
        {items.map((item, i) => (
          <li
            key={item.id}
            className={
              variant === "card"
                ? "overflow-hidden rounded-3xl border border-line bg-surface shadow-sm shadow-black/5"
                : "overflow-hidden rounded-3xl bg-surface shadow-sm shadow-black/5"
            }
          >
            <button
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Xem ảnh ${i + 1}${item.title ? `: ${item.title}` : ""}`}
              className="relative block aspect-square w-full focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-rose-600"
            >
              <Image
                src={item.imageUrl}
                alt={item.title ?? FALLBACK_ALT}
                fill
                sizes={sizes}
                className={`object-cover${variant === "plain" ? " transition-transform duration-300 hover:scale-105" : ""}`}
              />
            </button>
            {variant === "card" && item.title && <p className="p-3 text-sm text-muted">{item.title}</p>}
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        aria-label="Xem ảnh"
        onClose={() => setIndex(null)}
        onKeyDown={onKeyDown}
        onClick={onBackdropClick}
        className="m-auto h-dvh max-h-none w-screen max-w-none border-0 bg-transparent p-0 backdrop:bg-black/85"
      >
        {current && (
          <div className="relative flex h-full w-full items-center justify-center p-4 sm:p-12">
            <div className="relative h-full w-full">
              <Image
                key={current.id}
                src={current.imageUrl}
                alt={current.title ?? FALLBACK_ALT}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
            <button
              type="button"
              onClick={() => setIndex(null)}
              aria-label="Đóng"
              className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            {items.length > 1 && (
              <>
                <button type="button" onClick={() => step(-1)} aria-label="Ảnh trước" className={`${navButton} left-3`}>
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M15 5l-7 7 7 7" />
                  </svg>
                </button>
                <button type="button" onClick={() => step(1)} aria-label="Ảnh sau" className={`${navButton} right-3`}>
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
            <p aria-live="polite" className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-sm text-white">
              {index! + 1} / {items.length}
              {current.title ? ` · ${current.title}` : ""}
            </p>
          </div>
        )}
      </dialog>
    </>
  );
}
