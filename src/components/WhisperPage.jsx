// src/components/WhisperPage.jsx
import React from 'react';
import ChatWindow from './ChatWindow.jsx';

export default function WhisperPage() {
  return (
    <div className="min-h-screen bg-[#f7f1eb] flex flex-col items-center justify-start p-4">
      <h1 className="text-teal-700 text-2xl font-semibold mb-4">
        Whisper Mode
      </h1>
      <ChatWindow />
    </div>
  );
}



