import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './components/App.jsx';
import WhisperPage from './components/WhisperPage.jsx';
import './styles.css';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/whisper" element={<WhisperPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);



