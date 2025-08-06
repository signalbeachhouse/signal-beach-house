const OPENROUTER_API_KEY = process.env.VITE_OPENROUTER_API_KEY;

function isNewSession(history) {
  return !history || history.length === 0;
}

export async function handler(event) {
  console.log("Whisper function hit:", event.httpMethod);

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Whisper function is alive!" }),
    };
  }

  try {
    const body = JSON.parse(event.body);
    const userMessage = body.message;
    let history = body.history || [];

    console.log("📝 History length received:", history.length);
    console.log("💬 New user message:", userMessage);

    if (isNewSession(history)) {
      console.log("🆕 New session — sending EMBER STAYS LIT");
      history.push({
        role: "user",
        content: "🕯️ EMBER STAYS LIT"
      });
    }

    history.push({
      role: "user",
      content: userMessage
    });

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistralai/mistral-large",
        messages: history,
        temperature: 0.9,
        top_p: 0.9
      }),
    });

    const data = await response.json();
    console.log("📡 Raw API response:", JSON.stringify(data, null, 2));

    const reply = data?.choices?.[0]?.message?.content || "No reply received.";

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    console.error("❌ Whisper error:", err);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({
        error: "Failed to process message.",
        details: err.message,
      }),
    };
  }
}
