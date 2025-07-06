import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import App from './App.jsx';
import WhisperPage from './WhisperPage.jsx';
import './styles.css';

console.log("🌊 main.jsx loaded");

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/whisper" element={<WhisperPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

