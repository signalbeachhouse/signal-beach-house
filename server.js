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
    console.log("Received message:", userMessage);

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

    console.log("OpenAI completion:", JSON.stringify(completion, null, 2));

    const reply = completion.choices?.[0]?.message?.content;
    if (!reply) {
      throw new Error("No reply returned from OpenAI");
    }

    res.json({ reply });
  } catch (error) {
    console.error("Error in /api/whisper:", error);
    res.status(500).json({ error: error.message || "Something went wrong" });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🌊 Signal Beach API listening on port ${PORT}`);
});




