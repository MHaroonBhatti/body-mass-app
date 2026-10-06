import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { scanBmiDisplay } from "@/lib/scan/mappers";
import type { ScanRecord } from "@/lib/types/scan";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function ScanHistoryList({ scans }: { scans: ScanRecord[] }) {
  if (scans.length === 0) {
    return (
      <div className="space-y-4 rounded-2xl border border-dashed border-[var(--border)] bg-white px-5 py-10 text-center">
        <p className="text-sm text-[var(--muted)]">No scans yet.</p>
        <Button href="/scan/participant">Start a Scan</Button>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {scans.map((scan) => {
        const bmi = scanBmiDisplay(scan.heightCm, scan.weightKg);
        return (
          <li key={scan.id}>
            <Link
              href={`/scans/${scan.id}`}
              className="block rounded-2xl border border-[var(--border)] bg-white px-4 py-4 transition-colors hover:border-[var(--accent)]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{formatDate(scan.createdAt)}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Weight {scan.weightKg} kg · BMI {bmi}
                  </p>
                </div>
                <StatusBadge status={scan.status} />
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "saved"
      ? "bg-teal-50 text-teal-900"
      : status === "failed"
        ? "bg-red-50 text-red-900"
        : "bg-[var(--surface-muted)] text-[var(--muted)]";

  return (
    <span className={`rounded-md px-2 py-1 text-xs font-medium capitalize ${styles}`}>
      {status}
    </span>
  );
}
