const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Booking = require('../models/booking');

router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    // 👉 Populate the labourer field to get worker details
    const allBookings = await Booking.find({ employer: userId })
      .populate('labourer', 'name category phone profileImage isAvailable description rating totalJobs experience hourlyRate location skills languages') // Populate required fields
      .sort({ date: -1 });

    const stats = {
      totalBookings: allBookings.length,
      activeBookings: allBookings.filter(b => b.status === 'Active').length,
      completedBookings: allBookings.filter(b => b.status === 'Completed').length,
      totalEarnings: allBookings
        .filter(b => b.status === 'Completed')
        .reduce((sum, b) => sum + b.totalAmount, 0)
    };

    // 👉 Use populated labourer data
    const recentBookings = allBookings.slice(0, 5).map(b => ({
      id: b._id,
      clientName: b.labourer ? b.labourer.name : 'Unknown',
      workType: b.labourer ? b.labourer.category : 'Unknown',
      date: b.date,
      status: b.status,
      amount: b.totalAmount,
      labourer: b.labourer // send full labourer object to frontend
    }));

    res.json({ ...stats, recentBookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
