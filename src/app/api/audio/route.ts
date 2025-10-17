import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl.searchParams.get("u");
    if (!url)
      return NextResponse.json({ error: "Missing ?u=" }, { status: 400 });

    // very light allowlist: only http/https
    if (!/^https?:\/\//i.test(url)) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // Fetch the remote file from the server (avoids browser CORS/hotlink issues)
    const res = await fetch(url, {
      headers: {
        // Optional: present as a "clean" server request
        "user-agent": "MusiqStudio/1.0 (+https://localhost)",
        // You can also set a referer if the host requires it
        // referer: new URL(url).origin,
      },
      cache: "no-store",
    });

    if (!res.ok || !res.body) {
      return NextResponse.json(
        { error: `Upstream ${res.status}` },
        { status: 502 }
      );
    }

    // Try to pass along content-type; default to audio/mpeg
    const ct = res.headers.get("content-type") || "audio/mpeg";

    return new NextResponse(res.body, {
      status: 200,
      headers: {
        "content-type": ct,
        // allow browser range requests (better seeking)
        "accept-ranges": res.headers.get("accept-ranges") || "bytes",
        // small cache to smooth playback, tweak as needed
        "cache-control": "public, max-age=60",
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "proxy error" },
      { status: 500 }
    );
  }
}
