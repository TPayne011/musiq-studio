import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE;

    if (!url || !key) {
      return NextResponse.json(
        { ok: false, message: "Missing env vars" },
        { status: 400 }
      );
    }

    const supabase = createClient(url, key, {
      auth: { persistSession: false },
    });
    const { data, error } = await supabase.storage.listBuckets();

    if (error) throw error;

    return NextResponse.json({ ok: true, buckets: data.map((b) => b.name) });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e.message });
  }
}
