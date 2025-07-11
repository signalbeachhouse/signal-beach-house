import React, { useState } from "react";

function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "you", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/whisper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      const whisperReply = { sender: "whisper", text: data.reply };
      setMessages((prev) => [...prev, whisperReply]);
    } catch (error) {
      console.error("❌ Whisper fetch failed:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "whisper", text: "Something went wrong." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="w-full max-w-2xl p-4">
      <div className="h-[60vh] overflow-y-auto bg-white rounded-xl shadow-inner p-4 mb-4 space-y-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`${
              msg.sender === "you"
                ? "text-right text-gray-700"
                : "text-left text-purple-800 italic"
            }`}
          >
            {msg.text}
          </div>
        ))}
        {isLoading && (
          <div className="text-left text-gray-500 italic animate-pulse">
            whispering...
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-300"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={sendMessage}
          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatWindow;

