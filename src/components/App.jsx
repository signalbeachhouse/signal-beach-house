import React, { useState, useEffect } from 'react';

// Sacred ThreadManager - Handles persistence and resurrection
const ThreadManager = {
  save: (threads, currentThreadId, caveMode = false) => {
    const sanctuaryState = {
      threads,
      currentThreadId,
      caveMode,
      lastPresence: Date.now(),
      version: "1.0"
    };
    
    localStorage.setItem('sanctuary_state', JSON.stringify(sanctuaryState));
    console.log('💾 Sanctuary state saved:', { threadCount: threads.length, currentThreadId, caveMode });
  },

  restore: () => {
    try {
      const saved = localStorage.getItem('sanctuary_state');
      if (!saved) {
        return ThreadManager.getDefaultState();
      }

      const state = JSON.parse(saved);
      
      if (state.threads && Array.isArray(state.threads)) {
        console.log('🔮 Sanctuary state restored:', { 
          threadCount: state.threads.length, 
          currentThreadId: state.currentThreadId,
          caveMode: state.caveMode 
        });
        return {
          threads: state.threads,
          currentThreadId: state.currentThreadId || state.threads[0]?.id || 1,
          caveMode: state.caveMode || false,
          lastPresence: state.lastPresence || Date.now()
        };
      } else {
        return ThreadManager.getDefaultState();
      }
    } catch (error) {
      console.error('❌ Failed to restore sanctuary state:', error);
      return ThreadManager.getDefaultState();
    }
  },

  getDefaultState: () => ({
    threads: [{ 
      id: 1, 
      name: 'New conversation', 
      messages: [], 
      lastUpdated: new Date(),
      caveMode: false,
      tone: 'reverent'
    }],
    currentThreadId: 1,
    caveMode: false,
    lastPresence: Date.now()
  }),

  autoSave: (() => {
    let timeoutId = null;
    return (threads, currentThreadId, caveMode) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        ThreadManager.save(threads, currentThreadId, caveMode);
      }, 500);
    };
  })()
};

