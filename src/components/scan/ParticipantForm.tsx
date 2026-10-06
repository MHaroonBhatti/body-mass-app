"use client";

import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { TextInput, TextSelect } from "@/components/ui/Field";
import { useScanDraft } from "@/lib/scan/draft-context";
import { SEX_OPTIONS } from "@/lib/types/scan";
import {
  validateParticipantForm,
  type ParticipantErrors,
  type ParticipantFormValues,
} from "@/lib/validation/participant";

function toFormValues(participant: ReturnType<typeof useScanDraft>["participant"]): ParticipantFormValues {
  return {
    age: participant?.age?.toString() ?? "",
    sex: participant?.sex ?? "",
    heightCm: participant?.heightCm?.toString() ?? "",
    weightKg: participant?.weightKg?.toString() ?? "",
    participantId: participant?.participantId ?? "",
  };
}

export function ParticipantForm() {
  const router = useRouter();
  const { participant, setParticipant } = useScanDraft();
  const [values, setValues] = useState<ParticipantFormValues>(() => toFormValues(participant));
  const [errors, setErrors] = useState<ParticipantErrors>({});

  function update<K extends keyof ParticipantFormValues>(key: K, value: ParticipantFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const result = validateParticipantForm(values);
    if (!result.valid) {
      setErrors(result.errors);
      return;
    }
    setParticipant(result.data);
    router.push("/scan/instructions");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <TextInput
        id="age"
        name="age"
        label="Age"
        type="number"
        inputMode="numeric"
        min={18}
        max={100}
        value={values.age}
        onChange={(event: ChangeEvent<HTMLInputElement>) => update("age", event.target.value)}
        error={errors.age}
        hint="Ages 18–100 for this experimental dataset."
        required
      />

      <TextSelect
        id="sex"
        name="sex"
        label="Sex"
        value={values.sex}
        onChange={(event: ChangeEvent<HTMLSelectElement>) => update("sex", event.target.value)}
        error={errors.sex}
        required
      >
        <option value="">Select…</option>
        {SEX_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </TextSelect>

      <div className="grid gap-5 sm:grid-cols-2">
        <TextInput
          id="heightCm"
          name="heightCm"
          label="Height"
          type="number"
          inputMode="decimal"
          min={100}
          max={230}
          step="0.1"
          value={values.heightCm}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            update("heightCm", event.target.value)
          }
          error={errors.heightCm}
          hint="Centimeters (cm)"
          required
        />
        <TextInput
          id="weightKg"
          name="weightKg"
          label="Weight"
          type="number"
          inputMode="decimal"
          min={30}
          max={300}
          step="0.1"
          value={values.weightKg}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            update("weightKg", event.target.value)
          }
          error={errors.weightKg}
          hint="Kilograms (kg)"
          required
        />
      </div>

      <TextInput
        id="participantId"
        name="participantId"
        label="Participant ID"
        type="text"
        value={values.participantId}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          update("participantId", event.target.value)
        }
        error={errors.participantId}
        optional
        hint="Optional anonymized ID for research tracking."
        autoComplete="off"
      />

      <Button type="submit" fullWidth>
        Continue
      </Button>
    </form>
  );
}
