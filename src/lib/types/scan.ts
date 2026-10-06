export const SCAN_VIEWS = ["front", "back", "left", "right"] as const;
export type ScanView = (typeof SCAN_VIEWS)[number];

export const SEX_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
] as const;

export type Sex = (typeof SEX_OPTIONS)[number]["value"];

export const SCAN_STATUSES = [
  "draft",
  "uploading",
  "submitted",
  "saved",
  "failed",
] as const;

export type ScanStatus = (typeof SCAN_STATUSES)[number];

export interface ParticipantInfo {
  age: number;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  participantId?: string;
}

export interface PhotoMeta {
  view: ScanView;
  originalFilename: string | null;
  mimeType: string;
  fileSizeBytes: number;
  width: number | null;
  height: number | null;
}

export interface ScanImageRecord extends PhotoMeta {
  id: string;
  scanId: string;
  storagePath: string;
  createdAt: string;
}

export interface ScanRecord {
  id: string;
  participantId: string | null;
  age: number;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  status: ScanStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ScanWithImages extends ScanRecord {
  images: ScanImageRecord[];
}

export interface DraftPhoto {
  view: ScanView;
  file: File;
  previewUrl: string;
  width: number;
  height: number;
}

export type DraftPhotos = Partial<Record<ScanView, DraftPhoto>>;

export const VIEW_LABELS: Record<ScanView, string> = {
  front: "Front",
  back: "Back",
  left: "Left side",
  right: "Right side",
};

export const VIEW_HINTS: Record<ScanView, string> = {
  front: "Face the camera. Arms slightly away from your torso. Feet visible.",
  back: "Turn your back to the camera. Same stance as the front photo.",
  left: "Turn so your left side faces the camera. Keep a neutral posture.",
  right: "Turn so your right side faces the camera. Keep a neutral posture.",
};
