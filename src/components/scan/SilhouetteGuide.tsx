import type { ScanView } from "@/lib/types/scan";

/**
 * Abstract body outline — not a real person image.
 */
export function SilhouetteGuide({ view }: { view: ScanView }) {
  const label =
    view === "front"
      ? "Front outline"
      : view === "back"
        ? "Back outline"
        : view === "left"
          ? "Left-side outline"
          : "Right-side outline";

  const flip = view === "right";

  return (
    <div
      className="flex aspect-[3/4] w-full max-w-[220px] items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-muted)]"
      role="img"
      aria-label={label}
    >
      <svg
        viewBox="0 0 120 200"
        className={`h-[85%] w-auto text-[var(--accent)]/70 ${flip ? "-scale-x-100" : ""}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {(view === "front" || view === "back") && (
          <>
            <circle cx="60" cy="28" r="16" stroke="currentColor" strokeWidth="3" />
            <path
              d="M38 52c8-6 36-6 44 0l14 22c2 3 1 7-2 9l-12 6v36l10 48c1 4-2 8-6 8h-10l-8-42-8 42H50c-4 0-7-4-6-8l10-48V89L42 83c-3-2-4-6-2-9l14-22z"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <path
              d="M44 88h32M48 120h24"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.5"
            />
          </>
        )}
        {(view === "left" || view === "right") && (
          <>
            <circle cx="62" cy="28" r="15" stroke="currentColor" strokeWidth="3" />
            <path
              d="M58 44c10 2 18 10 20 22l6 20c1 4-1 7-5 8l-8 2v34l8 50c1 4-2 8-6 8h-8l-10-46-4 46H42c-4 0-7-4-6-8l12-50V96l-10-4c-3-1-5-5-3-8l10-18c4-8 14-16 23-22z"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinejoin="round"
            />
          </>
        )}
      </svg>
    </div>
  );
}
