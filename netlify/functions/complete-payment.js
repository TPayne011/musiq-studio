exports.handler = async (event) => {
  try {
    const { paymentId, txId } = JSON.parse(event.body || "{}");
    if (!paymentId) {
      return { statusCode: 400, body: "Missing paymentId" };
    }

    // Example: Complete the payment with Pi API
    const res = await fetch("https://api.minepi.com/v2/payments/" + paymentId + "/complete", {
      method: "POST",
      headers: {
        "Authorization": `Key ${process.env.PI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ txid: txId }),
    });

    const text = await res.text();
    return { statusCode: res.status, body: text };
  } catch (err) {
    return { statusCode: 500, body: "Error: " + err.message };
  }
};
