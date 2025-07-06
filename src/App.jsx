import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ChatWindow from './components/ChatWindow';
import WhisperPage from './WhisperPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ChatWindow userName="Low Tide" />} />
        <Route path="/whisper" element={<WhisperPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;




