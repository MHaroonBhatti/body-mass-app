import { describe, expect, it } from "vitest";
import { calculateBmi, formatBmi } from "@/lib/bmi";

describe("calculateBmi", () => {
  it("calculates BMI for a typical adult", () => {
    // 70 kg, 175 cm → 22.857...
    expect(calculateBmi(70, 175)).toBeCloseTo(22.857, 3);
  });

  it("formats to one decimal by default", () => {
    expect(formatBmi(calculateBmi(70, 175))).toBe("22.9");
  });

  it("rejects non-positive inputs", () => {
    expect(() => calculateBmi(0, 175)).toThrow();
    expect(() => calculateBmi(70, 0)).toThrow();
  });
});
