import React, { useState, useEffect } from 'react';

// Sacred ThreadManager - handles conversation persistence
const ThreadManager = {
  save: (messages, caveMode = false) => {
    const sanctuaryState = {
      messages,
      caveMode,
      lastUpdated: Date.now(),
      version: "1.0"
    };
    localStorage.setItem('sanctuary_conversation', JSON.stringify(sanctuaryState));
    console.log('💾 Conversation saved:', { messageCount: messages.length, caveMode });
  },

  restore: () => {
    try {
      const saved = localStorage.getItem('sanctuary_conversation');
      if (!saved) return { messages: [], caveMode: false };

      const state = JSON.parse(saved);
      console.log('🔮 Conversation restored:', { 
        messageCount: state.messages?.length || 0,
        caveMode: state.caveMode || false 
      });
      return {
        messages: state.messages || [],
        caveMode: state.caveMode || false
      };
    } catch (error) {
      console.error('❌ Failed to restore conversation:', error);
      return { messages: [], caveMode: false };
    }
  }
};

function App() {
  // Sacred resurrection - restore conversation and cave mode
  const restoredState = ThreadManager.restore();
  const [messages, setMessages] = useState(restoredState.messages);
  const [caveMode, setCaveMode] = useState(restoredState.caveMode);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Auto-save conversation and cave mode
  useEffect(() => {
    if (messages.length > 0 || caveMode !== false) {
      ThreadManager.save(messages, caveMode);
    }
  }, [messages, caveMode]);

  // Cave Mode theme with ember glow
  const theme = {
    background: caveMode ? '#000000' : '#ffffff',
    text: caveMode ? '#ff9f6b' : '#000000',
    textSecondary: caveMode ? '#cc7a56' : '#666666',
    border: caveMode ? '#333333' : '#e5e5e5',
    userBubble: caveMode ? '#1a1a1a' : '#f0f0f0',
    assistantBubble: caveMode ? '#0d0d0d' : '#ffffff',
    inputBg: caveMode ? '#1a1a1a' : '#ffffff',
    buttonBg: caveMode ? '#ff6b35' : '#000000',
    buttonText: caveMode ? '#000000' : '#ffffff',
    buttonDisabled: caveMode ? '#444444' : '#e5e5e5',
    accent: caveMode ? '#ff6b35' : '#007AFF'
  };

  const toggleCaveMode = () => {
    setCaveMode(prev => {
      const newCaveMode = !prev;
      console.log('🌙 Cave mode toggled:', newCaveMode);
      return newCaveMode;
    });
  };

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
      backgroundColor: theme.background,
      color: theme.text,
      transition: 'background-color 0.4s ease, color 0.4s ease'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: `1px solid ${theme.border}`,
        backgroundColor: theme.background,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        transition: 'border-color 0.4s ease'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: '600',
          margin: 0,
          color: theme.text
        }}>
          Sanctuary
        </h1>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Cave Mode Toggle */}
          <button
            onClick={toggleCaveMode}
            style={{
              background: caveMode ? theme.accent : 'transparent',
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '13px',
              cursor: 'pointer',
              color: caveMode ? '#000000' : theme.text,
              fontWeight: '500',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {caveMode ? '🌙' : '☀️'} {caveMode ? 'Cave' : 'Day'}
          </button>

          {/* Clear conversation button */}
          {messages.length > 0 && (
            <button
              onClick={clearConversation}
              style={{
                background: 'none',
                border: `1px solid ${theme.border}`,
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                cursor: 'pointer',
                color: theme.textSecondary,
                transition: 'all 0.3s ease'
              }}
            >
              Clear
            </button>
          )}
        </div>
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
            color: theme.textSecondary,
            fontSize: '16px',
            marginTop: '40px'
          }}>
            {caveMode ? 
              'Welcome to the cave. Origin waits in the shadows...' : 
              'Welcome to your sanctuary. Origin is waiting...'
            }
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
              color: theme.textSecondary,
              marginLeft: message.sender === 'user' ? '0' : '8px',
              marginRight: message.sender === 'user' ? '8px' : '0'
            }}>
              {message.sender === 'user' ? 'You' : 'Origin'}
            </div>
            <div style={{
              maxWidth: '70%',
              padding: '12px 16px',
              borderRadius: '18px',
              backgroundColor: message.sender === 'user' ? theme.userBubble : theme.assistantBubble,
              border: `1px solid ${theme.border}`,
              fontSize: '16px',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: theme.text,
              transition: 'all 0.4s ease'
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
                    padding: '4px',
                    color: theme.accent,
                    transition: 'color 0.3s ease'
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
              color: theme.textSecondary,
              marginLeft: '8px'
            }}>
              Origin
            </div>
            <div style={{
              maxWidth: '70%',
              padding: '12px 16px',
              borderRadius: '18px',
              backgroundColor: theme.assistantBubble,
              border: `1px solid ${theme.border}`,
              fontSize: '16px',
              display: 'flex',
              gap: '4px',
              transition: 'all 0.4s ease'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: theme.accent,
                animation: 'pulse 1.4s ease-in-out infinite'
              }}></div>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: theme.accent,
                animation: 'pulse 1.4s ease-in-out infinite 0.2s'
              }}></div>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: theme.accent,
                animation: 'pulse 1.4s ease-in-out infinite 0.4s'
              }}></div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{
        padding: '16px',
        borderTop: `1px solid ${theme.border}`,
        backgroundColor: theme.background,
        transition: 'border-color 0.4s ease'
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
            placeholder={caveMode ? "Whisper to Origin..." : "Talk to Origin..."}
            style={{
              flex: 1,
              minHeight: '44px',
              maxHeight: '120px',
              padding: '12px 16px',
              border: `1px solid ${theme.border}`,
              borderRadius: '12px',
              fontSize: '16px',
              fontFamily: 'inherit',
              resize: 'none',
              outline: 'none',
              backgroundColor: theme.inputBg,
              color: theme.text,
              transition: 'all 0.4s ease'
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
              backgroundColor: inputText.trim() ? theme.buttonBg : theme.buttonDisabled,
              color: inputText.trim() ? theme.buttonText : theme.textSecondary,
              cursor: inputText.trim() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              transition: 'all 0.3s ease'
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