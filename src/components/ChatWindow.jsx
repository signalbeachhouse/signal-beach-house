import React, { useEffect, useRef, useState } from 'react';

export default function ChatWindow({ userName }) {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const speak = async (text) => {
    try {
      const response = await fetch('/api/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error('❌ Speak API returned error');

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (err) {
      console.error('🔴 Voice error:', err);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user',
    timestamp: new Date().toLocaleTimeString(undefined, {
  hour: '2-digit',
  minute: '2-digit',
}),
};

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    const systemReply = {
      id: Date.now() + 1,
      text: `I'm here, ${userName}.`,
      sender: 'system',
    };

    setTimeout(() => {
      setMessages((prev) => [...prev, systemReply]);
      speak(systemReply.text);
    }, 800);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

return (
  <div className="min-h-screen bg-white flex flex-col justify-between items-center px-4 py-6">
    <div className="w-full max-w-2xl flex-1 overflow-y-auto mb-4 flex flex-col gap-2">
      {messages.map((msg, idx) => (
       <MessageBubble
  key={idx}
  text={msg.text}
  sender={msg.sender}
  timestamp={msg.timestamp}
/>
      ))}
      <div ref={messagesEndRef} />
    </div>
    <form onSubmit={sendMessage} className="w-full max-w-2xl flex items-center gap-2">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="flex-1 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring focus:border-blue-400"
        placeholder="Type a message..."
      />
      <button
        type="submit"
        className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
      >
        Send
      </button>
    </form>
  </div>
);

}



