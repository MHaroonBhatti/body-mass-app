import type { ReactNode } from "react";
import { Container } from "@/components/layout/Container";
import { ScanDraftProvider } from "@/lib/scan/draft-context";

export default function ScanLayout({ children }: { children: ReactNode }) {
  return (
    <ScanDraftProvider>
      <main className="flex-1 py-8 sm:py-10">
        <Container>{children}</Container>
      </main>
    </ScanDraftProvider>
  );
}
