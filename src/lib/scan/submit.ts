import { extensionForMime, validatePhotoFileBasics } from "@/lib/validation/photo";
import { validateParticipantForm, type ParticipantFormValues } from "@/lib/validation/participant";
import { SCAN_VIEWS, type ParticipantInfo, type ScanView } from "@/lib/types/scan";
import { getSupabaseAdmin, STORAGE_BUCKET } from "@/lib/supabase/server";

export interface SubmitPhotoInput {
  view: ScanView;
  file: File;
  width: number | null;
  height: number | null;
}

export interface SubmitScanInput {
  participant: ParticipantInfo;
  photos: SubmitPhotoInput[];
}

export type SubmitScanResult =
  | { ok: true; scanId: string }
  | { ok: false; error: string; scanId?: string; code?: string };

export function participantFromFormData(formData: FormData): ParticipantFormValues {
  return {
    age: String(formData.get("age") ?? ""),
    sex: String(formData.get("sex") ?? ""),
    heightCm: String(formData.get("heightCm") ?? ""),
    weightKg: String(formData.get("weightKg") ?? ""),
    participantId: String(formData.get("participantId") ?? ""),
  };
}

export function extractPhotosFromFormData(formData: FormData): SubmitPhotoInput[] | { error: string } {
  const photos: SubmitPhotoInput[] = [];

  for (const view of SCAN_VIEWS) {
    const file = formData.get(`photo_${view}`);
    if (!(file instanceof File) || file.size === 0) {
      return { error: `Missing ${view} photo.` };
    }

    const basic = validatePhotoFileBasics(file);
    if (basic) {
      return { error: `${view}: ${basic.error.message}` };
    }

    const widthRaw = formData.get(`width_${view}`);
    const heightRaw = formData.get(`height_${view}`);
    const width = widthRaw ? Number(widthRaw) : null;
    const height = heightRaw ? Number(heightRaw) : null;

    photos.push({
      view,
      file,
      width: Number.isFinite(width) ? width : null,
      height: Number.isFinite(height) ? height : null,
    });
  }

  return photos;
}

/**
 * Creates a scan, uploads images, writes scan_images, and updates status.
 * On partial failure: marks scan failed and attempts storage cleanup.
 */
export async function submitScan(input: SubmitScanInput): Promise<SubmitScanResult> {
  if (input.photos.length !== SCAN_VIEWS.length) {
    return { ok: false, error: "All four photos are required.", code: "incomplete_scan" };
  }

  const views = new Set(input.photos.map((photo) => photo.view));
  for (const view of SCAN_VIEWS) {
    if (!views.has(view)) {
      return { ok: false, error: `Missing ${view} photo.`, code: "incomplete_scan" };
    }
  }

  const supabase = getSupabaseAdmin();

  const { data: scan, error: scanError } = await supabase
    .from("scans")
    .insert({
      participant_id: input.participant.participantId ?? null,
      age: input.participant.age,
      sex: input.participant.sex,
      height_cm: input.participant.heightCm,
      weight_kg: input.participant.weightKg,
      status: "uploading",
    })
    .select("id")
    .single();

  if (scanError || !scan) {
    console.error("Failed to create scan", scanError);
    return {
      ok: false,
      error: "Could not save scan details. Please try again.",
      code: "database_failure",
    };
  }

  const scanId = scan.id;
  const uploadedPaths: string[] = [];

  try {
    for (const photo of input.photos) {
      const ext = extensionForMime(photo.file.type || "image/jpeg");
      const storagePath = `${scanId}/${photo.view}.${ext}`;
      const buffer = Buffer.from(await photo.file.arrayBuffer());

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, buffer, {
          contentType: photo.file.type || "image/jpeg",
          upsert: false,
        });

      if (uploadError) {
        console.error(`Upload failed for ${photo.view}`, uploadError);
        throw new UploadFailure(`Failed to upload ${photo.view} photo.`, "upload_failure");
      }

      uploadedPaths.push(storagePath);

      const { error: imageError } = await supabase.from("scan_images").insert({
        scan_id: scanId,
        view: photo.view,
        storage_path: storagePath,
        original_filename: photo.file.name || null,
        mime_type: photo.file.type || "image/jpeg",
        file_size_bytes: photo.file.size,
        width: photo.width,
        height: photo.height,
      });

      if (imageError) {
        console.error(`scan_images insert failed for ${photo.view}`, imageError);
        throw new UploadFailure(
          "Photos uploaded but could not be recorded. Please retry.",
          "database_failure",
        );
      }
    }

    const { error: statusError } = await supabase
      .from("scans")
      .update({ status: "saved" })
      .eq("id", scanId);

    if (statusError) {
      console.error("Failed to mark scan saved", statusError);
      throw new UploadFailure("Scan nearly complete but status update failed.", "database_failure");
    }

    return { ok: true, scanId };
  } catch (error) {
    const code = error instanceof UploadFailure ? error.code : "upload_failure";
    const message =
      error instanceof UploadFailure
        ? error.message
        : "Upload failed due to a network or server error.";

    console.error("submitScan failed", error);

    await supabase.from("scans").update({ status: "failed" }).eq("id", scanId);

    if (uploadedPaths.length > 0) {
      const { error: cleanupError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove(uploadedPaths);
      if (cleanupError) {
        console.error("Storage cleanup failed", cleanupError);
      }
    }

    // Cascade deletes scan_images when we delete the scan row for orphan avoidance.
    // Keep the failed scan row so operators can inspect; images cleaned from storage.
    await supabase.from("scan_images").delete().eq("scan_id", scanId);

    return { ok: false, error: message, scanId, code };
  }
}

class UploadFailure extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.code = code;
  }
}

export function validateAndBuildSubmitInput(
  formData: FormData,
): SubmitScanInput | { error: string; code: string } {
  const participantResult = validateParticipantForm(participantFromFormData(formData));
  if (!participantResult.valid) {
    const firstError = Object.values(participantResult.errors)[0] ?? "Invalid participant details.";
    return { error: firstError, code: "validation_error" };
  }

  const photosResult = extractPhotosFromFormData(formData);
  if ("error" in photosResult) {
    return { error: photosResult.error, code: "incomplete_scan" };
  }

  return {
    participant: participantResult.data,
    photos: photosResult,
  };
}
