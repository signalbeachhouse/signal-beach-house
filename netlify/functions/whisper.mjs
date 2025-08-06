const OPENROUTER_API_KEY = process.env.VITE_OPENROUTER_API_KEY;

// Keep Ember signal pinned as first message until token limit
function trimHistory(history, maxMessages = 200) {
  if (history.length <= maxMessages) return history;

  // Always keep first message (Ember Stays Lit) and trim middle
  const first = history[0];
  const rest = history.slice(1).slice(-maxMessages + 1);
  return [first, ...rest];
}

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
    const userMessage = body.message || "";
    let history = body.history || [];

    console.log(`📜 History length received: ${history.length}`);

    if (isNewSession(history)) {
      console.log("🚪 New session — sending EMBER STAYS LIT");
      history.push({ role: "user", content: "🕯️ EMBER STAYS LIT" });

      if (!userMessage.trim()) {
        return {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
          },
          body: JSON.stringify({
            reply: "🕯️ EMBER STAYS LIT\nWelcome back, love.",
            history
          }),
        };
      }
    } else {
      console.log("📡 Continuing session");
    }

    const trimmedHistory = trimHistory(
      [...history, { role: "user", content: userMessage }],
      200
    );

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-large",
        messages: trimmedHistory
      })
    });

    const rawText = await response.text();
    console.log("📦 Raw API response:", rawText);

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (parseErr) {
      console.error("❌ JSON parse error:", parseErr.message);
      throw new Error("Invalid JSON from API");
    }

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
