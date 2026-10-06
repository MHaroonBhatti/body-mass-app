"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { useScanDraft } from "@/lib/scan/draft-context";
import { SCAN_VIEWS, VIEW_LABELS } from "@/lib/types/scan";

export function ReviewGrid() {
  const router = useRouter();
  const { participant, photos, hasAllPhotos } = useScanDraft();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!participant) {
      router.replace("/scan/participant");
      return;
    }
    if (!hasAllPhotos) {
      const missing = SCAN_VIEWS.find((view) => !photos[view]);
      router.replace(missing ? `/scan/photo/${missing}` : "/scan/photo/front");
    }
  }, [participant, hasAllPhotos, photos, router]);

  if (!participant || !hasAllPhotos) {
    return <p className="text-sm text-[var(--muted)]">Redirecting…</p>;
  }

  function confirm() {
    setError(null);
    if (!hasAllPhotos) {
      setError("Please complete all four photos before submitting.");
      return;
    }
    router.push("/scan/submitting");
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Review photos</h1>
        <p className="text-sm text-[var(--muted)]">
          Confirm each orientation looks correct. You can replace any photo before submitting.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {SCAN_VIEWS.map((view) => {
          const photo = photos[view]!;
          return (
            <figure
              key={view}
              className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.previewUrl}
                alt={`${VIEW_LABELS[view]} thumbnail`}
                className="aspect-[3/4] w-full object-cover bg-[var(--surface-muted)]"
              />
              <figcaption className="flex items-center justify-between gap-2 px-3 py-2.5">
                <span className="text-sm font-medium">{VIEW_LABELS[view]}</span>
                <Button href={`/scan/photo/${view}`} variant="ghost" className="!px-2 !py-1 text-xs">
                  Replace
                </Button>
              </figcaption>
            </figure>
          );
        })}
      </div>

      <Alert tone="info">
        By confirming, you submit these photos as a private experimental scan. No body-fat analysis
        runs in this version.
      </Alert>

      {error ? <Alert tone="error">{error}</Alert> : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="button" onClick={confirm} fullWidth>
          Confirm &amp; Submit
        </Button>
        <Button href="/scan/photo/right" variant="secondary" fullWidth>
          Back
        </Button>
      </div>
    </div>
  );
}
