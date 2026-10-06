import type { ScanView } from "@/lib/types/scan";
import { isScanView } from "@/lib/validation/views";

export const PHOTO_LIMITS = {
  minBytes: 50 * 1024, // 50 KB — rejects empty/tiny captures
  maxBytes: 15 * 1024 * 1024, // 15 MB
  minWidth: 480,
  minHeight: 640,
  allowedMimeTypes: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
  ] as const,
} as const;

export type PhotoValidationCode =
  | "missing"
  | "unsupported_type"
  | "too_large"
  | "too_small"
  | "decode_failed"
  | "dimensions_too_small"
  | "invalid_view";

export interface PhotoValidationError {
  code: PhotoValidationCode;
  message: string;
}

export interface PhotoValidationSuccess {
  ok: true;
  width: number;
  height: number;
  mimeType: string;
  fileSizeBytes: number;
}

export interface PhotoValidationFailure {
  ok: false;
  error: PhotoValidationError;
}

export type PhotoValidationResult = PhotoValidationSuccess | PhotoValidationFailure;

const MESSAGE_BY_CODE: Record<PhotoValidationCode, string> = {
  missing: "Please select a photo.",
  unsupported_type: "Unsupported image type. Use JPEG, PNG, or WebP.",
  too_large: "Image is too large. Maximum size is 15 MB.",
  too_small: "Image file is too small. Please use a clearer photo.",
  decode_failed: "Could not read this image. Try another file.",
  dimensions_too_small:
    "Image resolution is too low. Use a photo of at least 480×640 pixels.",
  invalid_view: "Invalid photo orientation.",
};

export function photoErrorMessage(code: PhotoValidationCode): string {
  return MESSAGE_BY_CODE[code];
}

export function validatePhotoFileBasics(file: File | null | undefined): PhotoValidationFailure | null {
  if (!file) {
    return { ok: false, error: { code: "missing", message: MESSAGE_BY_CODE.missing } };
  }

  const mimeType = file.type || guessMimeFromName(file.name);
  if (!PHOTO_LIMITS.allowedMimeTypes.includes(mimeType as (typeof PHOTO_LIMITS.allowedMimeTypes)[number])) {
    return {
      ok: false,
      error: { code: "unsupported_type", message: MESSAGE_BY_CODE.unsupported_type },
    };
  }

  if (file.size > PHOTO_LIMITS.maxBytes) {
    return {
      ok: false,
      error: { code: "too_large", message: MESSAGE_BY_CODE.too_large },
    };
  }

  if (file.size < PHOTO_LIMITS.minBytes) {
    return {
      ok: false,
      error: { code: "too_small", message: MESSAGE_BY_CODE.too_small },
    };
  }

  return null;
}

export function validateImageDimensions(
  width: number,
  height: number,
): PhotoValidationFailure | null {
  const minSide = Math.min(width, height);
  const maxSide = Math.max(width, height);

  // Accept either portrait or landscape as long as the shorter side ≥ 480
  // and the longer side ≥ 640 (reasonable phone capture).
  if (minSide < PHOTO_LIMITS.minWidth || maxSide < PHOTO_LIMITS.minHeight) {
    return {
      ok: false,
      error: {
        code: "dimensions_too_small",
        message: MESSAGE_BY_CODE.dimensions_too_small,
      },
    };
  }

  return null;
}

export async function validatePhotoFile(file: File | null | undefined): Promise<PhotoValidationResult> {
  const basic = validatePhotoFileBasics(file);
  if (basic) return basic;

  const safeFile = file as File;

  try {
    const { width, height } = await decodeImageDimensions(safeFile);
    const dimensionError = validateImageDimensions(width, height);
    if (dimensionError) return dimensionError;

    return {
      ok: true,
      width,
      height,
      mimeType: safeFile.type || guessMimeFromName(safeFile.name),
      fileSizeBytes: safeFile.size,
    };
  } catch {
    return {
      ok: false,
      error: { code: "decode_failed", message: MESSAGE_BY_CODE.decode_failed },
    };
  }
}

export function validateView(view: unknown): view is ScanView {
  return isScanView(view);
}

async function decodeImageDimensions(file: File): Promise<{ width: number; height: number }> {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(file);
    const dimensions = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return dimensions;
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const dimensions = { width: image.naturalWidth, height: image.naturalHeight };
      URL.revokeObjectURL(url);
      resolve(dimensions);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("decode_failed"));
    };
    image.src = url;
  });
}

function guessMimeFromName(name: string): string {
  const lower = name.toLowerCase();
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".heic")) return "image/heic";
  if (lower.endsWith(".heif")) return "image/heif";
  return "";
}

export function extensionForMime(mimeType: string): string {
  switch (mimeType) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/heic":
      return "heic";
    case "image/heif":
      return "heif";
    default:
      return "jpg";
  }
}
