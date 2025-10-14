import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { metadataUrl, title } = await req.json();
    if (!metadataUrl) {
      return NextResponse.json(
        { error: "Missing metadataUrl" },
        { status: 400 }
      );
    }
    const tokenId = `pi-demo-${Date.now()}`;
    const txId = null; // swap with real Pi tx later
    return NextResponse.json({ ok: true, tokenId, txId, title, metadataUrl });
  } catch (e) {
    return NextResponse.json({ error: "Mint failed" }, { status: 500 });
  }
}
