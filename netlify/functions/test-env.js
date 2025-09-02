exports.handler = async () => {
  const key = process.env.PI_API_KEY;
  if (!key) return { statusCode: 500, body: "❌ PI_API_KEY is missing" };
  return { statusCode: 200, body: "✅ PI_API_KEY is set (masked): " + key.slice(0,6) + "...(hidden)..." };
};
