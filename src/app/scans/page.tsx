import { Container } from "@/components/layout/Container";
import { ScanHistoryList } from "@/components/scan/ScanHistoryList";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { mapScanRow } from "@/lib/scan/mappers";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";
import type { ScanRecord } from "@/lib/types/scan";

async function loadScans(): Promise<{ scans: ScanRecord[]; error?: string }> {
  if (!isSupabaseConfigured()) {
    return {
      scans: [],
      error:
        "Supabase is not configured. Add environment variables and run the migration to load history.",
    };
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("scans")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("scans page", error);
      return { scans: [], error: "Could not load scan history." };
    }

    return { scans: (data ?? []).map(mapScanRow) };
  } catch (error) {
    console.error("scans page unexpected", error);
    return { scans: [], error: "Could not load scan history." };
  }
}

export default async function ScansHistoryPage() {
  const { scans, error } = await loadScans();

  return (
    <main className="flex-1 py-8 sm:py-10">
      <Container className="mx-auto max-w-lg space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Scan history</h1>
            <p className="text-sm text-[var(--muted)]">
              Previous scans with weight, BMI, and status. Body-fat results are not available in
              Phase 1.
            </p>
          </div>
          <Button href="/scan/participant" className="shrink-0 !px-3 !py-2 text-xs">
            New scan
          </Button>
        </div>

        {error ? <Alert tone="error">{error}</Alert> : null}
        <ScanHistoryList scans={scans} />
      </Container>
    </main>
  );
}
