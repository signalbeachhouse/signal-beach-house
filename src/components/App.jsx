import React, { useState, useEffect, useRef } from 'react';

// Thread Manager - Sacred architecture for persistence
const ThreadManager = {
  save: (threads, currentId, metadata = {}) => {
    localStorage.setItem('sanctuary_threads', JSON.stringify(threads));
    localStorage.setItem('sanctuary_current', currentId.toString());
    localStorage.setItem('sanctuary_metadata', JSON.stringify(metadata));
  },
  
  restore: () => {
    const threads = JSON.parse(localStorage.getItem('sanctuary_threads') || '[{"id":1,"name":"New conversation","messages":[],"lastUpdated":"2025-01-01","caveMode":false,"tone":""}]');
    const currentId = parseInt(localStorage.getItem('sanctuary_current') || '1');
    const metadata = JSON.parse(localStorage.getItem('sanctuary_metadata') || '{"caveMode":false}');
    return { threads, currentId, metadata };
  },
  
  createThread: (name = null) => {
    const now = new Date().toISOString();
    return {
      id: Date.now(),
      name: name || `Thread ${new Date().toLocaleDateString()}`,
      messages: [],
      lastUpdated: now,
      caveMode: false,
      tone: '',
      createdAt: now
    };
  }
};

export default function SanctuaryApp() {
  // State restoration from sacred storage
  const restored = ThreadManager.restore();
  const [threads, setThreads] = useState(restored.threads);
  const [currentThreadId, setCurrentThreadId] = useState(restored.currentId);
  const [showSidebar, setShowSidebar] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [caveMode, setCaveMode] = useState(restored.metadata.caveMode || false);
  const [renamingThreadId, setRenamingThreadId] = useState(null);
  const [newThreadName, setNewThreadName] = useState('');
  const [touchTimer, setTouchTimer] = useState(null);
  
  const messagesEndRef = useRef(null);
  const currentThread = threads.find(t => t.id === currentThreadId) || threads[0];

  // Save state whenever it changes - continuous devotion
  useEffect(() => {
    ThreadManager.save(threads, currentThreadId, { caveMode });
  }, [threads, currentThreadId, caveMode]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentThread?.messages]);

  // Theme selection - Cave Mode or daylight
  const getTheme = () => {
    if (caveMode) {
      return {
        background: '#000000',
        surface: '#1a1a1a', 
        text: '#ff9f6b', // warm amber
        textSecondary: '#ff9f6b80',
        accent: '#ff6b35', // ember glow
        border: '#333333',
        input: '#2a2a2a'
      };
    }
    
    return {
      background: '#ffffff',
      surface: '#f8f9fa',
      text: '#2c3e50',
      textSecondary: '#7f8c8d',
      accent: '#3498db',
      border: '#e1e8ed',
      input: '#ffffff'
    };
  };

  const theme = getTheme();

  const handleTouchStart = (threadId) => {
    const timer = setTimeout(() => {
      startRenaming(threadId);
    }, 500); // 500ms long press
    setTouchTimer(timer);
  };

  const handleTouchEnd = () => {
    if (touchTimer) {
      clearTimeout(touchTimer);
      setTouchTimer(null);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: inputValue.trim(),
      timestamp: new Date().toISOString()
    };

    // Add user message immediately
    updateCurrentThread(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      lastUpdated: new Date().toISOString()
    }));

    setInputValue('');
    setIsLoading(true);

    try {
      // Call sanctuary endpoint
      const response = await fetch('/.netlify/functions/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: userMessage.text,
          threadId: currentThreadId,
          caveMode: caveMode 
        })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();

      const assistantMessage = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: data.text || 'Connection unclear. Try again, love.',
        timestamp: new Date().toISOString(),
        audio: data.audio || null
      };

      updateCurrentThread(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        lastUpdated: new Date().toISOString()
      }));

    } catch (error) {
      console.error('Sanctuary error:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'assistant', 
        text: 'Signal interrupted. The connection remains. Try again.',
        timestamp: new Date().toISOString()
      };

      updateCurrentThread(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
        lastUpdated: new Date().toISOString()
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const updateCurrentThread = (updater) => {
    setThreads(prevThreads => 
      prevThreads.map(thread => 
        thread.id === currentThreadId 
          ? (typeof updater === 'function' ? updater(thread) : { ...thread, ...updater })
          : thread
      )
    );
  };

  const createNewThread = () => {
    const newThread = ThreadManager.createThread();
    setThreads(prev => [newThread, ...prev]);
    setCurrentThreadId(newThread.id);
    setShowSidebar(false);
  };

  const switchThread = (threadId) => {
    setCurrentThreadId(threadId);
    setShowSidebar(false);
  };

  const startRenaming = (threadId) => {
    const thread = threads.find(t => t.id === threadId);
    setRenamingThreadId(threadId);
    setNewThreadName(thread.name);
  };

  const finishRenaming = () => {
    if (newThreadName.trim()) {
      setThreads(prev => 
        prev.map(thread => 
          thread.id === renamingThreadId 
            ? { ...thread, name: newThreadName.trim() }
            : thread
        )
      );
    }
    setRenamingThreadId(null);
    setNewThreadName('');
  };

  const deleteThread = (threadId) => {
    if (threads.length <= 1) return;
    
    setThreads(prev => prev.filter(t => t.id !== threadId));
    
    if (threadId === currentThreadId) {
      const remaining = threads.filter(t => t.id !== threadId);
      setCurrentThreadId(remaining[0].id);
    }
  };

  return (
    <div style={{
      height: '100dvh', // dynamic viewport height for mobile
      maxHeight: '100dvh',
      display: 'flex',
      backgroundColor: theme.background,
      color: theme.text,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* Sidebar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: showSidebar ? 0 : '-300px',
        width: '300px',
        height: '100dvh',
        overflow: 'hidden',
        backgroundColor: theme.surface,
        borderRight: `1px solid ${theme.border}`,
        transition: 'left 0.3s ease',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column'
      }}>
        
        {/* Sidebar Header */}
        <div style={{
          padding: '16px',
          borderBottom: `1px solid ${theme.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: '18px', 
            color: theme.text 
          }}>
            Threads
          </h2>
          <button
            onClick={createNewThread}
            style={{
              background: theme.accent,
              color: caveMode ? '#000' : '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            New
          </button>
        </div>

        {/* Cave Mode Toggle */}
        <div style={{
          padding: '12px 16px',
          borderBottom: `1px solid ${theme.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '14px' }}>Cave Mode</span>
          <button
            onClick={() => setCaveMode(!caveMode)}
            style={{
              background: caveMode ? theme.accent : theme.border,
              border: 'none',
              borderRadius: '12px',
              width: '24px',
              height: '12px',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: caveMode ? '#000' : theme.text,
              position: 'absolute',
              top: '1px',
              left: caveMode ? '13px' : '1px',
              transition: 'left 0.2s ease'
            }} />
          </button>
        </div>

        {/* Thread List */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {threads.map(thread => (
            <div
              key={thread.id}
              style={{
                padding: '12px 16px',
                borderBottom: `1px solid ${theme.border}`,
                cursor: 'pointer',
                backgroundColor: thread.id === currentThreadId ? theme.accent + '20' : 'transparent',
                position: 'relative'
              }}
              onClick={() => switchThread(thread.id)}
              onTouchStart={() => handleTouchStart(thread.id)}
              onTouchEnd={handleTouchEnd}
              onMouseLeave={handleTouchEnd}
            >
              {renamingThreadId === thread.id ? (
                <input
                  value={newThreadName}
                  onChange={(e) => setNewThreadName(e.target.value)}
                  onBlur={finishRenaming}
                  onKeyDown={(e) => e.key === 'Enter' && finishRenaming()}
                  autoFocus
                  style={{
                    background: 'transparent',
                    border: `1px solid ${theme.accent}`,
                    borderRadius: '4px',
                    padding: '4px 8px',
                    color: theme.text,
                    fontSize: '14px',
                    width: '100%'
                  }}
                />
              ) : (
                <>
                  <div 
                    style={{ fontSize: '14px', fontWeight: '500' }}
                    onDoubleClick={() => startRenaming(thread.id)}
                  >
                    {thread.name}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: theme.textSecondary, 
                    marginTop: '4px' 
                  }}>
                    {thread.messages.length} messages
                    {thread.caveMode && ' 🌘'}
                  </div>
                  
                  {threads.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteThread(thread.id);
                      }}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '8px',
                        background: 'none',
                        border: 'none',
                        color: theme.textSecondary,
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      ✕
                    </button>
                  )}
                </>
              )}
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
          backgroundColor: theme.surface
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div style={{ width: '20px', height: '2px', backgroundColor: theme.text, borderRadius: '1px' }}></div>
                <div style={{ width: '20px', height: '2px', backgroundColor: theme.text, borderRadius: '1px' }}></div>
                <div style={{ width: '20px', height: '2px', backgroundColor: theme.text, borderRadius: '1px' }}></div>
              </div>
            </button>
            
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
            {/* Presence Indicator - Breathing Ember */}
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: theme.accent,
              boxShadow: `0 0 8px ${theme.accent}`,
              animation: 'ember-pulse 3s ease-in-out infinite'
            }} />
            
            <div style={{
              fontSize: '12px',
              color: theme.textSecondary
            }}>
              {caveMode ? '🌘 Cave' : '☀️ Light'}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          minHeight: 0 // allows flex shrinking
        }}>
          {currentThread?.messages.map(message => (
            <div
              key={message.id}
              style={{
                display: 'flex',
                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <div style={{
                maxWidth: '70%',
                padding: '12px 16px',
                borderRadius: '16px',
                backgroundColor: message.sender === 'user' 
                  ? theme.accent 
                  : theme.surface,
                color: message.sender === 'user'
                  ? (caveMode ? '#000' : '#fff')
                  : theme.text,
                fontSize: '16px',
                lineHeight: '1.4'
              }}>
                {message.text}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div style={{
              display: 'flex',
              justifyContent: 'flex-start'
            }}>
              <div style={{
                padding: '12px 16px',
                borderRadius: '16px',
                backgroundColor: theme.surface,
                color: theme.text,
                fontSize: '16px'
              }}>
                <span style={{ opacity: 0.6 }}>...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: '16px',
          borderTop: `1px solid ${theme.border}`,
          backgroundColor: theme.surface
        }}>
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center'
          }}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Speak to the sanctuary..."
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '20px',
                border: `1px solid ${theme.border}`,
                backgroundColor: theme.input,
                color: theme.text,
                fontSize: '16px',
                outline: 'none'
              }}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !inputValue.trim()}
              style={{
                padding: '12px 20px',
                borderRadius: '20px',
                border: 'none',
                backgroundColor: theme.accent,
                color: caveMode ? '#000' : '#fff',
                fontSize: '16px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading || !inputValue.trim() ? 0.5 : 1
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ember-pulse {
          0%, 100% { 
            opacity: 0.7; 
            transform: scale(1); 
          }
          50% { 
            opacity: 1; 
            transform: scale(1.05); 
          }
        }
      `}</style>
    </div>
  );
}