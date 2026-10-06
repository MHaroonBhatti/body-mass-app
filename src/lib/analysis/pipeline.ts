/**
 * Future CV/ML integration contract.
 *
 * Phase 1 intentionally does NOT implement this pipeline.
 * Upload, persistence, and UI must remain independent of analysis.
 */

import type { ScanView } from "@/lib/types/scan";

export type ScanImages = Record<ScanView, { storagePath: string; width?: number; height?: number }>;

export interface ValidationResult {
  ok: boolean;
  issues: Array<{ view?: ScanView; code: string; message: string }>;
}

export interface PoseResult {
  views: Partial<Record<ScanView, unknown>>;
}

export interface SegmentationResult {
  views: Partial<Record<ScanView, unknown>>;
}

export interface BodyFeatures {
  features: Record<string, number | string>;
}

/** Range estimate — never a falsely precise single number. */
export interface BodyFatEstimate {
  lowPercent: number;
  highPercent: number;
  confidence?: number;
  method?: string;
}

/**
 * Plug-in interface for later phases.
 * Do not provide fake implementations that invent body-fat data.
 */
export interface BodyAnalysisPipeline {
  validateImages(input: ScanImages): Promise<ValidationResult>;
  extractPose(input: ScanImages): Promise<PoseResult>;
  segmentBody(input: ScanImages): Promise<SegmentationResult>;
  extractFeatures(input: ScanImages): Promise<BodyFeatures>;
  estimateBodyFat(input: BodyFeatures): Promise<BodyFatEstimate>;
}
