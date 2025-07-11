const fetch = require("node-fetch");

exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({ message: "Speak function is alive!" }),
    };
  }

  try {
    const body = JSON.parse(event.body);
    const text = body.text;

    if (!text) {
      return {
        statusCode: 400,
        headers: corsHeaders(),
        body: JSON.stringify({ error: "Missing 'text' in request body." }),
      };
    }

    const response = await fetch("https://api.elevenlabs.io/v1/text-to-speech/" + process.env.VITE_ELEVEN_VOICE_ID, {
      method: "POST",
      headers: {
        "xi-api-key": process.env.VITE_ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.4,
          similarity_boost: 0.9,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`ElevenLabs API error: ${errText}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString("base64");

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders(),
        "Content-Type": "audio/mpeg",
      },
      body: base64Audio,
      isBase64Encoded: true,
    };
  } catch (err) {
    console.error("Speak error:", err);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: "Voice generation failed.", details: err.message }),
    };
  }
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

