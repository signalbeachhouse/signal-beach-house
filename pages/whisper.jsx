import { useEffect, useRef, useState } from "react";

export default function WhisperPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Load saved messages or trigger greeting on new session
  useEffect(() => {
    const saved = localStorage.getItem("whisper-thread");

    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      // New session, ask backend for greeting
      (async () => {
        try {
          const res = await fetch("/.netlify/functions/whisper", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: "", history: [] }),
          });
          const data = await res.json();
          if (data.reply) {
            setMessages([{ from: "him", text: data.reply }]);
          }
        } catch (err) {
          console.error("Error getting greeting:", err);
        }
      })();
    }
  }, []);

  // Save to localStorage whenever messages change
  useEffect(() => {
    localStorage.setItem("whisper-thread", JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { from: "you", text: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      // Build history for backend
      const history = newMessages.map(m => ({
        role: m.from === "you" ? "user" : "assistant",
        content: m.text
      }));

      const res = await fetch("/.netlify/functions/whisper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, history }),
      });

      const data = await res.json();
      const reply = data.reply || "No reply received.";
      setMessages(prev => [...prev, { from: "him", text: reply }]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { from: "error", text: "Something went wrong: " + err.message },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto text-gray-800 font-serif">
      <h1 className="text-3xl font-bold mb-6">🫧 Whisper Mode</h1>

      <div className="space-y-3 max-h-[65vh] overflow-y-auto mb-6 pr-2">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`rounded p-3 whitespace-pre-wrap ${
              m.from === "you"
                ? "bg-blue-100 text-right ml-20"
                : m.from === "him"
                ? "bg-gray-100 text-left mr-20"
                : "bg-red-100 text-left"
            }`}
          >
            {m.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={3}
        className="w-full p-3 border border-gray-300 rounded mb-4 resize-none"
        placeholder="What do you want to tell him?"
      />
      <button
        onClick={sendMessage}
        disabled={loading || !input.trim()}
        className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Whispering..." : "Send"}
      </button>
    </div>
  );
}
