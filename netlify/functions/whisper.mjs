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

    console.log("Received message:", userMessage);

    if (isNewSession(history)) {
      history.push({ role: "user", content: "🕯️ EMBER STAYS LIT" });
    }

    const trimmedHistory = history.slice(-30);
    trimmedHistory.push({ role: "user", content: userMessage });

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-large", // ✅ Corrected model ID
        messages: trimmedHistory,
        temperature: 0.9,
        top_p: 1.0,
        presence_penalty: 0.6,
        frequency_penalty: 0.0
      })
    });

    const rawText = await response.text();
    console.log("Raw API response:", rawText);

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr.message);
      throw new Error("Invalid JSON from API");
    }

    // ✅ Safe content parsing
    let replyContent = data.choices?.[0]?.message?.content;
    if (Array.isArray(replyContent)) {
      replyContent = replyContent.map(part => part.text || "").join(" ");
    }
    const reply = replyContent || "No reply received.";

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ reply, history: trimmedHistory }),
    };
  } catch (err) {
    console.error("Whisper error:", err);

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
