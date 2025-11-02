import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userData = response.data.user;
      setUser(userData);
      setName(userData.name);
    } catch (error) {
      setMessage('Error fetching profile');
      console.error('Error fetching profile:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('name', name);
      if (profilePicture) {
        formData.append('profilePicture', profilePicture);
      }

      const response = await axios.patch(
        'http://localhost:3000/api/auth/profile',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setUser(response.data.user);
      setMessage('Profile updated successfully!');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error updating profile');
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      setMessage('File size should not exceed 5MB');
      return;
    }
    setProfilePicture(file);
  };

  if (!user) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>
      
      {message && (
        <div className={`p-4 mb-4 rounded ${
          message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          {user.profilePicture && (
            <div className="mb-4">
              <img
                src={`http://localhost:3000${user.profilePicture}`}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover"
              />
            </div>
          )}
          
          <label className="block mb-2">Profile Picture</label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            onChange={handleFileChange}
            className="w-full p-2 border rounded"
          />
          <p className="text-sm text-gray-500 mt-1">
            Max file size: 5MB. Supported formats: JPG, JPEG, PNG
          </p>
        </div>

        <div>
          <label className="block mb-2">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-2">Email</label>
          <input
            type="email"
            value={user.email}
            className="w-full p-2 border rounded bg-gray-100"
            disabled
          />
        </div>

        <div>
          <label className="block mb-2">Credits</label>
          <input
            type="number"
            value={user.credits}
            className="w-full p-2 border rounded bg-gray-100"
            disabled
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white`}
        >
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;