/**
 * Gallery images for the landing page and /gallery. Intentionally EMPTY: add only real photos of the salon's
 * work (nothing is invented here). The gallery sections and the "Thư viện" nav link stay hidden while this is empty.
 */
export interface GalleryItem {
  id: string;
  imageUrl: string;
  title?: string;
  /** Optional filter label shown on /gallery, e.g. "French", "Ombre" */
  style?: string;
  /** Featured items are shown first on the home page */
  isFeatured?: boolean;
}

export const galleryItems: GalleryItem[] = [];
