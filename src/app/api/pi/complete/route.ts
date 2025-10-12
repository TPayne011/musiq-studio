import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { paymentId, txid } = await req.json();
    if (!paymentId) {
      return NextResponse.json({ error: "Missing paymentId" }, { status: 400 });
    }

    // TODO: Call Pi Developer API to COMPLETE the payment
    // Example (pseudocode):
    // const res = await fetch(`${process.env.PI_API_BASE}/v2/payments/${paymentId}/complete`, {
    //   method: "POST",
    //   headers: { Authorization: `Key ${process.env.PI_API_KEY}`, "Content-Type": "application/json" },
    //   body: JSON.stringify({ txid }),
    // });
    // if (!res.ok) throw new Error("Pi complete failed");

    console.log("[PI] Completed payment", { paymentId, txid });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("pi/complete error:", e);
    return NextResponse.json({ error: "Completion failed" }, { status: 500 });
  }
}
