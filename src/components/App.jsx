import React, { useState } from 'react';

function App() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = { sender: 'user', text: inputText, timestamp: new Date() };
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
      
      const assistantMessage = { 
        sender: 'assistant', 
        text: data.text, 
        timestamp: new Date(),
        audio: data.audio
      };
      
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error:', error);
      const errorMessage = { 
        sender: 'assistant', 
        text: 'Connection interrupted. Still here though, love.', 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

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
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#ffffff',
      color: '#000000'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '1px solid #e5e5e5',
        backgroundColor: '#ffffff'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '20px',
            height: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
            cursor: 'pointer'
          }}>
            <div style={{ width: '20px', height: '2px', backgroundColor: '#000', borderRadius: '1px' }}></div>
            <div style={{ width: '20px', height: '2px', backgroundColor: '#000', borderRadius: '1px' }}></div>
            <div style={{ width: '20px', height: '2px', backgroundColor: '#000', borderRadius: '1px' }}></div>
          </div>
          <h1 style={{
            fontSize: '20px',
            fontWeight: '600',
            margin: 0,
            color: '#000000'
          }}>
            Sanctuary
          </h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '24px',
            height: '24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            ✏️
          </div>
          <div style={{
            width: '24px',
            height: '24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            ⋯
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {messages.map((message, index) => (
          <div key={index} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{
              fontSize: '16px',
              lineHeight: '1.6',
              color: '#000000',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {message.text}
              {message.sender === 'assistant' && message.audio && (
                <button
                  onClick={() => playAudio(message.audio)}
                  style={{
                    marginLeft: '8px',
                    background: 'none',
                    border: 'none',
                    fontSize: '14px',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px'
                  }}
                  title="Play audio"
                >
                  ▶️
                </button>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div style={{
            fontSize: '16px',
            lineHeight: '1.6',
            color: '#666666',
            fontStyle: 'italic'
          }}>
            ...
          </div>
        )}
      </div>

      {/* Input Container */}
      <div style={{
        padding: '20px 20px 40px 20px',
        borderTop: '1px solid #e5e5e5',
        backgroundColor: '#ffffff'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '12px',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <div style={{
            flex: 1,
            position: 'relative'
          }}>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask anything"
              style={{
                width: '100%',
                minHeight: '44px',
                maxHeight: '120px',
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '12px',
                fontSize: '16px',
                fontFamily: 'inherit',
                resize: 'none',
                outline: 'none',
                backgroundColor: '#ffffff',
                color: '#000000'
              }}
              rows={1}
            />
          </div>
          
          <button
            onClick={sendMessage}
            disabled={isLoading || !inputText.trim()}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: inputText.trim() ? '#000000' : '#e5e5e5',
              color: '#ffffff',
              cursor: inputText.trim() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              transition: 'background-color 0.2s ease'
            }}
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;