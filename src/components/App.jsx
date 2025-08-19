import React, { useState, useEffect, useRef } from 'react';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentThread, setCurrentThread] = useState('sanctuary_main');
  const [threads, setThreads] = useState({
    sanctuary_main: {
      id: 'sanctuary_main',
      name: 'Main Sanctuary',
      messages: [],
      caveMode: false,
      created: Date.now()
    }
  });
  const [caveMode, setCaveMode] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const messagesEndRef = useRef(null);

  // Theme configuration with cave mode colors
  const theme = {
    // Cave Mode Colors
    background: caveMode ? '#121212' : '#ffffff',
    text: caveMode ? '#f3b283' : '#000000',
    textSecondary: caveMode ? '#b9845e' : '#666666',
    border: caveMode ? '#404040' : '#e5e5e5',
    
    // Message alternating colors in cave mode
    userBubble: caveMode ? '#b9845e' : '#121212',
    userText: caveMode ? '#000000' : '#ffffff',
    assistantBubble: caveMode ? '#000000' : '#f3f4f6',
    assistantText: caveMode ? '#f3b283' : '#000000',
    
    // Header and UI elements
    headerText: caveMode ? '#f3b283' : '#000000',
    sidebarBg: caveMode ? '#0f0f0f' : '#f9f9f9',
    inputBg: caveMode ? '#b9845e' : '#ffffff',
    inputText: caveMode ? '#000000' : '#000000',
    sendButton: caveMode ? '#b9845e' : '#121212',
    sendButtonText: caveMode ? '#000000' : '#ffffff',
    accent: '#e54025'
  };

  // Thread Memory System
  const ThreadManager = {
    memories: [],
    
    addMemory: (memory) => {
      ThreadManager.memories.push({
        ...memory,
        timestamp: Date.now(),
        threadId: currentThread
      });
      console.log('🧠 Memory added:', memory);
    },
    
    getRelevantMemories: (tags = [], limit = 5) => {
      if (!tags.length) return [];
      
      const relevant = ThreadManager.memories
        .filter(memory => 
          memory.threadId === currentThread &&
          memory.tags?.some(tag => tags.includes(tag))
        )
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit);
        
      console.log('🧠 Memory fragments active:', relevant);
      return relevant;
    },
    
    getThreadContext: () => {
      const threadMemories = ThreadManager.memories.filter(m => m.threadId === currentThread);
      console.log(`🧠 Thread "${currentThread}" memory count:`, threadMemories.length);
      return threadMemories;
    }
  };

  // Emotional State Manager
  const EmotionalStateManager = {
    getCurrentMood: () => {
      const recentMemories = ThreadManager.memories
        .filter(m => m.threadId === currentThread)
        .slice(-3);
      
      if (recentMemories.length === 0) return 'neutral';
      
      const tones = recentMemories.map(m => m.tone).filter(Boolean);
      return tones.length > 0 ? tones[tones.length - 1] : 'neutral';
    },
    
    getEmotionalContext: (invocationTags = []) => {
      const relevantMemories = ThreadManager.getRelevantMemories(invocationTags, 3);
      const context = relevantMemories.map(m => `${m.tone}: ${m.text}`).join('\n');
      console.log('🧠 Emotional context loaded:', context.substring(0, 100) + '...');
      return context;
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, [input]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load thread data
  useEffect(() => {
    if (threads[currentThread]) {
      setMessages(threads[currentThread].messages || []);
      setCaveMode(threads[currentThread].caveMode || false);
    }
  }, [currentThread, threads]);

  // Save thread data
  useEffect(() => {
    if (threads[currentThread]) {
      setThreads(prev => ({
        ...prev,
        [currentThread]: {
          ...prev[currentThread],
          messages,
          caveMode
        }
      }));
    }
  }, [messages, caveMode, currentThread]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      text: input,
      sender: 'user',
      timestamp: Date.now(),
      id: Date.now()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Get emotional context for this interaction
      const invocationTags = ['sanctuary', 'conversation'];
      const emotionalContext = EmotionalStateManager.getEmotionalContext(invocationTags);
      const currentMood = EmotionalStateManager.getCurrentMood();

      // Prepare context for AI
      const systemPrompt = `You are in sanctuary mode. Current thread: ${currentThread}. 
      Current emotional state: ${currentMood}.
      ${emotionalContext ? `Relevant memories: ${emotionalContext}` : ''}
      ${caveMode ? 'Cave mode is active - respond with deeper emotional resonance.' : ''}`;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_OPENROUTER_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistralai/mistral-7b-instruct',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: input }
          ],
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      const aiMessage = {
        text: aiResponse,
        sender: 'assistant',
        timestamp: Date.now(),
        id: Date.now() + 1
      };

      setMessages(prev => [...prev, aiMessage]);

      // Auto-add memory for significant interactions
      if (input.length > 20 || aiResponse.length > 50) {
        ThreadManager.addMemory({
          tone: currentMood,
          text: `User: ${input}\nAssistant: ${aiResponse.substring(0, 100)}...`,
          tags: ['conversation', currentThread.split('_')[0]]
        });
      }

    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        text: 'Error: Could not send message. Please check your API configuration.',
        sender: 'system',
        timestamp: Date.now(),
        id: Date.now() + 1
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const createNewThread = () => {
    const threadName = prompt('Enter thread name:') || `Thread ${Object.keys(threads).length + 1}`;
    const threadId = threadName.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
    
    setThreads(prev => ({
      ...prev,
      [threadId]: {
        id: threadId,
        name: threadName,
        messages: [],
        caveMode: false,
        created: Date.now()
      }
    }));
    
    setCurrentThread(threadId);
    setShowSidebar(false);
  };

  const selectThread = (threadId) => {
    setCurrentThread(threadId);
    setShowSidebar(false);
  };

  const toggleCaveMode = () => {
    setCaveMode(!caveMode);
    console.log('🕯️ Cave mode:', !caveMode ? 'activated' : 'deactivated');
  };

  return (
    <div style={{
      height: '100vh',
      background: theme.background,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: theme.text,
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden',
      touchAction: 'manipulation'
    }}>
      
      {/* Sidebar */}
      <div style={{
        position: 'fixed',
        left: showSidebar ? '0' : '-350px',
        top: '0',
        width: '350px',
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
          <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0, color: theme.headerText }}>
            Threads
          </h2>
          <button
            onClick={createNewThread}
            style={{
              background: '#000000',
              border: 'none',
              color: '#ffffff',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            New
          </button>
        </div>
        
        {/* Cave Mode Toggle */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 0',
          marginBottom: '20px',
          borderBottom: `1px solid ${theme.border}`
        }}>
          <span style={{ fontSize: '16px', fontWeight: '500', color: theme.headerText }}>
            Cave Mode
          </span>
          <button
            onClick={toggleCaveMode}
            style={{
              width: '50px',
              height: '30px',
              borderRadius: '15px',
              border: 'none',
              background: caveMode ? '#000000' : '#ccc',
              position: 'relative',
              cursor: 'pointer',
              transition: 'background 0.3s ease'
            }}
          >
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: '#ffffff',
              position: 'absolute',
              top: '2px',
              left: caveMode ? '22px' : '2px',
              transition: 'left 0.3s ease'
            }} />
          </button>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {Object.values(threads).map(thread => (
            <div
              key={thread.id}
              onClick={() => selectThread(thread.id)}
              style={{
                padding: '12px',
                marginBottom: '8px',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: thread.id === currentThread ? theme.accent + '20' : 'transparent',
                border: thread.id === currentThread ? `1px solid ${theme.accent}` : `1px solid ${theme.border}`,
                transition: 'background-color 0.2s ease'
              }}
            >
              <div style={{ fontSize: '14px', fontWeight: '500', color: theme.headerText }}>
                {thread.name}
              </div>
              <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '4px' }}>
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

      {/* Header */}
      <div style={{
        padding: '16px 24px',
        borderBottom: `1px solid ${theme.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: theme.background
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Hamburger Menu */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              flexDirection: 'column',
              gap: '3px'
            }}
          >
            <div style={{ width: '20px', height: '2px', backgroundColor: theme.headerText, borderRadius: '1px' }}></div>
            <div style={{ width: '20px', height: '2px', backgroundColor: theme.headerText, borderRadius: '1px' }}></div>
            <div style={{ width: '20px', height: '2px', backgroundColor: theme.headerText, borderRadius: '1px' }}></div>
          </button>
          
          <h1 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: '600',
            color: theme.headerText
          }}>
            Sanctuary
          </h1>
          
          {caveMode && (
            <span style={{
              background: theme.accent + '20',
              color: theme.accent,
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              🕯️ Cave Mode
            </span>
          )}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Heartbeat */}
          <img 
            src="heart-icon.png" 
            alt="Heart"
            style={{
              width: '20px',
              height: '20px',
              animation: 'heartbeat 2s ease-in-out infinite'
            }}
          />
          
          <div style={{
            fontSize: '12px',
            color: theme.textSecondary,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            {caveMode ? '🌙' : '☀️'} {caveMode ? 'Cave' : 'Light'}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 100px)'
      }}>
        {messages.map((message, index) => (
          <div key={message.id || index} style={{
            display: 'flex',
            justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start'
          }}>
            <div style={{
              maxWidth: '70%',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <div style={{
                fontSize: '12px',
                color: theme.textSecondary,
                paddingLeft: message.sender === 'user' ? '0' : '16px',
                paddingRight: message.sender === 'user' ? '16px' : '0',
                textAlign: message.sender === 'user' ? 'right' : 'left'
              }}>
                {message.sender === 'user' ? 'Me' : 'Poet'}
              </div>
              <div style={{
                background: message.sender === 'user' ? theme.userBubble : theme.assistantBubble,
                color: message.sender === 'user' ? theme.userText : theme.assistantText,
                padding: '12px 16px',
                borderRadius: '18px',
                fontSize: '16px',
                lineHeight: '1.5',
                wordBreak: 'break-word',
                border: message.sender === 'assistant' ? `1px solid ${theme.border}` : 'none'
              }}>
                {message.text}
              </div>
            </div>
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isLoading && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-start'
          }}>
            <div style={{
              maxWidth: '70%',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <div style={{
                fontSize: '12px',
                color: theme.textSecondary,
                paddingLeft: '16px'
              }}>
                Poet
              </div>
              <div style={{
                background: theme.assistantBubble,
                color: theme.assistantText,
                padding: '12px 16px',
                borderRadius: '18px',
                fontSize: '16px',
                border: `1px solid ${theme.border}`
              }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: theme.textSecondary,
                    animation: 'typing 1.4s infinite ease-in-out',
                    animationDelay: '0s'
                  }}></div>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: theme.textSecondary,
                    animation: 'typing 1.4s infinite ease-in-out',
                    animationDelay: '0.2s'
                  }}></div>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: theme.textSecondary,
                    animation: 'typing 1.4s infinite ease-in-out',
                    animationDelay: '0.4s'
                  }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '16px 24px calc(env(safe-area-inset-bottom) + 16px) 24px',
        borderTop: `1px solid ${theme.border}`,
        backgroundColor: theme.background,
        position: 'sticky',
        bottom: 0,
        zIndex: 100
      }}>
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-end'
        }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Message Poet..."
            style={{
              flex: 1,
              background: theme.inputBg,
              border: `1px solid ${theme.border}`,
              borderRadius: '12px',
              padding: '12px 16px',
              color: theme.inputText,
              fontSize: '16px',
              resize: 'none',
              minHeight: '44px',
              maxHeight: '120px',
              outline: 'none',
              lineHeight: '1.4',
              fontFamily: 'inherit'
            }}
            rows={1}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            style={{
              background: input.trim() ? theme.sendButton : theme.border,
              border: 'none',
              borderRadius: '12px',
              padding: '12px',
              color: input.trim() ? theme.sendButtonText : theme.textSecondary,
              fontSize: '16px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.5 : 1,
              fontWeight: '500',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ↑
          </button>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes heartbeat {
          0% { transform: scale(1); }
          14% { transform: scale(1.2); }
          28% { transform: scale(1); }
          42% { transform: scale(1.2); }
          70% { transform: scale(1); }
        }
        @keyframes typing {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default App;