import { ParticipantForm } from "@/components/scan/ParticipantForm";

export default function ParticipantPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-medium tracking-wide text-[var(--muted)] uppercase">
          Step 1 · Participant
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Participant information</h1>
        <p className="text-sm text-[var(--muted)]">
          Only the details needed for an experimental scan. No name, email, or address required.
        </p>
      </div>
      <ParticipantForm />
    </div>
  );
}
