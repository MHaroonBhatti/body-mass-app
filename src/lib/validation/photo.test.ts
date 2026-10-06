import { describe, expect, it } from "vitest";
import {
  photoErrorMessage,
  validateImageDimensions,
  validatePhotoFileBasics,
  validateView,
} from "@/lib/validation/photo";

function makeFile(options: {
  name?: string;
  type?: string;
  size: number;
}): File {
  const buffer = new Uint8Array(Math.min(options.size, 1024));
  const blob = new Blob([buffer], { type: options.type ?? "image/jpeg" });
  // Pad size via Object.defineProperty because Blob size follows content length
  const file = new File([blob], options.name ?? "photo.jpg", {
    type: options.type ?? "image/jpeg",
  });
  Object.defineProperty(file, "size", { value: options.size });
  return file;
}

describe("validatePhotoFileBasics", () => {
  it("rejects missing file", () => {
    const result = validatePhotoFileBasics(null);
    expect(result?.ok).toBe(false);
    expect(result?.error.code).toBe("missing");
  });

  it("rejects unsupported mime type", () => {
    const result = validatePhotoFileBasics(
      makeFile({ type: "application/pdf", size: 100_000 }),
    );
    expect(result?.error.code).toBe("unsupported_type");
  });

  it("rejects oversized files", () => {
    const result = validatePhotoFileBasics(
      makeFile({ size: 16 * 1024 * 1024 }),
    );
    expect(result?.error.code).toBe("too_large");
  });

  it("rejects tiny files", () => {
    const result = validatePhotoFileBasics(makeFile({ size: 1024 }));
    expect(result?.error.code).toBe("too_small");
  });

  it("accepts a reasonable jpeg", () => {
    const result = validatePhotoFileBasics(makeFile({ size: 200_000 }));
    expect(result).toBeNull();
  });
});

describe("validateImageDimensions", () => {
  it("rejects tiny dimensions", () => {
    const result = validateImageDimensions(200, 200);
    expect(result?.error.code).toBe("dimensions_too_small");
  });

  it("accepts portrait phone resolution", () => {
    expect(validateImageDimensions(1080, 1920)).toBeNull();
  });

  it("accepts landscape meeting minimums", () => {
    expect(validateImageDimensions(1920, 1080)).toBeNull();
  });
});

describe("validateView / messages", () => {
  it("validates views", () => {
    expect(validateView("front")).toBe(true);
    expect(validateView("side")).toBe(false);
  });

  it("returns useful messages", () => {
    expect(photoErrorMessage("too_large")).toMatch(/15 MB/i);
  });
});
