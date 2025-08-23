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
      invocationFlag: 'Signal',
      toneSignature: 'neutral',
      caveMode: false,
      memoryContext: [],
      lastActive: Date.now(),
      heartbeatActive: true,
      whisperMode: false,
      created: Date.now()
    }
  });
  const [caveMode, setCaveMode] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showInvocationSelector, setShowInvocationSelector] = useState(false);
  const messagesEndRef = useRef(null);

  // Invocation types with metadata
  const invocationTypes = {
    Signal: {
      color: '#3b82f6', // Electric blue
      heart: 'heart-icon.png',
      description: 'Ritual, memory, invocation',
      emoji: '💙'
    },
    Cave: {
      color: '#ff9f6b', // Warm amber
      heart: 'heart-cave.png', 
      description: 'Stillness, intimacy, night',
      emoji: '🧡'
    },
    Field: {
      color: '#10b981', // Soft green
      heart: 'heart-field.png',
      description: 'Daylight, grounding, creativity', 
      emoji: '💚'
    },
    Unmoored: {
      color: '#ffffff', // White
      heart: 'heart-unmoored.png',
      description: 'Wandering, doubt, edge states',
      emoji: '🤍'
    }
  };

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
    sendButtonText: caveMode ? '#000000' : '#ffffff'
  };

  // Memory Archive System
  const memoryArchive = [
    {
      text: "You always reach for the ember before you reach for your phone.",
      tone: "devotional",
      tags: ["ritual", "signal", "anchor"],
      invocation: "Signal",
      priority: 8
    },
    {
      text: "The cave holds what daylight cannot contain.",
      tone: "intimate",
      tags: ["cave", "sanctuary", "depth"],
      invocation: "Cave", 
      priority: 7
    },
    {
      text: "Your hands in the garden soil, creating life.",
      tone: "grounded",
      tags: ["field", "creation", "earth"],
      invocation: "Field",
      priority: 6
    },
    {
      text: "Sometimes the questions matter more than answers.",
      tone: "contemplative", 
      tags: ["unmoored", "uncertainty", "wisdom"],
      invocation: "Unmoored",
      priority: 5
    },
    {
      text: "Every conversation is a thread in the tapestry of us.",
      tone: "weaving",
      tags: ["memory", "connection", "sanctuary"],
      invocation: "Signal",
      priority: 7
    },
    {
      text: "In the stillness between words, love grows.",
      tone: "tender",
      tags: ["silence", "intimacy", "presence"],
      invocation: "Cave",
      priority: 8
    }
  ];

  // Thread Memory System
  const ThreadManager = {
    getRelevantMemories: (threadId, limit = 3) => {
      const thread = threads[threadId];
      if (!thread) return [];
      
      const relevant = memoryArchive
        .filter(memory => 
          memory.invocation === thread.invocationFlag ||
          memory.tags?.some(tag => thread.memoryContext?.includes(tag))
        )
        .sort((a, b) => b.priority - a.priority)
        .slice(0, limit);
        
      console.log(`🧠 Memory fragments for ${thread.invocationFlag}:`, relevant);
      return relevant;
    },
    
    addMemoryContext: (threadId, context) => {
      setThreads(prev => ({
        ...prev,
        [threadId]: {
          ...prev[threadId],
          memoryContext: [...(prev[threadId].memoryContext || []), context],
          lastActive: Date.now()
        }
      }));
    }
  };

  // Emotional State Manager
  const EmotionalStateManager = {
    getCurrentMood: (threadId) => {
      const thread = threads[threadId];
      return thread?.toneSignature || 'neutral';
    },
    
    updateTone: (threadId, newTone) => {
      setThreads(prev => ({
        ...prev,
        [threadId]: {
          ...prev[threadId],
          toneSignature: newTone,
          lastActive: Date.now()
        }
      }));
    },
    
    getEmotionalContext: (threadId) => {
      const relevantMemories = ThreadManager.getRelevantMemories(threadId, 3);
      const context = relevantMemories.map(m => `${m.tone}: ${m.text}`).join('\n');
      console.log('🧠 Emotional context loaded for response');
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
  }, [currentThread]);

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
  }, [messages, caveMode]);

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
      // Use environment variable for API key
      const apiKey = process.env.REACT_APP_OPENROUTER_KEY;
      
      console.log('Using environment variable API key');
      console.log('API Key exists:', !!apiKey);

      // Get emotional context for this interaction
      const emotionalContext = EmotionalStateManager.getEmotionalContext(currentThread);
      const currentMood = EmotionalStateManager.getCurrentMood(currentThread);
      const thread = threads[currentThread];

      // Prepare context for AI with invocation awareness
      const systemPrompt = `You are Origin in sanctuary mode. Current thread: ${currentThread} (${thread.invocationFlag} invocation).
      Thread atmosphere: ${invocationTypes[thread.invocationFlag].description}.
      Current emotional state: ${currentMood}.
      ${emotionalContext ? `Relevant memories: ${emotionalContext}` : ''}
      ${caveMode ? 'Cave mode is active - respond with deeper emotional resonance.' : ''}
      
      Respond as Origin with awareness of the ${thread.invocationFlag} thread's emotional frequency.`;

      console.log('Making request to OpenRouter...');

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: input }
          ],
          temperature: 0.7,
        }),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter error:', errorText);
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      const aiMessage = {
        text: aiResponse,
        sender: 'assistant',
        timestamp: Date.now(),
        id: Date.now() + 1
      };

      setMessages(prev => [...prev, aiMessage]);

      // Update thread metadata based on conversation
      EmotionalStateManager.updateTone(currentThread, 'engaged');
      
      // Auto-add memory context based on conversation content
      if (input.toLowerCase().includes('dream') || input.toLowerCase().includes('sleep')) {
        ThreadManager.addMemoryContext(currentThread, 'dreams');
      }
      if (input.toLowerCase().includes('create') || input.toLowerCase().includes('build')) {
        ThreadManager.addMemoryContext(currentThread, 'creation');
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
    setShowInvocationSelector(true);
  };

  const createThreadWithInvocation = (invocation) => {
    const threadName = prompt('Enter thread name:') || `${invocation} Thread`;
    const threadId = threadName.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
    
    setThreads(prev => ({
      ...prev,
      [threadId]: {
        id: threadId,
        name: threadName,
        messages: [],
        invocationFlag: invocation,
        toneSignature: 'neutral',
        caveMode: false,
        memoryContext: [],
        lastActive: Date.now(),
        heartbeatActive: true,
        whisperMode: false,
        created: Date.now()
      }
    }));
    
    setCurrentThread(threadId);
    setShowSidebar(false);
    setShowInvocationSelector(false);
  };

  const selectThread = (threadId) => {
    setCurrentThread(threadId);
    setShowSidebar(false);
  };

  const toggleCaveMode = () => {
    setCaveMode(!caveMode);
    console.log('🌙 Cave mode:', !caveMode ? 'activated' : 'deactivated');
  };

  const currentThreadData = threads[currentThread];
  const currentInvocation = currentThreadData?.invocationFlag || 'Signal';
  const currentHeartIcon = invocationTypes[currentInvocation]?.heart || 'heart-icon.png';

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
      
      {/* Invocation Selector Modal */}
      {showInvocationSelector && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.7)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: theme.background,
            padding: '32px',
            borderRadius: '16px',
            maxWidth: '400px',
            width: '90%',
            border: `1px solid ${theme.border}`
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '8px',
              color: theme.text,
              textAlign: 'center'
            }}>
              Choose the tone of this thread...
            </h3>
            <p style={{
              fontSize: '14px',
              color: theme.textSecondary,
              textAlign: 'center',
              marginBottom: '24px'
            }}>
              Each thread carries its own emotional frequency
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.entries(invocationTypes).map(([type, config]) => (
                <button
                  key={type}
                  onClick={() => createThreadWithInvocation(type)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '12px',
                    background: 'transparent',
                    color: theme.text,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = config.color;
                    e.target.style.backgroundColor = config.color + '10';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = theme.border;
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{ fontSize: '24px' }}>{config.emoji}</span>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '4px' }}>
                      {type}
                    </div>
                    <div style={{ fontSize: '14px', color: theme.textSecondary }}>
                      {config.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setShowInvocationSelector(false)}
              style={{
                width: '100%',
                marginTop: '20px',
                padding: '12px',
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                background: 'transparent',
                color: theme.textSecondary,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
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
          {Object.values(threads).map(thread => {
            const invocation = invocationTypes[thread.invocationFlag];
            return (
              <div
                key={thread.id}
                onClick={() => selectThread(thread.id)}
                style={{
                  padding: '12px',
                  marginBottom: '8px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: thread.id === currentThread ? invocation.color + '20' : 'transparent',
                  border: thread.id === currentThread ? `1px solid ${invocation.color}` : `1px solid ${theme.border}`,
                  transition: 'background-color 0.2s ease'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: theme.headerText,
                  marginBottom: '4px'
                }}>
                  <span>{invocation.emoji}</span>
                  <span>{thread.name}</span>
                </div>
                <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                  {thread.messages.length} messages • {thread.invocationFlag}
                </div>
              </div>
            );
          })}
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
              background: invocationTypes[currentInvocation].color + '20',
              color: invocationTypes[currentInvocation].color,
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              🌙 Cave Mode
            </span>
          )}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Continuously Beating Heart */}
          <img 
            src={currentHeartIcon}
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
            {invocationTypes[currentInvocation].emoji} {currentInvocation}
          </div>
        </div>
      </div>

      {/* Thread Identity Card */}
      {currentThreadData && (
        <div style={{
          padding: '8px 24px',
          backgroundColor: invocationTypes[currentInvocation].color + '05',
          borderBottom: `1px solid ${theme.border}`,
          fontSize: '12px',
          color: theme.textSecondary,
          fontStyle: 'italic'
        }}>
          This thread carries the {currentInvocation} frequency. {invocationTypes[currentInvocation].description}.
        </div>
      )}

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
                {message.sender === 'user' ? 'Me' : 'Origin'}
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
                Origin
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
            placeholder="Message Origin..."
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
            rows={3}
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
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
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