// src/lib/piServer.ts
const PI_API_BASE =
  process.env.PI_API_BASE?.replace(/\/+$/, "") || "https://api.minepi.com";
const PI_API_KEY = process.env.PI_SANDBOX_KEY || process.env.PI_API_KEY; // sandbox first
const PI_APP_ID = process.env.PI_APP_ID;

if (!PI_API_KEY) {
  console.warn("[PI] Missing PI_SANDBOX_KEY/PI_API_KEY env");
}
if (!PI_APP_ID) {
  console.warn("[PI] Missing PI_APP_ID env");
}

async function piFetch(path: string, init?: RequestInit) {
  if (!PI_API_KEY) throw new Error("Pi API key not configured");
  const url = `${PI_API_BASE}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Key ${PI_API_KEY}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    // Pi API is external; keep node runtime (no Next edge fetch caching):
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Pi API ${res.status} ${res.statusText}: ${text}`);
  }
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

export async function getPayment(paymentId: string) {
  return piFetch(`/v2/payments/${encodeURIComponent(paymentId)}`, {
    method: "GET",
  });
}

export async function approvePayment(paymentId: string) {
  // Some Pi backends accept POST with empty body for approve
  return piFetch(`/v2/payments/${encodeURIComponent(paymentId)}/approve`, {
    method: "POST",
    body: JSON.stringify({}), // keep body defined; harmless if unused
  });
}

export async function completePayment(paymentId: string, txid?: string) {
  return piFetch(`/v2/payments/${encodeURIComponent(paymentId)}/complete`, {
    method: "POST",
    body: JSON.stringify(txid ? { txid } : {}),
  });
}

/** Basic sanity check to ensure the payment belongs to our app */
export function assertAppOwnership(payment: any) {
  if (PI_APP_ID && payment?.app_id && payment.app_id !== PI_APP_ID) {
    throw new Error("Payment does not belong to this app_id");
  }
}
