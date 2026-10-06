import { SEX_OPTIONS, type ParticipantInfo, type Sex } from "@/lib/types/scan";

export const PARTICIPANT_LIMITS = {
  ageMin: 18,
  ageMax: 100,
  heightMinCm: 100,
  heightMaxCm: 230,
  weightMinKg: 30,
  weightMaxKg: 300,
  participantIdMaxLength: 64,
} as const;

export type ParticipantField =
  | "age"
  | "sex"
  | "heightCm"
  | "weightKg"
  | "participantId";

export type ParticipantErrors = Partial<Record<ParticipantField, string>>;

export interface ParticipantFormValues {
  age: string;
  sex: string;
  heightCm: string;
  weightKg: string;
  participantId: string;
}

const SEX_VALUES = SEX_OPTIONS.map((option) => option.value) as Sex[];

function isSex(value: string): value is Sex {
  return (SEX_VALUES as string[]).includes(value);
}

function parseNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
}

export function validateParticipantForm(
  values: ParticipantFormValues,
): { valid: false; errors: ParticipantErrors } | { valid: true; data: ParticipantInfo } {
  const errors: ParticipantErrors = {};

  const age = parseNumber(values.age);
  if (age === null) {
    errors.age = "Enter your age.";
  } else if (!Number.isInteger(age)) {
    errors.age = "Age must be a whole number.";
  } else if (age < PARTICIPANT_LIMITS.ageMin || age > PARTICIPANT_LIMITS.ageMax) {
    errors.age = `Age must be between ${PARTICIPANT_LIMITS.ageMin} and ${PARTICIPANT_LIMITS.ageMax}.`;
  }

  if (!values.sex) {
    errors.sex = "Select an option.";
  } else if (!isSex(values.sex)) {
    errors.sex = "Select a valid option.";
  }

  const heightCm = parseNumber(values.heightCm);
  if (heightCm === null) {
    errors.heightCm = "Enter height in centimeters.";
  } else if (
    heightCm < PARTICIPANT_LIMITS.heightMinCm ||
    heightCm > PARTICIPANT_LIMITS.heightMaxCm
  ) {
    errors.heightCm = `Height must be between ${PARTICIPANT_LIMITS.heightMinCm} and ${PARTICIPANT_LIMITS.heightMaxCm} cm.`;
  }

  const weightKg = parseNumber(values.weightKg);
  if (weightKg === null) {
    errors.weightKg = "Enter weight in kilograms.";
  } else if (
    weightKg < PARTICIPANT_LIMITS.weightMinKg ||
    weightKg > PARTICIPANT_LIMITS.weightMaxKg
  ) {
    errors.weightKg = `Weight must be between ${PARTICIPANT_LIMITS.weightMinKg} and ${PARTICIPANT_LIMITS.weightMaxKg} kg.`;
  }

  const participantId = values.participantId.trim();
  if (participantId.length > PARTICIPANT_LIMITS.participantIdMaxLength) {
    errors.participantId = `Participant ID must be ${PARTICIPANT_LIMITS.participantIdMaxLength} characters or fewer.`;
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      age: age as number,
      sex: values.sex as Sex,
      heightCm: heightCm as number,
      weightKg: weightKg as number,
      participantId: participantId || undefined,
    },
  };
}
