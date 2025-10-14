// src/lib/pi.ts
declare global {
  interface Window {
    Pi?: any;
  }
}

export function getPi() {
  const Pi = typeof window !== "undefined" ? window.Pi : undefined;
  if (!Pi) throw new Error("Pi SDK not available (open in Pi Browser)");
  return Pi;
}

export async function ensurePiAuth() {
  const Pi = getPi();
  const scopes = ["username", "payments"];
  const auth = await Pi.authenticate(scopes, (payment: any) => {
    console.log("[Pi] Incomplete payment found:", payment);
    // Optionally notify your server
  });
  return auth;
}

type PaymentArgs = {
  amount: number;
  memo: string;
  metadata: Record<string, any>;
};

export async function createPiPayment({ amount, memo, metadata }: PaymentArgs) {
  const Pi = getPi();
  return await Pi.createPayment(
    { amount, memo, metadata },
    {
      async onReadyForServerApproval(paymentId: string) {
        const r = await fetch("/api/pi/approve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId }),
        });
        if (!r.ok) throw new Error("Server approval failed");
      },
      async onReadyForServerCompletion(paymentId: string, txid?: string) {
        const r = await fetch("/api/pi/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId, txid }),
        });
        if (!r.ok) throw new Error("Server completion failed");
      },
      onCancel(paymentId: string) {
        console.warn("[Pi] Payment canceled:", paymentId);
      },
      onError(error: any, payment?: any) {
        console.error("[Pi] Payment error:", error, payment);
      },
    }
  );
}
