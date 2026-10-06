import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { ScanSummaryCard } from "@/components/scan/ScanSummaryCard";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { mapScanWithImages } from "@/lib/scan/mappers";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";

export default async function ScanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    return (
      <main className="flex-1 py-8 sm:py-10">
        <Container className="mx-auto max-w-lg space-y-4">
          <Alert tone="error" title="Configuration required">
            Supabase environment variables are missing. Configure them to view saved scans.
          </Alert>
          <Button href="/scans" variant="secondary">
            Back to history
          </Button>
        </Container>
      </main>
    );
  }

  const supabase = getSupabaseAdmin();
  const { data: scan, error } = await supabase
    .from("scans")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("scan detail", error);
    return (
      <main className="flex-1 py-8 sm:py-10">
        <Container className="mx-auto max-w-lg">
          <Alert tone="error">Could not load this scan.</Alert>
        </Container>
      </main>
    );
  }

  if (!scan) notFound();

  const { data: images } = await supabase
    .from("scan_images")
    .select("*")
    .eq("scan_id", id)
    .order("created_at", { ascending: true });

  const mapped = mapScanWithImages(scan, images ?? []);

  return (
    <main className="flex-1 py-8 sm:py-10">
      <Container className="mx-auto max-w-lg space-y-6">
        <ScanSummaryCard scan={mapped} />
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button href="/scan/participant" fullWidth>
            Start another scan
          </Button>
          <Button href="/scans" variant="secondary" fullWidth>
            View history
          </Button>
        </div>
        <p className="text-center text-xs text-[var(--muted)]">
          <Link href="/" className="underline underline-offset-2">
            Back to home
          </Link>
        </p>
      </Container>
    </main>
  );
}
