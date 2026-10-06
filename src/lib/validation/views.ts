import { SCAN_VIEWS, type ScanView } from "@/lib/types/scan";

export function isScanView(value: unknown): value is ScanView {
  return typeof value === "string" && (SCAN_VIEWS as readonly string[]).includes(value);
}

export function assertScanView(value: unknown): ScanView {
  if (!isScanView(value)) {
    throw new Error(`Invalid scan view: ${String(value)}`);
  }
  return value;
}

export function parseScanViewParam(value: string | undefined): ScanView | null {
  if (!value) return null;
  return isScanView(value) ? value : null;
}

export function nextView(current: ScanView): ScanView | null {
  const index = SCAN_VIEWS.indexOf(current);
  if (index < 0 || index >= SCAN_VIEWS.length - 1) return null;
  return SCAN_VIEWS[index + 1];
}

export function previousView(current: ScanView): ScanView | null {
  const index = SCAN_VIEWS.indexOf(current);
  if (index <= 0) return null;
  return SCAN_VIEWS[index - 1];
}

export function viewStepNumber(view: ScanView): number {
  return SCAN_VIEWS.indexOf(view) + 1;
}
