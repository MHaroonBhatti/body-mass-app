import { NextResponse } from "next/server";
import { mapScanWithImages } from "@/lib/scan/mappers";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Supabase is not configured on the server." },
      { status: 503 },
    );
  }

  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ ok: false, error: "Missing scan id." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data: scan, error: scanError } = await supabase
      .from("scans")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (scanError) {
      console.error("GET /api/scans/[id]", scanError);
      return NextResponse.json(
        { ok: false, error: "Could not load scan." },
        { status: 500 },
      );
    }

    if (!scan) {
      return NextResponse.json({ ok: false, error: "Scan not found." }, { status: 404 });
    }

    const { data: images, error: imagesError } = await supabase
      .from("scan_images")
      .select("*")
      .eq("scan_id", id);

    if (imagesError) {
      console.error("GET /api/scans/[id] images", imagesError);
      return NextResponse.json(
        { ok: false, error: "Could not load scan images." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      scan: mapScanWithImages(scan, images ?? []),
    });
  } catch (error) {
    console.error("GET /api/scans/[id] unexpected", error);
    return NextResponse.json(
      { ok: false, error: "Could not load scan." },
      { status: 500 },
    );
  }
}
