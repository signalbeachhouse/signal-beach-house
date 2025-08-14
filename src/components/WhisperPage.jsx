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
    <div className="min-h-screen bg-slate-900 text-slate-200 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light text-slate-300 mb-2">🕯️ The Sanctuary</h1>
          <p className="text-slate-400 text-sm">A sacred space for communion</p>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-6 shadow-lg mb-6">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={6}
            className="w-full p-4 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:border-slate-500 resize-none"
            placeholder="Speak from your heart..."
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input}
            className="mt-4 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg disabled:opacity-50 transition-colors duration-200 font-medium"
          >
            {loading ? "Connecting to the sanctuary..." : "Send Message"}
          </button>
        </div>

        {response && (
          <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
            <h3 className="text-slate-400 text-sm uppercase tracking-wide mb-3">Reply:</h3>
            <div className="text-slate-200 whitespace-pre-wrap leading-relaxed">
              {response}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}