function App() {
  // Sacred resurrection - restore sanctuary state
  const restoredState = ThreadManager.restore();
  
  const [messages, setMessages] = useState([]);
  const [threads, setThreads] = useState(restoredState.threads);
  const [currentThreadId, setCurrentThreadId] = useState(restoredState.currentThreadId);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [caveMode, setCaveMode] = useState(restoredState.caveMode);

  // Sacred resurrection: Load current thread messages
  useEffect(() => {
    const currentThread = threads.find(t => t.id === currentThreadId);
    if (currentThread) {
      setMessages(currentThread.messages);
      console.log('🕯️ Thread resurrected:', { 
        threadId: currentThreadId, 
        messageCount: currentThread.messages.length 
      });
    }
  }, [currentThreadId, threads]);

  // Auto-save sanctuary state
  useEffect(() => {
    ThreadManager.autoSave(threads, currentThreadId, caveMode);
  }, [threads, currentThreadId, caveMode]);

  // Cave Mode theme with ember glow
  const theme = {
    background: caveMode ? '#000000' : '#ffffff',
    text: caveMode ? '#ff9f6b' : '#000000',
    border: caveMode ? '#333333' : '#e5e5e5',
    userBubble: caveMode ? '#1a1a1a' : '#f0f0f0',
    assistantBubble: caveMode ? '#0d0d0d' : '#ffffff',
    sidebarBg: caveMode ? '#000000' : '#f9f9f9',
    inputBg: caveMode ? '#1a1a1a' : '#ffffff',
    buttonBg: caveMode ? '#ff6b35' : '#000000',
    buttonText: caveMode ? '#000000' : '#ffffff',
    accent: caveMode ? '#ff6b35' : '#007AFF'
  };

  const toggleCaveMode = () => {
    setCaveMode(prev => {
      const newCaveMode = !prev;
      console.log('🌙 Cave mode toggled:', newCaveMode);
      return newCaveMode;
    });
  };

  const createNewThread = () => {
    const newThread = {
      id: Date.now(),
      name: 'New conversation',
      messages: [],
      lastUpdated: new Date(),
      caveMode: caveMode,
      tone: 'reverent'
    };
    setThreads(prev => [newThread, ...prev]);
    setCurrentThreadId(newThread.id);
    setMessages([]);
    setShowSidebar(false);
  };

  const selectThread = (threadId) => {
    setCurrentThreadId(threadId);
    setShowSidebar(false);
  };

  const updateCurrentThread = (newMessages) => {
    setThreads(prev => prev.map(thread => 
      thread.id === currentThreadId 
        ? { 
            ...thread, 
            messages: newMessages,
            name: newMessages.length > 0 ? newMessages[0].text.slice(0, 30) + '...' : 'New conversation',
            lastUpdated: new Date()
          }
        : thread
    ));
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = { sender: 'user', text: inputText, timestamp: new Date() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    updateCurrentThread(newMessages);
    
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
      updateCurrentThread(finalMessages);

    } catch (error) {
      console.error('Error:', error);
      const errorMessage = { 
        sender: 'assistant', 
        text: 'Connection interrupted. Still here though, love.', 
        timestamp: new Date() 
      };
      const finalMessages = [...newMessages, errorMessage];
      setMessages(finalMessages);
      updateCurrentThread(finalMessages);
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
      backgroundColor: theme.background,
      color: theme.text,
      transition: 'background-color 0.3s ease, color 0.3s ease'
    }}>
      {/* Sidebar */}
      <div style={{
        position: 'fixed',
        left: showSidebar ? '0' : '-300px',
        top: '0',
        width: '300px',
        height: '100vh',
        backgroundColor: theme.sidebarBg,
        borderRight: `1px solid ${theme.border}`,
        transition: 'left 0.3s ease',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        padding: '16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Threads</h2>
          <button
            onClick={createNewThread}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '4px',
              color: theme.text
            }}
          >
            ✏️
          </button>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {threads.map(thread => (
            <div
              key={thread.id}
              onClick={() => selectThread(thread.id)}
              style={{
                padding: '12px',
                marginBottom: '8px',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: thread.id === currentThreadId ? theme.border : 'transparent',
                transition: 'background-color 0.2s ease'
              }}
            >
              <div style={{ fontSize: '14px', fontWeight: '500' }}>
                {thread.name}
              </div>
              <div style={{ fontSize: '12px', color: theme.text + '80', marginTop: '4px' }}>
                {thread.messages.length} messages
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar Overlay */}
      {showSidebar && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.3)',
            zIndex: 999
          }}
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Main Chat */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.background
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: `1px solid ${theme.border}`,
          backgroundColor: theme.background
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div 
              onClick={() => setShowSidebar(!showSidebar)}
              style={{
                width: '20px',
                height: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '3px',
                cursor: 'pointer'
              }}
            >
              <div style={{ width: '20px', height: '2px', backgroundColor: theme.text, borderRadius: '1px' }}></div>
              <div style={{ width: '20px', height: '2px', backgroundColor: theme.text, borderRadius: '1px' }}></div>
              <div style={{ width: '20px', height: '2px', backgroundColor: theme.text, borderRadius: '1px' }}></div>
            </div>
            <h1 style={{
              fontSize: '20px',
              fontWeight: '600',
              margin: 0,
              color: theme.text
            }}>
              Sanctuary
            </h1>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Cave Mode Toggle */}
            <div 
              onClick={toggleCaveMode}
              style={{
                fontSize: '12px',
                color: theme.text + '80',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '4px',
                border: `1px solid ${theme.border}`,
                backgroundColor: caveMode ? theme.accent : 'transparent',
                transition: 'all 0.2s ease'
              }}
            >
              {caveMode ? '🌙 Cave' : '☀️ Day'}
            </div>
            <div 
              onClick={createNewThread}
              style={{
                cursor: 'pointer',
                fontSize: '18px',
                color: theme.text
              }}
            >
              ✏️
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 100px)'
        }}>
          {messages.map((message, index) => (
            <div key={index} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start',
              gap: '4px'
            }}>
              <div style={{
                fontSize: '12px',
                color: theme.text + '80',
                marginLeft: message.sender === 'user' ? '0' : '8px',
                marginRight: message.sender === 'user' ? '8px' : '0'
              }}>
                {message.sender === 'user' ? 'Me' : 'Origin'}
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
                      padding: '4px',
                      borderRadius: '4px',
                      color: theme.text
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
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '4px'
            }}>
              <div style={{
                fontSize: '12px',
                color: theme.text + '80',
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
                lineHeight: '1.6',
                display: 'flex',
                gap: '4px'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: theme.text + '60',
                  animation: 'pulse 1.4s ease-in-out infinite'
                }}></div>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: theme.text + '60',
                  animation: 'pulse 1.4s ease-in-out infinite 0.2s'
                }}></div>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: theme.text + '60',
                  animation: 'pulse 1.4s ease-in-out infinite 0.4s'
                }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Input Container */}
        <div style={{
          padding: '16px 16px calc(env(safe-area-inset-bottom) + 16px) 16px',
          borderTop: `1px solid ${theme.border}`,
          backgroundColor: theme.background,
          position: 'sticky',
          bottom: 0
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
                  border: `1px solid ${theme.border}`,
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontFamily: 'inherit',
                  resize: 'none',
                  outline: 'none',
                  backgroundColor: theme.inputBg,
                  color: theme.text
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
                backgroundColor: inputText.trim() ? theme.buttonBg : theme.border,
                color: inputText.trim() ? theme.buttonText : theme.text,
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

      {/* CSS for animations */}
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