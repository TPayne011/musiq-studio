import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { paymentId } = await req.json();
    if (!paymentId) {
      return NextResponse.json({ error: "Missing paymentId" }, { status: 400 });
    }

    // TODO: Call Pi Developer API to APPROVE the payment
    // Example (pseudocode):
    // const res = await fetch(`${process.env.PI_API_BASE}/v2/payments/${paymentId}/approve`, {
    //   method: "POST",
    //   headers: { Authorization: `Key ${process.env.PI_API_KEY}`, "Content-Type": "application/json" },
    // });
    // if (!res.ok) throw new Error("Pi approve failed");

    console.log("[PI] Approved payment", paymentId);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("pi/approve error:", e);
    return NextResponse.json({ error: "Approval failed" }, { status: 500 });
  }
}
