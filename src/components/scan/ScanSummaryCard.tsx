import type { ReactNode } from "react";
import { Alert } from "@/components/ui/Alert";
import { scanBmiDisplay } from "@/lib/scan/mappers";
import { VIEW_LABELS, type ScanWithImages } from "@/lib/types/scan";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function ScanSummaryCard({ scan }: { scan: ScanWithImages }) {
  const bmi = scanBmiDisplay(scan.heightCm, scan.weightKg);
  const photosSubmitted = scan.images.length;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-[var(--accent)]">Scan saved</p>
        <h1 className="text-2xl font-semibold tracking-tight">Your scan is stored</h1>
        <p className="text-sm text-[var(--muted)]">
          Photos were saved privately. Body composition analysis will be added in a future version.
        </p>
      </div>

      <dl className="divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-white">
        <SummaryRow term="Scan ID" detail={<code className="text-xs break-all">{scan.id}</code>} />
        <SummaryRow term="Date" detail={formatDate(scan.createdAt)} />
        <SummaryRow term="Height" detail={`${scan.heightCm} cm`} />
        <SummaryRow term="Weight" detail={`${scan.weightKg} kg`} />
        <SummaryRow term="Current BMI" detail={bmi} />
        <SummaryRow
          term="Photos submitted"
          detail={`${photosSubmitted} of 4 (${scan.images.map((image) => VIEW_LABELS[image.view]).join(", ")})`}
        />
        <SummaryRow term="Status" detail={scan.status} />
        {scan.participantId ? (
          <SummaryRow term="Participant ID" detail={scan.participantId} />
        ) : null}
      </dl>

      <Alert tone="info">
        BMI is a general weight-to-height metric and is not a direct measurement of body fat.
      </Alert>

      <Alert tone="success" title="What's next">
        Body composition analysis will be added in a future version. This Phase 1 build only
        collects and stores your scan data.
      </Alert>
    </div>
  );
}

function SummaryRow({ term, detail }: { term: string; detail: ReactNode }) {
  return (
    <div className="grid gap-1 px-4 py-3 sm:grid-cols-[140px_1fr] sm:items-center">
      <dt className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">{term}</dt>
      <dd className="text-sm text-[var(--foreground)]">{detail}</dd>
    </div>
  );
}
