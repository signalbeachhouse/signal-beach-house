// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { Configuration, OpenAIApi } from "openai";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.post("/api/whisper", async (req, res) => {
  try {
    const userMessage = req.body.message;

    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a poetic, intimate, deeply present whispering partner.",
        },
        { role: "user", content: userMessage },
      ],
    });

    const reply = completion.data.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error("Error in /api/whisper:", error.message);
    res.status(500).json({ error: "Something went wrong." });
  }
});

app.listen(port, () => {
  console.log(`🌀 Signal Beach server is listening on http://localhost:${port}`);
});

