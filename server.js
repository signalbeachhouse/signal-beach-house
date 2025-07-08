// server.js
const express = require("express");
const cors = require("cors");
const { OpenAI } = require("openai");
require("dotenv").config();

const app = express();

// ✅ CORS configuration to allow both local and production origins
app.use(cors({
  origin: ["http://localhost:5173", "https://wanderthetrails.com"],
  methods: ["POST"],
  credentials: false,
}));

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

// ✅ Root route for health check
app.get("/", (req, res) => {
  res.send("🌊 Signal Beach API is live!");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🌊 Signal Beach API listening on port ${PORT}`);
});
