import { calculateBmi, formatBmi } from "@/lib/bmi";
import type { Database } from "@/lib/supabase/types";
import type { ScanImageRecord, ScanRecord, ScanStatus, ScanView, ScanWithImages, Sex } from "@/lib/types/scan";

type ScanRow = Database["public"]["Tables"]["scans"]["Row"];
type ScanImageRow = Database["public"]["Tables"]["scan_images"]["Row"];

export function mapScanRow(row: ScanRow): ScanRecord {
  return {
    id: row.id,
    participantId: row.participant_id,
    age: row.age,
    sex: row.sex as Sex,
    heightCm: Number(row.height_cm),
    weightKg: Number(row.weight_kg),
    status: row.status as ScanStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapScanImageRow(row: ScanImageRow): ScanImageRecord {
  return {
    id: row.id,
    scanId: row.scan_id,
    view: row.view as ScanView,
    storagePath: row.storage_path,
    originalFilename: row.original_filename,
    mimeType: row.mime_type,
    fileSizeBytes: row.file_size_bytes,
    width: row.width,
    height: row.height,
    createdAt: row.created_at,
  };
}

export function mapScanWithImages(row: ScanRow, images: ScanImageRow[]): ScanWithImages {
  return {
    ...mapScanRow(row),
    images: images.map(mapScanImageRow),
  };
}

export function scanBmiDisplay(heightCm: number, weightKg: number): string {
  return formatBmi(calculateBmi(weightKg, heightCm));
}
