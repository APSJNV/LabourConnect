import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLabourers: 0,
    totalEmployers: 0,
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalReviews: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    checkAdminAccess();
    fetchStats();
    fetchUsers();
    fetchBookings();
  }, []);

  const checkAdminAccess = () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || user?.role !== 'admin') {
      alert('Access denied. Admin privileges required.');
      navigate('/dashboard');
      return;
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const { stats } = await response.json();
        setStats(stats);
      } else {
        console.error('Failed to fetch stats');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings);
      } else {
        console.error('Failed to fetch bookings');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          setUsers(users.filter(user => user._id !== userId));
          alert('User deleted successfully');
          fetchStats();
        } else {
          alert('Failed to delete user');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleUpdateUserType = async (userId, newUserType) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/usertype`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userType: newUserType })
      });

      if (response.ok) {
        setUsers(users.map(user =>
          user._id === userId ? { ...user, role: newUserType } : user
        ));
        alert('User role updated successfully');
        fetchStats();
      } else {
        alert('Failed to update user role');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/admin/bookings/${bookingId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          setBookings(bookings.filter(booking => booking._id !== bookingId));
          alert('Booking deleted successfully');
          fetchStats();
        } else {
          alert('Failed to delete booking');
        }
      } catch (error) {
        console.error('Error deleting booking:', error);
      }
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return <div className="admin-container"><div className="loading">Loading admin dashboard...</div></div>;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-actions">
          <button onClick={() => navigate('/profile')} className="btn-secondary">My Profile</button>
          {/* <button onClick={() => navigate('/dashboard')} className="btn-secondary">User Dashboard</button> */}
          <button onClick={handleLogout} className="btn-danger">Logout</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card"><h3>Total Users</h3><div className="stat-number">{stats.totalUsers}</div></div>
        <div className="stat-card"><h3>Labourers</h3><div className="stat-number">{stats.totalLabourers}</div></div>
        <div className="stat-card"><h3>Employers</h3><div className="stat-number">{stats.totalEmployers}</div></div>
        <div className="stat-card"><h3>Total Bookings</h3><div className="stat-number">{stats.totalBookings}</div></div>
        <div className="stat-card"><h3>Pending Bookings</h3><div className="stat-number">{stats.pendingBookings}</div></div>
        <div className="stat-card"><h3>Completed Bookings</h3><div className="stat-number">{stats.completedBookings}</div></div>
        <div className="stat-card"><h3>Total Reviews</h3><div className="stat-number">{stats.totalReviews}</div></div>
      </div>

      {/* User Management */}
      <div className="users-section">
        <h2>User Management</h2>
        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <select value={user.role} onChange={(e) => handleUpdateUserType(user._id, e.target.value)}>
                      <option value="employer">Employer</option>
                      <option value="labourer">Labourer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => handleViewUser(user)} className="btn-info btn-sm">View</button>
                    <button onClick={() => handleDeleteUser(user._id)} className="btn-danger btn-sm">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Management */}
      <div className="bookings-section">
        <h2>Booking Management</h2>
        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Employer</th>
                <th>Labourer</th>
                <th>Status</th>
                <th>Booked On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(booking => (
                <tr key={booking._id}>
                  <td>{booking.employer?.name || 'N/A'}</td>
                  <td>{booking.labourer?.name || 'N/A'}</td>
                  <td>{booking.status}</td>
                  <td>{new Date(booking.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => handleDeleteBooking(booking._id)} className="btn-danger btn-sm">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>User Details</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div><strong>Name:</strong> {selectedUser.name}</div>
              <div><strong>Email:</strong> {selectedUser.email}</div>
              <div><strong>Phone:</strong> {selectedUser.phone || 'Not provided'}</div>
              <div><strong>Address:</strong> {selectedUser.address || 'Not provided'}</div>
              <div><strong>Role:</strong> {selectedUser.role}</div>
              <div><strong>Created:</strong> {new Date(selectedUser.createdAt).toLocaleString()}</div>
              <div><strong>Updated:</strong> {new Date(selectedUser.updatedAt).toLocaleString()}</div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowModal(false)} className="btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
