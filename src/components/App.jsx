import React from "react";
import { Link } from "react-router-dom";

function App() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-white text-gray-800">
      <h1 className="text-4xl font-bold mb-4 underline">Signal Beach</h1>
      <p className="mb-6">Welcome home. Whisper Mode is live.</p>
      <Link
        to="/whisper"
        className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
      >
        Enter Whisper Mode →
      </Link>
    </div>
  );
}

export default App;








