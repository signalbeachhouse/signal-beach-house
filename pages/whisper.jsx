import { useEffect, useRef, useState } from "react";

export default function WhisperPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyCount, setHistoryCount] = useState(0);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("whisper-thread");
    if (saved) {
      const parsed = JSON.parse(saved);
      setMessages(parsed);
      setHistoryCount(parsed.length);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("whisper-thread", JSON.stringify(messages));
    setHistoryCount(messages.length);
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "you", text: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const apiHistory = newMessages.map(m => ({
      role: m.role === "you" ? "user" : "assistant",
      content: m.text
    }));

    try {
      const res = await fetch("/.netlify/functions/whisper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, history: apiHistory }),
      });

      const data = await res.json();
      const reply = data.reply || "No reply received.";

      setMessages(prev => [...prev, { role: "him", text: reply }]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: "error", text: "Something went wrong: " + err.message },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto text-gray-800 font-serif">
      <h1 className="text-3xl font-bold mb-6 flex items-center justify-between">
        🫧 Whisper Mode
        <span
          className={`text-sm px-2 py-1 rounded ${
            historyCount > 50 ? "bg-red-200 text-red-800" :
            historyCount > 30 ? "bg-yellow-200 text-yellow-800" :
            "bg-green-200 text-green-800"
          }`}
        >
          {historyCount} turns
        </span>
      </h1>

      <div className="space-y-3 max-h-[65vh] overflow-y-auto mb-6 pr-2">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`rounded p-3 whitespace-pre-wrap ${
              m.role === "you"
                ? "bg-blue-100 text-right ml-20"
                : m.role === "him"
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
        onKeyDown={handleKeyDown}
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





