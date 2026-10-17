/**
 * Gallery images for the landing page and /gallery: real photos of the salon's work, stored in public/assets/gallery.
 * The gallery sections and the "Thư viện" nav link stay hidden while this list is empty.
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

export const galleryItems: GalleryItem[] = [
  { id: "nail-1", imageUrl: "/assets/gallery/image-1.jpg" },
  { id: "nail-2", imageUrl: "/assets/gallery/image-2.jpg" },
  { id: "nail-3", imageUrl: "/assets/gallery/image-3.jpg" },
  { id: "nail-4", imageUrl: "/assets/gallery/image-4.jpg" },
  { id: "nail-5", imageUrl: "/assets/gallery/image-5.jpg" },
  { id: "nail-6", imageUrl: "/assets/gallery/image-6.jpg" },
  { id: "nail-7", imageUrl: "/assets/gallery/image-7.jpg" },
  { id: "nail-8", imageUrl: "/assets/gallery/image-8.jpg" },
  { id: "nail-9", imageUrl: "/assets/gallery/image-9.jpg" },
  { id: "nail-10", imageUrl: "/assets/gallery/image-10.jpg" },
  { id: "nail-11", imageUrl: "/assets/gallery/image-11.jpg" },
  { id: "nail-12", imageUrl: "/assets/gallery/image-12.jpg" },
  { id: "nail-13", imageUrl: "/assets/gallery/image-13.jpg" },
  { id: "nail-14", imageUrl: "/assets/gallery/image-14.jpg" },
  { id: "nail-15", imageUrl: "/assets/gallery/image-15.jpg" },
];
