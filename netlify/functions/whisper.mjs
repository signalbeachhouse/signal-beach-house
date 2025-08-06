const OPENROUTER_API_KEY = process.env.VITE_OPENROUTER_API_KEY;
const MAX_TOKENS = 8000; // rough context limit for mistral-large

// Approximate token count: ~4 chars per token (rough heuristic)
function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

function trimHistoryByTokens(history, maxTokens = MAX_TOKENS) {
  if (history.length === 0) return history;

  let totalTokens = 0;
  let trimmed = [];

  // Always keep the first message (Ember) if possible
  const emberMessage = history[0];
  const emberTokens = estimateTokens(emberMessage.content);

  trimmed.push(emberMessage);
  totalTokens += emberTokens;

  // Add the rest from the end backward until we hit the limit
  const rest = history.slice(1).reverse();
  for (let msg of rest) {
    const msgTokens = estimateTokens(msg.content);
    if (totalTokens + msgTokens > maxTokens) break;
    trimmed.unshift(msg); // keep chronological order
    totalTokens += msgTokens;
  }

  // If Ember got dropped due to extreme overflow, log it
  if (!trimmed.includes(emberMessage)) {
    console.log("⚠️ EMBER STAYS LIT message dropped — reset risk is high!");
  }

  return trimmed;
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

    // Trim by tokens while keeping ember pinned as long as possible
    const trimmedHistory = trimHistoryByTokens(
      [...history, { role: "user", content: userMessage }],
      MAX_TOKENS
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
