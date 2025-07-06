 // server.js
// server.js
require('dotenv').config(); // Load env vars first

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { OpenAI } = require('openai');  // ✅ fix is here

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/message', async (req, res) => {
  const userMessage = req.body.message;
  console.log('💬 Incoming message from front end:', userMessage);

  try {
   const completion = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: userMessage }],
});

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error('❌ Error contacting OpenAI:', err.message);
    res.status(500).send('Error processing your request.');
  }
});


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
// 🔊 Voice endpoint (ElevenLabs)
const fetch = require('node-fetch');
const fs = require('fs');

app.post('/api/speak', async (req, res) => {
  try {
    const { text } = req.body;

    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/UgBBYS2sOqTuMpoF3BR0', {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.3,
          similarity_boost: 0.7,
        },
      }),
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch from ElevenLabs' });
    }

    const buffer = await response.arrayBuffer();
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': buffer.byteLength,
    });
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('🔥 Voice route error:', err);
    res.status(500).json({ error: 'Server error while speaking' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
