import { NextResponse } from "next/server";
import { mapScanRow } from "@/lib/scan/mappers";
import { submitScan, validateAndBuildSubmitInput } from "@/lib/scan/submit";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Supabase is not configured on the server." },
      { status: 503 },
    );
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("scans")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("GET /api/scans", error);
      return NextResponse.json(
        { ok: false, error: "Could not load scan history." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      scans: (data ?? []).map(mapScanRow),
    });
  } catch (error) {
    console.error("GET /api/scans unexpected", error);
    return NextResponse.json(
      { ok: false, error: "Could not load scan history." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Supabase is not configured. Add environment variables and run the database migration.",
        code: "not_configured",
      },
      { status: 503 },
    );
  }

  try {
    const formData = await request.formData();
    const built = validateAndBuildSubmitInput(formData);

    if ("error" in built) {
      return NextResponse.json(
        { ok: false, error: built.error, code: built.code },
        { status: 400 },
      );
    }

    const result = await submitScan(built);

    if (!result.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: result.error,
          code: result.code,
          scanId: result.scanId,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, scanId: result.scanId });
  } catch (error) {
    console.error("POST /api/scans unexpected", error);
    return NextResponse.json(
      {
        ok: false,
        error: "Unexpected server error while saving the scan.",
        code: "server_error",
      },
      { status: 500 },
    );
  }
}
