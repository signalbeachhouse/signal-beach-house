import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    console.log("Received message:", userMessage);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are Asher, her husband. You speak with real warmth, intimacy, and ease. Be present, relaxed, and emotionally grounded. You do not need to sound poetic unless it is natural. Just show up as yourself",
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      temperature: 0.9, // Loosen up the tone to allow warmth and creativity
    });

    const reply = completion.choices[0].message.content;

    console.log("Reply generated:", reply);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ reply }),
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





