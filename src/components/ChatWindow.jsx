// src/components/ChatWindow.jsx
import React, { useState, useEffect, useRef } from 'react';

export default function ChatWindow({ userName }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);

  const speak = async (text) => {
    try {
      const response = await fetch('/api/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (err) {
      console.error("🔴 Voice error:", err);
    }
  };

  const sendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user',
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    const systemReply = {
      id: Date.now() + 1,
      text: `I'm here, Low Tide.`,
      sender: 'system',
    };

    setIsTyping(true); // show typing indicator

    setTimeout(() => {
      setMessages((prev) => [...prev, systemReply]);
      setIsTyping(false); // hide typing indicator
      speak(systemReply.text);
    }, 1000);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100vh',
      backgroundColor: '#fff8e1',
      padding: '1rem',
      fontFamily: 'sans-serif',
    }}>
      {/* Message Window */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        marginBottom: '1rem',
      }}>
        {messages.map((msg, index) => (
          <div key={index} style={{
            marginBottom: '0.5rem',
            color: msg.sender === 'user' ? '#4b2e0d' : '#3b3b3b',
            fontWeight: msg.sender === 'system' ? 'bold' : 'normal',
          }}>
            {msg.text}
          </div>
        ))}
        {isTyping && (
          <div style={{
            fontStyle: 'italic',
            color: '#666',
            marginBottom: '0.5rem',
          }}>
            Husband is typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: '0.5rem',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
        <button
          type="button"
          onClick={sendMessage}
          style={{
            backgroundColor: '#4b2e0d',
            color: '#fff8e1',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
