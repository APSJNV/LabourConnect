import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import { User } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('https://labourconnect-a3xg.onrender.com/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          address: userData.address || ''
        });
      } else {
        console.error('Failed to fetch profile');
        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://labourconnect-a3xg.onrender.com/api/users/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setEditing(false);
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleBack = () => {
    
    if (user.role === 'admin') {
      navigate('/admin-dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        <div className="profile-actions">
          <button onClick={handleBack} className="btn-secondary">
            Back to Dashboard
          </button>
          <button onClick={handleLogout} className="btn-danger">
            Logout
          </button>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          {!editing ? (
            <div className="profile-view">
              <div className="profile-info">
                <div className="info-item">
                  <label>Name:</label>
                  <span>{user?.name || 'Not provided'}</span>
                </div>
                <div className="info-item">
                  <label>Email:</label>
                  <span>{user?.email || 'Not provided'}</span>
                </div>
                <div className="info-item">
                  <label>Phone:</label>
                  <span>{user?.phone || 'Not provided'}</span>
                </div>
                <div className="info-item">
                  <label>Address:</label>
                  <span>{user?.address || 'Not provided'}</span>
                </div>
                <div className="info-item">
                  <label>User Type:</label>
                  <span className={`user-type ${user?.userType}`}>
                    {user?.userType === 'admin' ? 'Administrator' : 'Regular User'}
                  </span>
                </div>
                <div className="info-item">
                  <label>Member Since:</label>
                  <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}</span>
                </div>
              </div>
              <button onClick={() => setEditing(true)} className="btn-primary">
                Edit Profile
              </button>
            </div>
          ) : (
            <div className="profile-edit">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Name:</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email:</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone:</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="address">Address:</label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    Save Changes
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setEditing(false)} 
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
