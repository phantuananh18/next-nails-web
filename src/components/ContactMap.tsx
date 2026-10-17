interface ContactMapProps {
  /** Validated Google Maps Embed URL (iframe src), or null when not configured. */
  embedHref: string | null;
  /** Validated https link to the salon's Google Maps place, or null. */
  mapHref: string | null;
}

/**
 * Map panel for the contact section. The iframe keeps Google's native colours in both themes (no CSS filters).
 * The external link sits below the map because Google's own controls occupy the map corners.
 * Without a valid embed URL it falls back to a plain placeholder with the external link; nothing is invented.
 */
export default function ContactMap({ embedHref, mapHref }: ContactMapProps) {
  return (
    <div>
      <div className="h-80 overflow-hidden rounded-3xl border border-line bg-surface dark:border-[#d4d4d4] sm:h-90 lg:h-115">
        {embedHref ? (
          <iframe
            title="Bản đồ vị trí 2IN.CORNER"
            src={embedHref}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="block h-full w-full border-0"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-muted dark:text-[#555555]">
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" />
              <circle cx="12" cy="9.5" r="2.5" />
            </svg>
            <p>Xem vị trí tiệm trên Google Maps.</p>
          </div>
        )}
      </div>
      {mapHref && (
        <div className="mt-3 flex justify-end">
          <a
            href={mapHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-rose-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-rose-700"
          >
            Mở Google Maps
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
            </svg>
            <span className="sr-only"> (mở trong tab mới)</span>
          </a>
        </div>
      )}
    </div>
  );
}
