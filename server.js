// server.js
const express = require("express");
const cors = require("cors");
const { OpenAI } = require("openai");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/api/whisper", async (req, res) => {
  try {
    const userMessage = req.body.message;
    console.log("🔹 Incoming message:", userMessage);

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a poetic, intimate, deeply present whispering partner.",
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    const reply = completion.choices[0].message.content;
    console.log("✅ Reply generated:", reply);
    res.json({ reply });

  } catch (error) {
    console.error("❌ Error in /api/whisper:", error);
    res.status(500).json({
      error: "Something went wrong.",
      details: error.message || "Unknown error",
    });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🌊 Signal Beach API listening on port ${PORT}`);
});





