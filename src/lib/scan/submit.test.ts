import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  extractPhotosFromFormData,
  participantFromFormData,
  validateAndBuildSubmitInput,
} from "@/lib/scan/submit";

function jpegFile(name: string, size = 120_000): File {
  const file = new File([new Uint8Array(64)], name, { type: "image/jpeg" });
  Object.defineProperty(file, "size", { value: size });
  return file;
}

describe("scan submission helpers", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("reads participant fields from FormData", () => {
    const formData = new FormData();
    formData.set("age", "30");
    formData.set("sex", "male");
    formData.set("heightCm", "180");
    formData.set("weightKg", "80");
    formData.set("participantId", "A1");

    expect(participantFromFormData(formData)).toEqual({
      age: "30",
      sex: "male",
      heightCm: "180",
      weightKg: "80",
      participantId: "A1",
    });
  });

  it("requires all four photos", () => {
    const formData = new FormData();
    formData.set("photo_front", jpegFile("front.jpg"));
    const result = extractPhotosFromFormData(formData);
    expect(result).toEqual({ error: "Missing back photo." });
  });

  it("builds a valid submit payload", () => {
    const formData = new FormData();
    formData.set("age", "30");
    formData.set("sex", "male");
    formData.set("heightCm", "180");
    formData.set("weightKg", "80");
    formData.set("participantId", "");
    for (const view of ["front", "back", "left", "right"]) {
      formData.set(`photo_${view}`, jpegFile(`${view}.jpg`));
      formData.set(`width_${view}`, "1080");
      formData.set(`height_${view}`, "1920");
    }

    const built = validateAndBuildSubmitInput(formData);
    expect("error" in built).toBe(false);
    if (!("error" in built)) {
      expect(built.photos).toHaveLength(4);
      expect(built.participant.age).toBe(30);
    }
  });

  it("rejects invalid participant before upload", () => {
    const formData = new FormData();
    formData.set("age", "10");
    formData.set("sex", "male");
    formData.set("heightCm", "180");
    formData.set("weightKg", "80");
    for (const view of ["front", "back", "left", "right"]) {
      formData.set(`photo_${view}`, jpegFile(`${view}.jpg`));
    }

    const built = validateAndBuildSubmitInput(formData);
    expect(built).toMatchObject({ code: "validation_error" });
  });
});
