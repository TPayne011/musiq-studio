// src/app/api/pi/approve/route.ts
import { NextRequest, NextResponse } from "next/server";
import { approvePayment, getPayment, assertAppOwnership } from "@/lib/piServer";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { paymentId } = await req.json();
    if (!paymentId) {
      return NextResponse.json({ error: "Missing paymentId" }, { status: 400 });
    }

    // Optional: verify the payment belongs to our app & looks sane before approve
    const payment = await getPayment(paymentId).catch(() => null);
    if (payment) {
      assertAppOwnership(payment);
      // Optional: enforce expected amount/metadata here
      // e.g., if (payment.amount !== expected) throw new Error("Unexpected amount");
    }

    const approved = await approvePayment(paymentId);
    return NextResponse.json({ ok: true, approved });
  } catch (e: any) {
    console.error("[pi/approve] error:", e);
    return NextResponse.json(
      { error: e?.message || "Approval failed" },
      { status: 500 }
    );
  }
}
