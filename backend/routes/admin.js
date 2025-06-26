const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const User = require('../models/user');
const Booking = require('../models/booking');
const Review = require('../models/review');

const router = express.Router();

// Admin dashboard stats
router.get('/dashboard', auth, authorize('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalLabourers = await User.countDocuments({ role: 'labourer' });
    const totalEmployers = await User.countDocuments({ role: 'employer' });
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const totalReviews = await Review.countDocuments();

    // Recent bookings
    const recentBookings = await Booking.find()
      .populate('employer', 'name email')
      .populate('labourer', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Category wise labourer count
    const categoryStats = await User.aggregate([
      { $match: { role: 'labourer' } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.json({
      stats: {
        totalUsers,
        totalLabourers,
        totalEmployers,
        totalBookings,
        pendingBookings,
        completedBookings,
        totalReviews
      },
      recentBookings,
      categoryStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users
router.get('/users', auth, authorize('admin'), async (req, res) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all bookings
router.get('/bookings', auth, authorize('admin'), async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('employer', 'name email')
      .populate('labourer', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Booking.countDocuments(query);

    res.json({
      bookings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
// ✅ Delete a user
router.delete('/users/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByIdAndDelete(userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
// ✅ Update user role
router.put('/users/:id/usertype', auth, authorize('admin'), async (req, res) => {
  try {
    const userId = req.params.id;
    const { userType } = req.body;

    const user = await User.findByIdAndUpdate(userId, { role: userType }, { new: true }).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User type updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
// ✅ Delete a booking
router.delete('/bookings/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const bookingId = req.params.id;

    const booking = await Booking.findByIdAndDelete(bookingId);

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;