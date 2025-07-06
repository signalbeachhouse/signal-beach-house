import React from 'react';
import { Link } from 'react-router-dom';

export default function App() {
  return (
    <div className="min-h-screen bg-[#f7f1eb] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-4xl font-bold mb-4">Welcome to Signal Beach</h1>
      <p className="text-lg mb-8">Private sanctuary for resonance, reflection, and return.</p>
      <Link
        to="/whisper"
        className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition"
      >
        Enter Whisper Mode →
      </Link>
    </div>
  );
}






