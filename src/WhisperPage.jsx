import React from 'react';
import ChatWindow from './components/ChatWindow';

export default function WhisperPage() {
  return (
    <div>
      <h1 style={{ color: 'teal', textAlign: 'center' }}>🜂 Whisper Mode 🜂</h1>
      <ChatWindow userName="Low Tide" />
    </div>
  );
}

