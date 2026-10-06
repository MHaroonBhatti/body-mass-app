"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { SilhouetteGuide } from "@/components/scan/SilhouetteGuide";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useScanDraft } from "@/lib/scan/draft-context";
import { VIEW_HINTS, VIEW_LABELS, type ScanView } from "@/lib/types/scan";
import { validatePhotoFile } from "@/lib/validation/photo";
import { nextView, previousView, viewStepNumber } from "@/lib/validation/views";

export function PhotoStep({ view }: { view: ScanView }) {
  const router = useRouter();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const { photos, setPhoto, clearPhoto, participant } = useScanDraft();
  const current = photos[view];
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!participant) {
      router.replace("/scan/participant");
    }
  }, [participant, router]);

  if (!participant) {
    return <p className="text-sm text-[var(--muted)]">Redirecting…</p>;
  }

  const step = viewStepNumber(view);
  const prev = previousView(view);
  const next = nextView(view);

  async function onFileChange(fileList: FileList | null) {
    const file = fileList?.[0];
    setError(null);
    setBusy(true);
    try {
      const result = await validatePhotoFile(file);
      if (!result.ok) {
        setError(result.error.message);
        if (inputRef.current) inputRef.current.value = "";
        return;
      }

      const previewUrl = URL.createObjectURL(file as File);
      setPhoto({
        view,
        file: file as File,
        previewUrl,
        width: result.width,
        height: result.height,
      });
    } finally {
      setBusy(false);
    }
  }

  function continueNext() {
    if (!current) {
      setError("Please add a photo before continuing.");
      return;
    }
    if (next) {
      router.push(`/scan/photo/${next}`);
    } else {
      router.push("/scan/review");
    }
  }

  return (
    <div className="space-y-6">
      <ProgressBar current={step} total={4} label={`Photo ${step} of 4 — ${VIEW_LABELS[view]}`} />

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{VIEW_LABELS[view]} photo</h1>
        <p className="text-sm leading-relaxed text-[var(--muted)]">{VIEW_HINTS[view]}</p>
      </div>

      {!current ? (
        <div className="flex flex-col items-center gap-5 rounded-2xl border border-[var(--border)] bg-white p-5">
          <SilhouetteGuide view={view} />
          <div className="w-full space-y-3">
            <input
              ref={inputRef}
              id={inputId}
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={(event) => onFileChange(event.target.files)}
            />
            <Button
              type="button"
              fullWidth
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            >
              {busy ? "Checking photo…" : "Take or upload photo"}
            </Button>
            <p className="text-center text-xs text-[var(--muted)]">
              Uses your device camera on mobile when available, or file upload on desktop.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-white p-4">
          <div className="overflow-hidden rounded-xl bg-[var(--surface-muted)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.previewUrl}
              alt={`${VIEW_LABELS[view]} photo preview`}
              className="mx-auto max-h-[55vh] w-full object-contain"
            />
          </div>
          <p className="text-sm font-medium">{VIEW_LABELS[view]} ready</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                clearPhoto(view);
                setError(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
            >
              Replace
            </Button>
            <Button type="button" onClick={continueNext}>
              {next ? "Continue" : "Review photos"}
            </Button>
          </div>
          <input
            ref={inputRef}
            id={`${inputId}-replace`}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={(event) => onFileChange(event.target.files)}
          />
        </div>
      )}

      {error ? <Alert tone="error">{error}</Alert> : null}

      <div className="flex justify-between gap-3">
        <Button
          href={prev ? `/scan/photo/${prev}` : "/scan/instructions"}
          variant="ghost"
        >
          Back
        </Button>
        {current ? (
          <Button type="button" onClick={continueNext}>
            {next ? "Continue" : "Review"}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
