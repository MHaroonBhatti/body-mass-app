import { describe, expect, it } from "vitest";
import { validateParticipantForm } from "@/lib/validation/participant";

describe("validateParticipantForm", () => {
  const valid = {
    age: "28",
    sex: "female",
    heightCm: "168",
    weightKg: "62.5",
    participantId: "P-001",
  };

  it("accepts valid participant data", () => {
    const result = validateParticipantForm(valid);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.age).toBe(28);
      expect(result.data.sex).toBe("female");
      expect(result.data.heightCm).toBe(168);
      expect(result.data.weightKg).toBe(62.5);
      expect(result.data.participantId).toBe("P-001");
    }
  });

  it("allows empty optional participant id", () => {
    const result = validateParticipantForm({ ...valid, participantId: "  " });
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.participantId).toBeUndefined();
    }
  });

  it("rejects underage participants", () => {
    const result = validateParticipantForm({ ...valid, age: "17" });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.age).toMatch(/18/);
    }
  });

  it("rejects unrealistic height", () => {
    const result = validateParticipantForm({ ...valid, heightCm: "90" });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.heightCm).toBeTruthy();
    }
  });

  it("rejects missing sex", () => {
    const result = validateParticipantForm({ ...valid, sex: "" });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.sex).toBeTruthy();
    }
  });
});
