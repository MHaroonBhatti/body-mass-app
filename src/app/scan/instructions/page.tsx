import { PhotoInstructions } from "@/components/scan/PhotoInstructions";

export default function InstructionsPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-medium tracking-wide text-[var(--muted)] uppercase">
          Step 2 · Instructions
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Photo guidelines</h1>
        <p className="text-sm text-[var(--muted)]">
          Read these once before capturing. Consistent photos make later analysis more reliable.
        </p>
      </div>
      <PhotoInstructions />
    </div>
  );
}
