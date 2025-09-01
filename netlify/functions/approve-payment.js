// Approve a payment (SANDBOX quick-approver)
export async function handler(event) {
  try {
    const { paymentId } = JSON.parse(event.body || "{}");
    if (!paymentId) return { statusCode: 400, body: "Missing paymentId" };

    const apiKey = process.env.PI_API_KEY; // set in Netlify
    if (!apiKey) return { statusCode: 500, body: "Missing PI_API_KEY" };

    const res = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Key ${apiKey}`
      },
      body: JSON.stringify({}) // no body needed for approve
    });

    if (!res.ok) {
      const txt = await res.text();
      return { statusCode: res.status, body: txt };
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    return { statusCode: 500, body: String(e) };
  }
}
