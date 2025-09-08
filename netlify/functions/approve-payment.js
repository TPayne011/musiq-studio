exports.handler = async (event) => {
  try {
    const { paymentId } = JSON.parse(event.body || "{}");
    if (!paymentId) {
      return { statusCode: 400, body: "Missing paymentId" };
    }

    // Example: Approve the payment with Pi API
    const res = await fetch("https://api.minepi.com/v2/payments/" + paymentId + "/approve", {
      method: "POST",
      headers: {
        "Authorization": `Key ${process.env.PI_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const text = await res.text();
    return { statusCode: res.status, body: text };
  } catch (err) {
    return { statusCode: 500, body: "Error: " + err.message };
  }
};
