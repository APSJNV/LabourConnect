import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import LabourerList from './pages/LabourerList';
import BookingForm from './pages/BookingForm';

import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
  <Route path="/" element={<Home />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/labourers" element={<LabourerList />} />

  {/* Protected: Any logged-in user can access */}
  <Route path="/dashboard" element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } />

  <Route path="/profile" element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  } />

  <Route path="/book-labourer" element={
    <ProtectedRoute roles={['employer']}>
      <BookingForm />
    </ProtectedRoute>
  } />

  {/* Protected: Only admin can access */}
  <Route path="/admin-dashboard" element={
    <ProtectedRoute roles={['admin']}>
      <AdminDashboard />
    </ProtectedRoute>
  } />
</Routes>

        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;