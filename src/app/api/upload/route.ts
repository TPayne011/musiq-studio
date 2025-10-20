// src/app/api/upload/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      return NextResponse.json(
        {
          error:
            "Missing Supabase env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
        },
        { status: 500 }
      );
    }

    const { fileName, bucket = "media", upsert = false } = await req.json();
    // build the path inside that bucket (use your existing folder)

    if (!fileName) {
      return NextResponse.json({ error: "Missing fileName" }, { status: 400 });
    }
    // build the path inside that bucket (use your existing folder)
    const ext = (fileName.split(".").pop() || "mp3").toLowerCase();
    const path = `uploads/${crypto.randomUUID()}.${ext}`;

    const supabase = createClient(url, serviceKey, {
      auth: { persistSession: false },
    });

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(path, { upsert });

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message || "Failed to create signed URL" },
        { status: 502 }
      );
    }

    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);

    return NextResponse.json({
      path, // e.g., tracks/<uuid>.mp3
      signedUrl: data.signedUrl,
      token: data.token,
      publicUrl: pub.publicUrl, // works if the bucket is Public
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "sign error" },
      { status: 500 }
    );
  }
}
