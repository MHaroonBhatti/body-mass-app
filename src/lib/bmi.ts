/**
 * BMI = weight_kg / (height_m²)
 * Display metric only — not a body-fat measurement.
 */
export function calculateBmi(weightKg: number, heightCm: number): number {
  if (!Number.isFinite(weightKg) || !Number.isFinite(heightCm)) {
    throw new Error("Weight and height must be finite numbers.");
  }
  if (weightKg <= 0 || heightCm <= 0) {
    throw new Error("Weight and height must be positive.");
  }

  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

export function formatBmi(bmi: number, digits = 1): string {
  return bmi.toFixed(digits);
}
