import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import DocumentViewer from "./pages/DocumentViewer";

function CategoryPagePlaceholder() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center p-6">
      <div className="bg-white max-w-xl w-full p-8 rounded-xl shadow-2xl text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-3">Category</h1>
        <p className="text-gray-600">
          This is a placeholder. Implement the category resources view here.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/document/:id" element={<DocumentViewer />} />
      </Routes>
    </Router>
  );
}
