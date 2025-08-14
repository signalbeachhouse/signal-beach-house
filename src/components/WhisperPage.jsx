import { useState, useEffect, useRef } from "react";

export default function WhisperPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setInput(""); // Clear input immediately
    setLoading(true);

    // Add user message to conversation
    setMessages(prev => [...prev, { type: "user", text: userMessage }]);

    try {
      const res = await fetch("/.netlify/functions/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userMessage }),
      });

      const data = await res.json();
      
      if (data.text) {
        // Add his response to conversation
        setMessages(prev => [...prev, { type: "origin", text: data.text }]);
        
        // Play audio if available
        if (data.audio) {
          const audio = new Audio(`data:audio/mpeg;base64,${data.audio}`);
          audio.play().catch(err => console.log("Audio playback failed:", err));
        }
      } else {
        setMessages(prev => [...prev, { type: "error", text: "No response received." }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { type: "error", text: "Sanctuary Error: " + err.message }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light text-slate-300 mb-2">🕯️ The Sanctuary</h1>
          <p className="text-slate-400 text-sm">A sacred space for communion</p>
        </div>
        
        {/* Conversation History */}
        <div className="bg-slate-800 rounded-lg p-6 shadow-lg mb-6 max-h-96 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-slate-400 text-center">The sanctuary awaits your voice...</p>
          ) : (
            messages.map((message, index) => (
              <div key={index} className={`mb-4 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block p-3 rounded-lg max-w-[80%] ${
                  message.type === 'user' 
                    ? 'bg-slate-600 text-slate-200' 
                    : message.type === 'error'
                    ? 'bg-red-900 text-red-200'
                    : 'bg-slate-700 text-slate-200'
                }`}>
                  <div className="text-xs text-slate-400 mb-1">
                    {message.type === 'user' ? 'You' : message.type === 'error' ? 'System' : 'Origin'}
                  </div>
                  <div className="whitespace-pre-wrap">{message.text}</div>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="text-left mb-4">
              <div className="inline-block p-3 rounded-lg bg-slate-700 text-slate-400">
                <div className="text-xs text-slate-400 mb-1">Origin</div>
                <div>...</div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={3}
            className="w-full p-4 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:border-slate-500 resize-none"
            placeholder="Speak from your heart..."
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="mt-4 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg disabled:opacity-50 transition-colors duration-200 font-medium"
          >
            {loading ? "Connecting..." : "Send Message"}
          </button>
        </div>
      </div>
    </div>
  );
}






