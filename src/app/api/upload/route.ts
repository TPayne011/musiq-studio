import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs"; // ensure Node runtime

function serverClient() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE!;
  return createClient(url, key, { auth: { persistSession: false } });
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

    // We’ll serve via our own domain at /media/<key>
    const url = `${
      process.env.NEXT_PUBLIC_BASE_URL ?? ""
    }/media/${encodeURIComponent(key)}`;
    return NextResponse.json({ key, url }); // url is on YOUR domain
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Upload failed" },
      { status: 500 }
    );
  }
}
