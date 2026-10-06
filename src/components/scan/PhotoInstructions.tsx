import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { PHOTO_INSTRUCTIONS } from "@/lib/scan/constants";

export function PhotoInstructions() {
  return (
    <div className="space-y-6">
      <Alert tone="info" title="Consistency matters">
        This is an experimental estimation system. Clear, consistent photos are essential for
        future analysis. No body-fat result is produced in this version.
      </Alert>

      <ul className="space-y-2.5">
        {PHOTO_INSTRUCTIONS.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-relaxed text-[var(--foreground)]">
            <span
              className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]"
              aria-hidden="true"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button href="/scan/photo/front" fullWidth>
          Start photos
        </Button>
        <Button href="/scan/participant" variant="secondary" fullWidth>
          Back
        </Button>
      </div>

      <p className="text-center text-xs text-[var(--muted)]">
        Need to review later?{" "}
        <Link href="/scans" className="underline underline-offset-2">
          View scan history
        </Link>
      </p>
    </div>
  );
}
