import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export const runtime = "nodejs";

function serverClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE!,
    {
      auth: { persistSession: false },
    }
  );
}
export async function GET(
  _req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const key = params.path.join("/");
  const supabase = serverClient();
  const { data, error } = await supabase.storage
    .from(process.env.SUPABASE_BUCKET!)
    .download(key);
  if (error || !data) return new NextResponse("Not found", { status: 404 });

  const ct = key.endsWith(".json")
    ? "application/json"
    : key.endsWith(".webm")
    ? "audio/webm"
    : key.endsWith(".mp3")
    ? "audio/mpeg"
    : key.endsWith(".wav")
    ? "audio/wav"
    : key.endsWith(".png")
    ? "image/png"
    : key.endsWith(".jpg") || key.endsWith(".jpeg")
    ? "image/jpeg"
    : "application/octet-stream";

  return new NextResponse(data.stream(), {
    headers: {
      "Content-Type": ct,
      "Cache-Control": key.endsWith(".json")
        ? "public, max-age=60"
        : "public, max-age=31536000, immutable",
    },
  });
}
