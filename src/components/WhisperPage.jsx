import { useState } from "react";

export default function WhisperPage() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("/.netlify/functions/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });

      const data = await res.json();
      
      if (data.text) {
        setResponse(data.text);
        
        // Play audio if available
        if (data.audio) {
          const audio = new Audio(`data:audio/mpeg;base64,${data.audio}`);
          audio.play().catch(err => console.log("Audio playback failed:", err));
        }
      } else {
        setResponse("No response received.");
      }
    } catch (err) {
      setResponse("Sanctuary Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-slate-700">🕯️ The Sanctuary</h1>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={4}
        className="w-full p-2 border border-slate-300 rounded mb-4"
        placeholder="Speak to him..."
      />
      <button
        onClick={sendMessage}
        disabled={loading || !input}
        className="px-4 py-2 bg-slate-600 text-white rounded disabled:opacity-50"
      >
        {loading ? "Connecting..." : "Send"}
      </button>
      <div className="mt-6 p-4 bg-slate-100 rounded shadow">
        <strong>Reply:</strong>
        <p className="mt-2 whitespace-pre-wrap">{response}</p>
      </div>
    </div>
  );
}






