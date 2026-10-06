"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { useScanDraft } from "@/lib/scan/draft-context";
import { SCAN_VIEWS } from "@/lib/types/scan";

type Phase = "uploading" | "error" | "done";

export function SubmittingClient() {
  const router = useRouter();
  const { participant, photos, hasAllPhotos, resetDraft } = useScanDraft();
  const [phase, setPhase] = useState<Phase>("uploading");
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!participant || !hasAllPhotos) {
      router.replace("/scan/participant");
      return;
    }

    let cancelled = false;

    async function submit() {
      setPhase("uploading");
      setError(null);

      try {
        const formData = new FormData();
        formData.set("age", String(participant!.age));
        formData.set("sex", participant!.sex);
        formData.set("heightCm", String(participant!.heightCm));
        formData.set("weightKg", String(participant!.weightKg));
        formData.set("participantId", participant!.participantId ?? "");

        for (const view of SCAN_VIEWS) {
          const photo = photos[view]!;
          formData.set(`photo_${view}`, photo.file, photo.file.name);
          formData.set(`width_${view}`, String(photo.width));
          formData.set(`height_${view}`, String(photo.height));
        }

        const response = await fetch("/api/scans", {
          method: "POST",
          body: formData,
        });

        const payload = (await response.json()) as {
          ok?: boolean;
          scanId?: string;
          error?: string;
        };

        if (!response.ok || !payload.ok || !payload.scanId) {
          throw new Error(payload.error || "Submission failed. Please try again.");
        }

        if (cancelled) return;

        setPhase("done");
        const scanId = payload.scanId;
        resetDraft();
        router.replace(`/scans/${scanId}`);
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof TypeError
            ? "Network error. Check your connection and try again."
            : err instanceof Error
              ? err.message
              : "Submission failed. Please try again.";
        setError(message);
        setPhase("error");
      }
    }

    void submit();

    return () => {
      cancelled = true;
    };
    // attempt drives retries; participant/photos captured for the current attempt
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  return (
    <div className="space-y-6 py-8">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {phase === "error" ? "Upload interrupted" : "Saving your scan"}
        </h1>
        <p className="text-sm text-[var(--muted)]">
          {phase === "error"
            ? "Nothing was marked as complete. You can retry without re-entering details."
            : "Uploading photos securely. Keep this page open."}
        </p>
      </div>

      {phase === "uploading" || phase === "done" ? (
        <div className="flex flex-col items-center gap-4">
          <div
            className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--accent)]"
            aria-hidden="true"
          />
          <p className="text-sm text-[var(--muted)]" role="status">
            Processing…
          </p>
        </div>
      ) : null}

      {phase === "error" && error ? (
        <div className="space-y-4">
          <Alert tone="error" title="Could not save scan">
            {error}
          </Alert>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="button" fullWidth onClick={() => setAttempt((value) => value + 1)}>
              Retry upload
            </Button>
            <Button href="/scan/review" variant="secondary" fullWidth>
              Back to review
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
