// server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
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

// ✅ OpenAI setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ API route
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

// ✅ Serve static frontend files
app.use(express.static(path.join(__dirname, "dist")));

// ✅ Catch-all to serve index.html for SPA routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// ✅ Health check root
app.get("/", (req, res) => {
  res.send("🌊 Signal Beach API is live!");
});

// ✅ Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🌊 Signal Beach API listening on port ${PORT}`);
});

