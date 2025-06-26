const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const Review = require('../models/review');
const Booking = require('../models/booking');
const User = require('../models/user');

const router = express.Router();

// Create review
router.post('/', auth, [
  body('booking').isMongoId().withMessage('Invalid booking ID'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isLength({ max: 500 }).withMessage('Comment too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { booking, rating, comment } = req.body;

    // Check if booking exists and is completed
    const bookingDoc = await Booking.findOne({
      _id: booking,
      employer: req.user._id,
      status: 'completed'
    });

    if (!bookingDoc) {
      return res.status(404).json({ message: 'Booking not found or not completed' });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ booking });
    if (existingReview) {
      return res.status(400).json({ message: 'Review already exists for this booking' });
    }

    const review = new Review({
      booking,
      employer: req.user._id,
      labourer: bookingDoc.labourer,
      rating,
      comment
    });

    await review.save();

    // Update labourer's rating
    await updateLabourerRating(bookingDoc.labourer);

    res.status(201).json({
      message: 'Review created successfully',
      review
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get reviews for a labourer
router.get('/labourer/:id', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const reviews = await Review.find({ labourer: req.params.id })
      .populate('employer', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Review.countDocuments({ labourer: req.params.id });

    res.json({
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to update labourer rating
async function updateLabourerRating(labourerId) {
  try {
    const reviews = await Review.find({ labourer: labourerId });
    
    if (reviews.length === 0) {
      await User.findByIdAndUpdate(labourerId, {
        rating: 0,
        totalReviews: 0
      });
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await User.findByIdAndUpdate(labourerId, {
      rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      totalReviews: reviews.length
    });
  } catch (error) {
    console.error('Error updating labourer rating:', error);
  }
}

module.exports = router;