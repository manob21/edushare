import React, { useState, useEffect } from "react";

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

const API_URL = 'http://localhost:5000/api';

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [userUploads, setUserUploads] = useState(0);
  const [userDownloads, setUserDownloads] = useState(0);
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
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState(null);

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

  // Fetch resources on component mount
  useEffect(() => {
    fetchResources();
  }, [selectedSubject]);

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchCurrentUser();
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        setUser({
          name: data.user.name,
          email: data.user.email,
          avatar: null,
        });
        setUserUploads(data.user.uploadCount);
        setUserDownloads(data.user.downloadCount);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchResources = async () => {
    try {
      setLoading(true);
      const endpoint = selectedSubject 
        ? `${API_URL}/resource/subject/${selectedSubject}`
        : `${API_URL}/resource/all`;
      
      const response = await fetch(endpoint);
      const data = await response.json();

      if (response.ok) {
        setResources(data.resources);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (resourceId) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      setAuthMode("login");
      return;
    }
    
    if (!canDownload) {
      alert(`Upload ${uploadsNeeded} more document${uploadsNeeded > 1 ? 's' : ''} to unlock downloads!`);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Create a temporary link to trigger download
      const response = await fetch(`${API_URL}/resource/download/${resourceId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Get the filename from Content-Disposition header
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `resource-${resourceId}`;
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }

        // Convert response to blob and trigger download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        // Refresh user data to update download count
        await fetchCurrentUser();
        
        alert('Download started successfully!');
      } else {
        const data = await response.json();
        alert(data.message || 'Download failed');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Error downloading resource');
    }
  };

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
      
      // Update user upload count
      setUserUploads(data.user.uploadCount);
      setUserDownloads(data.user.downloadCount);
      
      // Refresh resources list
      fetchResources();
    } catch (error) {
      setUploading(false);
      console.error('Upload error:', error);
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

      localStorage.setItem('token', data.token);
      
      setUser({
        name: data.user.name,
        email: data.user.email,
        avatar: null,
      });
      setUserUploads(data.user.uploadCount);
      setUserDownloads(data.user.downloadCount);
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

      localStorage.setItem('token', data.token);
      
      setUser({
        name: data.user.name,
        email: data.user.email,
        avatar: null,
      });
      setUserUploads(data.user.uploadCount);
      setUserDownloads(data.user.downloadCount);
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
    setUserDownloads(0);
  };

  const handleSubjectFilter = (subject) => {
    if (selectedSubject === subject) {
      setSelectedSubject(null);
    } else {
      setSelectedSubject(subject);
    }
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
        {/* Left Sidebar - Profile */}
        {isAuthenticated && (
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
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
                    <span className="font-semibold">{userDownloads}</span>
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
                  onClick={() => handleSubjectFilter(subject)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedSubject === subject
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 hover:bg-indigo-100 hover:text-indigo-700 text-gray-700"
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
          </section>

          {/* Resources List */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedSubject ? `${selectedSubject} Resources` : 'All Study Materials'}
              </h2>
              <span className="text-sm text-gray-500">
                {resources.length} resources found
              </span>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading resources...</p>
              </div>
            ) : resources.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No resources found. Be the first to upload!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {resources
                  .filter(resource => 
                    query === "" || 
                    resource.title.toLowerCase().includes(query.toLowerCase()) ||
                    resource.description.toLowerCase().includes(query.toLowerCase())
                  )
                  .map((resource) => (
                    <div
                      key={resource._id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-2xl">
                          📄
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {resource.title}
                          </h3>
                          <p className="text-sm text-gray-500">{resource.subject}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {resource.description.substring(0, 80)}
                            {resource.description.length > 80 ? '...' : ''}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Uploaded by {resource.uploadedBy?.name || 'Unknown'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownload(resource._id)}
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
            )}

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

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Upload Resource</h2>
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={uploadForm.title}
                  onChange={(e) =>
                    setUploadForm({ ...uploadForm, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Resource Title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select
                  required
                  value={uploadForm.subject}
                  onChange={(e) =>
                    setUploadForm({ ...uploadForm, subject: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  required
                  value={uploadForm.description}
                  onChange={(e) =>
                    setUploadForm({ ...uploadForm, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Brief description"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
                <input
                  type="file"
                  required
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                />
                {uploadForm.file && (
                  <p className="text-xs text-gray-500 mt-1">
                    Selected: {uploadForm.file.name}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-medium transition-colors disabled:bg-gray-400"
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
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
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