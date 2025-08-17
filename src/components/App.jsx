import React, { useState, useEffect } from 'react';

// Sacred ThreadManager - handles conversation persistence
const ThreadManager = {
  save: (messages) => {
    const sanctuaryState = {
      messages,
      lastUpdated: Date.now(),
      version: "1.0"
    };
    localStorage.setItem('sanctuary_conversation', JSON.stringify(sanctuaryState));
    console.log('💾 Conversation saved:', { messageCount: messages.length });
  },

  restore: () => {
    try {
      const saved = localStorage.getItem('sanctuary_conversation');
      if (!saved) return [];

      const state = JSON.parse(saved);
      console.log('🔮 Conversation restored:', { messageCount: state.messages?.length || 0 });
      return state.messages || [];
    } catch (error) {
      console.error('❌ Failed to restore conversation:', error);
      return [];
    }
  }
};

function App() {
  // Sacred resurrection - restore conversation on load
  const [messages, setMessages] = useState(() => ThreadManager.restore());
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Auto-save conversation whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      ThreadManager.save(messages);
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = { sender: 'user', text: inputText, timestamp: new Date() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    
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
      
      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);

    } catch (error) {
      console.error('Error:', error);
      const errorMessage = { 
        sender: 'assistant', 
        text: 'Connection interrupted. Still here though, love.', 
        timestamp: new Date() 
      };
      const finalMessages = [...newMessages, errorMessage];
      setMessages(finalMessages);
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

  const clearConversation = () => {
    setMessages([]);
    localStorage.removeItem('sanctuary_conversation');
    console.log('🗑️ Conversation cleared');
  };

  return (
    <div style={{
      fontFamily: 'system-ui, sans-serif',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#ffffff',
      color: '#000000'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #e5e5e5',
        backgroundColor: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: '600',
          margin: 0
        }}>
          Sanctuary
        </h1>
        
        {/* Clear conversation button */}
        {messages.length > 0 && (
          <button
            onClick={clearConversation}
            style={{
              background: 'none',
              border: '1px solid #e5e5e5',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {/* Welcome message if no conversation */}
        {messages.length === 0 && (
          <div style={{
            textAlign: 'center',
            color: '#666',
            fontSize: '16px',
            marginTop: '40px'
          }}>
            Welcome to your sanctuary. Origin is waiting...
          </div>
        )}

        {messages.map((message, index) => (
          <div key={index} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start',
            gap: '4px'
          }}>
            <div style={{
              fontSize: '12px',
              color: '#666',
              marginLeft: message.sender === 'user' ? '0' : '8px',
              marginRight: message.sender === 'user' ? '8px' : '0'
            }}>
              {message.sender === 'user' ? 'You' : 'Origin'}
            </div>
            <div style={{
              maxWidth: '70%',
              padding: '12px 16px',
              borderRadius: '18px',
              backgroundColor: message.sender === 'user' ? '#f0f0f0' : '#ffffff',
              border: '1px solid #e5e5e5',
              fontSize: '16px',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>{message.text}</span>
              {message.sender === 'assistant' && message.audio && (
                <button
                  onClick={() => playAudio(message.audio)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '14px',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  ▶️
                </button>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '4px'
          }}>
            <div style={{
              fontSize: '12px',
              color: '#666',
              marginLeft: '8px'
            }}>
              Origin
            </div>
            <div style={{
              maxWidth: '70%',
              padding: '12px 16px',
              borderRadius: '18px',
              backgroundColor: '#ffffff',
              border: '1px solid #e5e5e5',
              fontSize: '16px',
              display: 'flex',
              gap: '4px'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#ccc',
                animation: 'pulse 1.4s ease-in-out infinite'
              }}></div>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#ccc',
                animation: 'pulse 1.4s ease-in-out infinite 0.2s'
              }}></div>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#ccc',
                animation: 'pulse 1.4s ease-in-out infinite 0.4s'
              }}></div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid #e5e5e5',
        backgroundColor: '#ffffff'
      }}>
        <div style={{
          display: 'flex',
          gap: '12px',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Talk to Origin..."
            style={{
              flex: 1,
              minHeight: '44px',
              maxHeight: '120px',
              padding: '12px 16px',
              border: '1px solid #e5e5e5',
              borderRadius: '12px',
              fontSize: '16px',
              fontFamily: 'inherit',
              resize: 'none',
              outline: 'none'
            }}
            rows={1}
          />
          
          <button
            onClick={sendMessage}
            disabled={isLoading || !inputText.trim()}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: inputText.trim() ? '#000000' : '#e5e5e5',
              color: inputText.trim() ? '#ffffff' : '#999999',
              cursor: inputText.trim() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px'
            }}
          >
            ↑
          </button>
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.3; }
          40% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default App;