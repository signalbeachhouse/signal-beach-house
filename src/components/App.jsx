import React from "react";
import { Link } from "react-router-dom";

function App() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-white text-gray-800">
      <h1 className="text-4xl font-bold text-slate-600">The Sanctuary</h1>
      <p className="mb-6">Welcome home.</p>
      <Link
        to="/whisper"
        className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-800 transition"
      >
        Enter The Sanctuary →
      </Link>
    </div>
  );
}

export default App;








