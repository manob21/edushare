import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const SUBJECTS = [
  "Computer Science",
  "Mathematics",
  "Physics",
  "Chemistry",
  "English",
  "Biology",
  "History",
  "Economics",
];

const POPULAR_MATERIALS = [
  {
    id: 1,
    title: "Data Structures & Algorithms",
    subject: "Computer Science",
    uploads: 234,
  },
  {
    id: 2,
    title: "Calculus Notes - Chapter 1-5",
    subject: "Mathematics",
    uploads: 189,
  },
  {
    id: 3,
    title: "Organic Chemistry Complete Guide",
    subject: "Chemistry",
    uploads: 156,
  },
  {
    id: 4,
    title: "Quantum Physics Lecture Notes",
    subject: "Physics",
    uploads: 142,
  },
];

const API_URL = 'http://localhost:5000/api';

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // 'login' or 'signup'
  const [userUploads, setUserUploads] = useState(0);
  const [user, setUser] = useState({
    name: "",
    email: "",
    avatar: null,
  });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: "",
    subject: "",
    description: "",
    file: null,
  });
  const [uploading, setUploading] = useState(false);

  // Form states
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const canDownload = userUploads >= 3;
  const uploadsNeeded = 3 - userUploads;

  const handleDownload = (materialId) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      setAuthMode("login");
      return;
    }
    
    if (!canDownload) {
      alert(`Upload ${uploadsNeeded} more document${uploadsNeeded > 1 ? 's' : ''} to unlock downloads!`);
      return;
    }
    
    console.log(`Downloading material ${materialId}`);
  };
  // Show upload modal only if authenticated
  const handleUploadClick = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      setAuthMode("login");
      return;
    }
    setShowUploadModal(true);
  };

  const handleFileChange = (e) => {
    setUploadForm({ ...uploadForm, file: e.target.files[0] });
  };

  // Handle upload form submit
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("title", uploadForm.title);
      formData.append("subject", uploadForm.subject);
      formData.append("description", uploadForm.description);
      formData.append("file", uploadForm.file);

      const response = await fetch(`${API_URL}/resource/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      setUploading(false);

      if (!response.ok) {
        alert(data.message || "Upload failed");
        return;
      }

      alert("Resource uploaded successfully!");
      setShowUploadModal(false);
      setUploadForm({ title: "", subject: "", description: "", file: null });
      // Optionally, refresh user uploads count here
    } catch (error) {
      setUploading(false);
      alert("Error uploading resource");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginForm),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Login failed');
        return;
      }

      // Save token to localStorage
      localStorage.setItem('token', data.token);
      
      setUser({
        name: data.user.name,
        email: data.user.email,
        avatar: null,
      });
      setUserUploads(data.user.uploadCount);
      setIsAuthenticated(true);
      setShowAuthModal(false);
      setLoginForm({ email: "", password: "" });
      
      alert('Login successful!');
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (signupForm.password !== signupForm.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: signupForm.name,
          email: signupForm.email,
          password: signupForm.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Signup failed');
        return;
      }

      // Save token to localStorage
      localStorage.setItem('token', data.token);
      
      setUser({
        name: data.user.name,
        email: data.user.email,
        avatar: null,
      });
      setUserUploads(data.user.uploadCount);
      setIsAuthenticated(true);
      setShowAuthModal(false);
      setSignupForm({ name: "", email: "", password: "", confirmPassword: "" });
      
      alert('Account created successfully!');
    } catch (error) {
      console.error('Signup error:', error);
      alert('An error occurred during signup');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser({ name: "", email: "", avatar: null });
    setUserUploads(0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📚</span>
            <h1 className="text-indigo-600 text-2xl font-bold">Student Doc</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleUploadClick}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <span>⬆️</span>
              Upload Document
            </button>
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Profile (Only visible when authenticated) */}
        {isAuthenticated && (
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              {/* Profile Avatar */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center text-white text-4xl mb-3">
                  👤
                </div>
                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>

              {/* Upload Status */}
              <div className="bg-indigo-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Uploads</span>
                  <span className="text-indigo-600">⬆️</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-indigo-600">{userUploads}</span>
                  <span className="text-sm text-gray-500">/ 3 required</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((userUploads / 3) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Download Status */}
              <div className="bg-orange-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Download Status</span>
                  <span className="text-orange-600">⬇️</span>
                </div>
                {canDownload ? (
                  <p className="text-sm text-green-600 font-medium">✓ Downloads unlocked!</p>
                ) : (
                  <p className="text-sm text-orange-600 font-medium">
                    Upload {uploadsNeeded} more to unlock
                  </p>
                )}
              </div>

              {/* Quick Stats */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Downloads:</span>
                    <span className="font-semibold">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Documents Shared:</span>
                    <span className="font-semibold">{userUploads}</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className={isAuthenticated ? "lg:col-span-3" : "lg:col-span-4"}>
          {/* Search Section */}
          <section className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Find Study Materials
            </h2>
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for notes, books, assignments..."
                className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                🔍
              </button>
            </div>

            {/* Subject Tags */}
            <div className="flex flex-wrap gap-2 mt-4">
              {SUBJECTS.map((subject) => (
                <button
                  key={subject}
                  className="px-4 py-2 rounded-full bg-gray-100 hover:bg-indigo-100 hover:text-indigo-700 text-sm font-medium text-gray-700 transition-colors"
                >
                  {subject}
                </button>
              ))}
            </div>
          </section>

          {/* Popular Materials */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Popular Study Materials
            </h2>
            <div className="space-y-4">
              {POPULAR_MATERIALS.map((material) => (
                <div
                  key={material.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-2xl">
                      📄
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {material.title}
                      </h3>
                      <p className="text-sm text-gray-500">{material.subject}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {material.uploads} uploads
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(material.id)}
                    disabled={isAuthenticated && !canDownload}
                    className={`px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all ${
                      !isAuthenticated || canDownload
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-50"
                    }`}
                    title={
                      !isAuthenticated 
                        ? "Login to download" 
                        : !canDownload 
                        ? `Upload ${uploadsNeeded} more documents to unlock` 
                        : ""
                    }
                  >
                    <span>⬇️</span>
                    Download
                  </button>
                </div>
              ))}
            </div>

            {isAuthenticated && !canDownload && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  💡 <strong>Tip:</strong> Upload {uploadsNeeded} more document{uploadsNeeded > 1 ? 's' : ''} to unlock downloads and access all study materials!
                </p>
              </div>
            )}

            {!isAuthenticated && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 <strong>Note:</strong> Please login or sign up to upload and download study materials!
                </p>
              </div>
            )}
          </section>
        </main>
      </div>
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold mb-4">Upload Resource</h2>
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={uploadForm.title}
                  onChange={(e) =>
                    setUploadForm({ ...uploadForm, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Resource Title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <select
                  required
                  value={uploadForm.subject}
                  onChange={(e) =>
                    setUploadForm({ ...uploadForm, subject: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Select Subject</option>
                  {SUBJECTS.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  required
                  value={uploadForm.description}
                  onChange={(e) =>
                    setUploadForm({ ...uploadForm, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Brief description"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">File</label>
                <input
                  type="file"
                  required
                  onChange={handleFileChange}
                  className="w-full"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                />
              </div>
              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-medium transition-colors"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {authMode === "login" ? "Welcome Back!" : "Create Account"}
              </h2>
              <p className="text-gray-600">
                {authMode === "login"
                  ? "Login to access all features"
                  : "Sign up to start sharing and downloading materials"}
              </p>
            </div>

            {/* Toggle Buttons */}
            <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setAuthMode("login")}
                className={`flex-1 py-2 rounded-md font-medium transition-all ${
                  authMode === "login"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-600"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setAuthMode("signup")}
                className={`flex-1 py-2 rounded-md font-medium transition-all ${
                  authMode === "signup"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-600"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Login Form */}
            {authMode === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="your.email@university.edu"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter your password"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-medium transition-colors"
                >
                  Login
                </button>
              </form>
            )}

            {/* Signup Form */}
            {authMode === "signup" && (
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={signupForm.name}
                    onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="your.email@university.edu"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Create a password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={signupForm.confirmPassword}
                    onChange={(e) =>
                      setSignupForm({ ...signupForm, confirmPassword: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Confirm your password"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-medium transition-colors"
                >
                  Sign Up
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}