const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const Booking = require('../models/booking');
const User = require('../models/user');

const router = express.Router();

// Create booking
// Create booking for a specific labourer
// Create booking for a specific labourer


// ✅ Twilio Setup
const twilio = require('twilio');
const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

router.post('/labourer/:id', auth, [
  body('date').isISO8601().withMessage('Invalid date format'),
  body('timeSlot.startTime').notEmpty().withMessage('Start time is required'),
  body('timeSlot.endTime').notEmpty().withMessage('End time is required'),
  body('location.address').notEmpty().withMessage('Address is required'),
  body('duration').isNumeric().withMessage('Duration must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const labourer = req.params.id;
    const { date, timeSlot, location, description, duration } = req.body;

    const labourerUser = await User.findOne({
      _id: labourer,
      role: 'labourer',
      isAvailable: true
    });

    if (!labourerUser) {
      return res.status(404).json({ message: 'Labourer not found or not available' });
    }

    const totalAmount = labourerUser.hourlyRate * duration;

    const booking = new Booking({
      employer: req.user._id,
      labourer,
      date,
      timeSlot,
      location,
      description,
      duration,
      totalAmount
    });

    await booking.save();
    await booking.populate('labourer', 'name email phone category');
    await booking.populate('employer', 'name email phone');

    // ✅ Send SMS to labourer
    const messageBody = `New Booking:
Client Address: ${location.address}
Client Number: ${req.user.phone}
Date: ${new Date(date).toLocaleDateString()}
Time: ${timeSlot.startTime} - ${timeSlot.endTime}`;

    await client.messages.create({
      body: messageBody,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+91${labourerUser.phone}`  // ✅ Correct phone format
    });

    res.status(201).json({
      message: 'Booking created successfully and SMS sent to labourer',
      booking
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});



// Get user's bookings
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (req.user.role === 'employer') {
      query.employer = req.user._id;
    } else if (req.user.role === 'labourer') {
      query.labourer = req.user._id;
    }

    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('employer', 'name email phone')
      .populate('labourer', 'name email phone category')
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

// Get booking by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('employer', 'name email phone')
      .populate('labourer', 'name email phone category');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is authorized to view this booking
    if (booking.employer._id.toString() !== req.user._id.toString() && 
        booking.labourer._id.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update booking status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization
    if (booking.employer.toString() !== req.user._id.toString() && 
        booking.labourer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    booking.status = status;
    await booking.save();

    res.json({ message: 'Booking status updated', booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;