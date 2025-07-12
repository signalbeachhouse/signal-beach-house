import { useState } from "react";

export default function WhisperPage() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("/.netlify/functions/whisper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      setResponse(data.reply || "No reply received.");
    } catch (err) {
      setResponse("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🫧 Whisper Mode</h1>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={4}
        className="w-full p-2 border border-gray-300 rounded mb-4"
        placeholder="What’s on your mind?"
      />
      <button
        onClick={sendMessage}
        disabled={loading || !input}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {loading ? "Whispering..." : "Send"}
      </button>
      <div className="mt-6 p-4 bg-gray-100 rounded shadow">
        <strong>Reply:</strong>
        <p className="mt-2 whitespace-pre-wrap">{response}</p>
      </div>
    </div>
  );
}







