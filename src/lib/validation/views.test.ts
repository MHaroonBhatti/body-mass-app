import { describe, expect, it } from "vitest";
import {
  assertScanView,
  isScanView,
  nextView,
  parseScanViewParam,
  previousView,
  viewStepNumber,
} from "@/lib/validation/views";

describe("view validation", () => {
  it("recognizes valid views", () => {
    expect(isScanView("front")).toBe(true);
    expect(isScanView("back")).toBe(true);
    expect(isScanView("left")).toBe(true);
    expect(isScanView("right")).toBe(true);
    expect(isScanView("top")).toBe(false);
  });

  it("parses route params", () => {
    expect(parseScanViewParam("left")).toBe("left");
    expect(parseScanViewParam("nope")).toBeNull();
  });

  it("throws on invalid assert", () => {
    expect(() => assertScanView("diagonal")).toThrow(/Invalid scan view/);
  });

  it("navigates steps", () => {
    expect(nextView("front")).toBe("back");
    expect(nextView("right")).toBeNull();
    expect(previousView("back")).toBe("front");
    expect(previousView("front")).toBeNull();
    expect(viewStepNumber("right")).toBe(4);
  });
});
