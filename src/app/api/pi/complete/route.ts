// src/app/api/pi/complete/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  completePayment,
  getPayment,
  assertAppOwnership,
} from "@/lib/piServer";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { paymentId, txid } = await req.json();
    if (!paymentId) {
      return NextResponse.json({ error: "Missing paymentId" }, { status: 400 });
    }

    // Optional: verify again before completing
    const payment = await getPayment(paymentId).catch(() => null);
    if (payment) {
      assertAppOwnership(payment);
    }

    const completed = await completePayment(paymentId, txid);
    return NextResponse.json({ ok: true, completed });
  } catch (e: any) {
    console.error("[pi/complete] error:", e);
    return NextResponse.json(
      { error: e?.message || "Completion failed" },
      { status: 500 }
    );
  }
}
