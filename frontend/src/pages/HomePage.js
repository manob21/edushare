import React, { useState, useEffect, useCallback } from "react";
import DocumentViewer from './DocumentViewer';
import { Link, useNavigate } from 'react-router-dom';
import { getAllCategories, getLevelsForCategory, getSubjectsForLevel, getGroupsForLevel } from '../config/categoryConfig';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
    description: "",
    file: null,
    category: "",
    level: "",
    group: "",
    subjectCategory: "",
    topic: ""
  });
  const [uploading, setUploading] = useState(false);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New hierarchical navigation states
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documentListType, setDocumentListType] = useState('');
  const [userDocuments, setUserDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const navigate = useNavigate();

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const canDownload = userUploads >= 3;
  const uploadsNeeded = 3 - userUploads;

  const categories = getAllCategories();

  // Fetch resources based on filters
  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      let endpoint = `${API_URL}/resource/all`;
      const params = new URLSearchParams();
      
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedLevel) params.append('level', selectedLevel);
      if (selectedGroup) params.append('group', selectedGroup);
      if (selectedSubject) params.append('subject', selectedSubject);
      
      if (params.toString()) {
        endpoint = `${API_URL}/resource/filter?${params.toString()}`;
      }

      const response = await fetch(endpoint);
      const data = await response.json();
      if (response.ok) setResources(data.resources);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedLevel, selectedGroup, selectedSubject]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

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
        headers: { 'Authorization': `Bearer ${token}` }
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

  const fetchUserDocuments = async (type) => {
    setLoadingDocuments(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = type === 'uploaded' 
        ? `${API_URL}/resource/my-uploads` 
        : `${API_URL}/resource/my-downloads`;
      
      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setUserDocuments(data.resources);
      } else {
        alert(data.message || 'Failed to fetch documents');
      }
    } catch (error) {
      console.error('Error fetching user documents:', error);
      alert('Error fetching documents');
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleViewDocuments = (type) => {
    setDocumentListType(type);
    setShowDocumentModal(true);
    fetchUserDocuments(type);
  };

  const handleCloseDocumentModal = () => {
    setShowDocumentModal(false);
    setUserDocuments([]);
    setDocumentListType('');
  };

  const handleCategorySelect = (categoryKey, levelValue) => {
    setSelectedCategory(categoryKey);
    setSelectedLevel(levelValue);
    setSelectedGroup(null);
    setSelectedSubject(null);
    setHoveredCategory(null);
  };

  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
  };

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    setSelectedSubject(null);
  };

  const handleResetFilters = () => {
    setSelectedCategory(null);
    setSelectedLevel(null);
    setSelectedGroup(null);
    setSelectedSubject(null);
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
      const response = await fetch(`${API_URL}/resource/download/${resourceId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `resource-${resourceId}`;
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

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
      formData.append("description", uploadForm.description);
      formData.append("category", uploadForm.category);
      formData.append("level", uploadForm.level);
      if (uploadForm.group) formData.append("group", uploadForm.group);
      formData.append("subjectCategory", uploadForm.subjectCategory);
      if (uploadForm.topic) formData.append("topic", uploadForm.topic);
      formData.append("file", uploadForm.file);
      
      // For backward compatibility
      formData.append("subject", uploadForm.subjectCategory);

      const response = await fetch(`${API_URL}/resource/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
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
      setUploadForm({ 
        title: "", 
        description: "", 
        file: null, 
        category: "", 
        level: "", 
        group: "", 
        subjectCategory: "",
        topic: ""
      });
      
      setUserUploads(data.user?.uploadCount || userUploads + 1);
      await fetchResources();
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
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
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

  const handleAuthButtonClick = () => {
    setAuthMode("login");
    setShowAuthModal(true);
  };

  const handleOpenDocument = (resource) => {
    navigate(`/document/${resource._id}`);
  };

  // Get current level subjects
  const currentLevelSubjects = selectedCategory && selectedLevel 
    ? getSubjectsForLevel(selectedCategory, selectedLevel, selectedGroup)
    : [];

  // Get current level groups
  const currentLevelGroups = selectedCategory && selectedLevel 
    ? getGroupsForLevel(selectedCategory, selectedLevel)
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-icons-outlined text-indigo-600 text-4xl">school</span>
            <h1 className="text-2xl font-bold text-gray-900">eduShare</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleUploadClick}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <span>⬆️</span>
              Upload Document
            </button>
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={handleAuthButtonClick}
                className="text-indigo-600 hover:text-indigo-700 font-medium px-4 py-2 border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                Login / Sign Up
              </button>
            )}
          </div>
        </div>

        {/* Category Navigation Bar */}
        <div className="border-t border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center space-x-1 overflow-visible">
              {categories.map((category) => (
                <div
                  key={category.key}
                  className="relative group"
                  onMouseEnter={() => setHoveredCategory(category.key)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <button
                    className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === category.key
                        ? 'text-indigo-600 border-b-2 border-indigo-600'
                        : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
                    }`}
                  >
                    {category.display}
                  </button>

                  {/* Dropdown on hover */}
                  {hoveredCategory === category.key && (
                    <div className="absolute left-0 top-full mt-0 bg-white border border-gray-200 rounded-md shadow-lg min-w-[220px] max-h-[400px] overflow-y-auto z-[100]">
                      {getLevelsForCategory(category.key).map((level) => (
                        <button
                          key={level.value}
                          onClick={() => handleCategorySelect(category.key, level.value)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                        >
                          {level.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
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
              <div className="border-t pt-4 mb-4">
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

              {/* View Documents Buttons */}
              <div className="border-t pt-4 space-y-2">
                <button
                  onClick={() => handleViewDocuments('uploaded')}
                  className="w-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <span>📤</span>
                  View Uploaded Docs
                </button>
                <button
                  onClick={() => handleViewDocuments('downloaded')}
                  className="w-full bg-green-100 hover:bg-green-200 text-green-700 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  disabled={userDownloads === 0}
                >
                  <span>📥</span>
                  View Downloaded Docs
                </button>
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
            <div className="relative mb-4">
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

            {/* Current Selection Display */}
            {selectedCategory && selectedLevel && (
              <div className="bg-indigo-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-700">Current Selection:</h3>
                  <button
                    onClick={handleResetFilters}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Clear Filters
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-indigo-600 text-white rounded-full text-sm">
                    {selectedLevel}
                  </span>
                  {selectedGroup && (
                    <span className="px-3 py-1 bg-indigo-500 text-white rounded-full text-sm">
                      {selectedGroup} Group
                    </span>
                  )}
                  {selectedSubject && (
                    <span className="px-3 py-1 bg-indigo-400 text-white rounded-full text-sm">
                      {selectedSubject}
                    </span>
                  )}
                </div>

                {/* Show Groups if available */}
                {currentLevelGroups.length > 0 && !selectedGroup && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Select Group:</p>
                    <div className="flex flex-wrap gap-2">
                      {currentLevelGroups.map((group) => (
                        <button
                          key={group.value}
                          onClick={() => handleGroupSelect(group.value)}
                          className="px-4 py-2 bg-white border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors text-sm font-medium"
                        >
                          {group.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Show Subjects */}
                {currentLevelSubjects.length > 0 && (!currentLevelGroups.length || selectedGroup) && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Filter by Subject:</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedSubject(null)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          !selectedSubject
                            ? "bg-indigo-600 text-white"
                            : "bg-white border border-gray-300 text-gray-700 hover:border-indigo-600 hover:text-indigo-600"
                        }`}
                      >
                        All Subjects
                      </button>
                      {currentLevelSubjects.map((subject) => (
                        <button
                          key={subject}
                          onClick={() => handleSubjectSelect(subject)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            selectedSubject === subject
                              ? "bg-indigo-600 text-white"
                              : "bg-white border border-gray-300 text-gray-700 hover:border-indigo-600 hover:text-indigo-600"
                          }`}
                        >
                          {subject}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Resources List */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedLevel 
                  ? `${selectedLevel} ${selectedSubject ? `- ${selectedSubject}` : ''} Resources` 
                  : 'All Study Materials'}
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
                    (resource.description && resource.description.toLowerCase().includes(query.toLowerCase()))
                  )
                  .map((resource) => (
                    <div
                      key={resource._id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors cursor-pointer"
                      onClick={() => handleOpenDocument(resource)}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-2xl">
                          📄
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{resource.title}</h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {resource.level && (
                              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                                {resource.level}
                              </span>
                            )}
                            {resource.group && (
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                                {resource.group}
                              </span>
                            )}
                            {resource.subjectCategory && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                {resource.subjectCategory}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {resource.description?.substring(0, 80)}
                            {resource.description?.length > 80 ? '...' : ''}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Uploaded by {resource.uploadedBy?.name || 'Unknown'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDownload(resource._id); }}
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

      {/* Document List Modal */}
      {showDocumentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {documentListType === 'uploaded' ? '📤 My Uploaded Documents' : '📥 My Downloaded Documents'}
              </h2>
              <button
                onClick={handleCloseDocumentModal}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loadingDocuments ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading documents...</p>
                </div>
              ) : userDocuments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    {documentListType === 'uploaded' 
                      ? 'You haven\'t uploaded any documents yet.' 
                      : 'You haven\'t downloaded any documents yet.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userDocuments.map((doc) => (
                    <div
                      key={doc._id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-2xl">
                          📄
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{doc.title}</h3>
                          <p className="text-sm text-gray-500">{doc.subjectCategory || doc.subject}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {doc.description?.substring(0, 60)}
                            {doc.description?.length > 60 ? '...' : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={handleCloseDocumentModal}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2.5 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal - Updated with new fields */}
      {showUploadModal && <UploadModal 
        uploadForm={uploadForm}
        setUploadForm={setUploadForm}
        handleUploadSubmit={handleUploadSubmit}
        handleFileChange={handleFileChange}
        uploading={uploading}
        setShowUploadModal={setShowUploadModal}
      />}

      {/* Auth Modal */}
      {showAuthModal && <AuthModal 
        authMode={authMode}
        setAuthMode={setAuthMode}
        loginForm={loginForm}
        setLoginForm={setLoginForm}
        signupForm={signupForm}
        setSignupForm={setSignupForm}
        handleLogin={handleLogin}
        handleSignup={handleSignup}
        setShowAuthModal={setShowAuthModal}
      />}

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
          onDownload={handleDownload}
          isAuthenticated={isAuthenticated}
          canDownload={canDownload}
        />
      )}
    </div>
  );
}

// Upload Modal Component
function UploadModal({ uploadForm, setUploadForm, handleUploadSubmit, handleFileChange, uploading, setShowUploadModal }) {
  const categories = getAllCategories();
  const levels = uploadForm.category ? getLevelsForCategory(uploadForm.category) : [];
  const groups = uploadForm.category && uploadForm.level ? getGroupsForLevel(uploadForm.category, uploadForm.level) : [];
  const subjects = uploadForm.category && uploadForm.level ? getSubjectsForLevel(uploadForm.category, uploadForm.level, uploadForm.group) : [];

  return (
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              required
              value={uploadForm.title}
              onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Resource Title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select
              required
              value={uploadForm.category}
              onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value, level: '', group: '', subjectCategory: '', topic: '' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.key} value={cat.key}>
                  {cat.display}
                </option>
              ))}
            </select>
          </div>

          {uploadForm.category && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level/Class *</label>
              <select
                required
                value={uploadForm.level}
                onChange={(e) => setUploadForm({ ...uploadForm, level: e.target.value, group: '', subjectCategory: '', topic: '' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Level</option>
                {levels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {groups.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Group</label>
              <select
                value={uploadForm.group}
                onChange={(e) => setUploadForm({ ...uploadForm, group: e.target.value, subjectCategory: '' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Group (Optional)</option>
                {groups.map((group) => (
                  <option key={group.value} value={group.value}>
                    {group.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {subjects.length > 0 && uploadForm.level && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
              <select
                required
                value={uploadForm.subjectCategory}
                onChange={(e) => setUploadForm({ ...uploadForm, subjectCategory: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Subject</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>
          )}

          {uploadForm.category === 'UNDER_GRADUATE' && uploadForm.level && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Topic (Optional)</label>
              <input
                type="text"
                value={uploadForm.topic}
                onChange={(e) => setUploadForm({ ...uploadForm, topic: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Data Structures"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              required
              value={uploadForm.description}
              onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Brief description"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">File *</label>
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
  );
}

// Auth Modal Component
function AuthModal({ authMode, setAuthMode, loginForm, setLoginForm, signupForm, setSignupForm, handleLogin, handleSignup, setShowAuthModal }) {
  return (
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

        {authMode === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
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
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                required
                value={signupForm.confirmPassword}
                onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
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
  );
}
