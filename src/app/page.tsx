import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <main className="flex flex-1">
      <Container className="flex flex-1 flex-col justify-center py-12 sm:py-20">
        <section className="mx-auto max-w-xl space-y-8 text-center sm:text-left">
          <div className="space-y-4">
            <p className="text-sm font-semibold tracking-[0.18em] text-[var(--accent)] uppercase">
              BodyScan
            </p>
            <h1 className="text-4xl leading-tight font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
              Understand your body from four simple photos.
            </h1>
            <p className="text-base leading-relaxed text-[var(--muted)] sm:text-lg">
              Take four standardized photos and create a private body-composition scan. This early
              version is designed for experimental body measurement and tracking.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button href="/scan/participant" className="sm:min-w-[180px]">
              Start a Scan
            </Button>
            <Button href="/scans" variant="secondary" className="sm:min-w-[140px]">
              View history
            </Button>
          </div>

          <p className="text-sm text-[var(--muted)]">
            Your photos are private and used only for your scans.
          </p>
        </section>
      </Container>
    </main>
  );
}
