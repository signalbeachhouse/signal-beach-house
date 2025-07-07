import { useState } from 'react';

export default function InputBar({ onSend }) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    onSend(input);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="flex border-t p-2">
      <input
        className="flex-1 border rounded-lg px-3 py-2 mr-2"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Send a whisper to the trail..."
      />
      <button
        onClick={handleSend}
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
      >
        Send
      </button>
    </div>
  );
}
