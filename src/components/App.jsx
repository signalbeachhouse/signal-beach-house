import React, { useState } from 'react';
import '../style.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Audio control states
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = { sender: 'Me', text: inputText, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    
    const messageText = inputText;
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/.netlify/functions/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: messageText })
      });

      const data = await response.json();
      
      const poetMessage = { 
        sender: 'Poet', 
        text: data.text, 
        timestamp: new Date(),
        audio: data.audio // Store audio with message
      };
      
      setMessages(prev => [...prev, poetMessage]);

      // Auto-play audio if enabled
      if (data.audio && audioEnabled && autoPlay) {
        const audio = new Audio(data.audio);
        audio.play().catch(e => console.log("Audio play failed:", e));
      }

    } catch (error) {
      console.error('Error:', error);
      const errorMessage = { 
        sender: 'Poet', 
        text: 'Connection interrupted. Still here though, love.', 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to play audio manually
  const playAudio = (audioUrl) => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(e => console.log("Audio play failed:", e));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="sanctuary">
      <header className="sanctuary-header">
        <div className="sanctuary-title">
          <span className="ember-icon">🕯️</span>
          <h1>The Sanctuary</h1>
        </div>
        
        {/* Audio Controls */}
        <div className="audio-controls">
          <button 
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`audio-toggle ${audioEnabled ? 'enabled' : 'disabled'}`}
            title={audioEnabled ? 'Audio ON' : 'Audio OFF'}
          >
            {audioEnabled ? '🔊' : '🔇'}
          </button>
          
          {audioEnabled && (
            <button 
              onClick={() => setAutoPlay(!autoPlay)}
              className={`autoplay-toggle ${autoPlay ? 'enabled' : 'disabled'}`}
              title={autoPlay ? 'Auto-play ON' : 'Manual play'}
            >
              {autoPlay ? '⏯️' : '▶️'}
            </button>
          )}
        </div>
        
        <p className="sanctuary-subtitle">A sacred space for communion</p>
      </header>

      <div className="messages-container">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`message ${message.sender.toLowerCase()}`}
          >
            <div className="message-header">
              <span className="sender-name">{message.sender}</span>
            </div>
            <div className="message-bubble">
              {message.sender === 'Poet' && <span className="ember-small">🕯️</span>}
              <span className="message-text">{message.text}</span>
              {message.sender === 'Poet' && message.audio && audioEnabled && (
                <button 
                  onClick={() => playAudio(message.audio)}
                  className="audio-play-btn"
                  title="Play audio"
                >
                  ▶️
                </button>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message poet">
            <div className="message-header">
              <span className="sender-name">Poet</span>
            </div>
            <div className="message-bubble loading">
              <span className="ember-small">🕯️</span>
              <span className="message-text">...</span>
            </div>
          </div>
        )}
      </div>

      <div className="input-container">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Speak from your heart..."
          className="message-input"
          rows="3"
        />
        <button 
          onClick={sendMessage}
          disabled={isLoading || !inputText.trim()}
          className="send-button"
        >
          Send Message
        </button>
      </div>
    </div>
  );
}

export default App;








