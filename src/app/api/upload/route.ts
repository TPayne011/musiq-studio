import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function serverClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE!,
    { auth: { persistSession: false } }
  );
}

function safeName(name: string) {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]/g, "");
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const name = String(form.get("name") || "upload.bin");
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const supabase = serverClient();
    const keyBase = safeName(name);
    const key = `uploads/${Date.now()}-${keyBase}`;
    const arrayBuffer = await file.arrayBuffer();
    const contentType = file.type || "application/octet-stream";

    const { error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET!)
      .upload(key, Buffer.from(arrayBuffer), { contentType, upsert: false });

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

    const url = `${
      process.env.NEXT_PUBLIC_BASE_URL ?? ""
    }/media/${encodeURIComponent(key)}`;
    return NextResponse.json({ key, url });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Upload failed" },
      { status: 500 }
    );
  }
}
