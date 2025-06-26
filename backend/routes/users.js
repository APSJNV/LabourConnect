const express = require('express');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { auth } = require('../middleware/auth');
const User = require('../models/user');

const router = express.Router();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || '1234567890!@?%%';

// Multer config for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname));
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  }
});

// Middleware: only admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied: Admins only' });
  next();
};


// ==========================
// Register
// // ==========================
// router.post('/register', async (req, res) => {
//   try {
//     const {
//       name, email, password, role,
//       phone, address,
//       category, hourlyRate, experience, location
//     } = req.body;

//     const existingUser = await User.findOne({ email });
//     if (existingUser) return res.status(400).json({ message: 'Email already exists' });

   

//     const user = new User({
//       name,
//       email,
//       password,
//       role,
//       phone,
//       address,
//       category: role === 'labourer' ? category : undefined,
//       hourlyRate: role === 'labourer' ? hourlyRate : undefined,
//       experience: role === 'labourer' ? experience : undefined,
//       location: role === 'labourer' ? location : undefined
//     });

//     await user.save();

//     res.status(201).json({
//       message: 'User registered successfully',
//       user: { ...user.toObject(), password: undefined }
//     });
//   } catch (error) {
//     console.error('Registration error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // ==========================
// // Login
// // ==========================
// router.post('/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password)
//       return res.status(400).json({ message: 'Email and password are required' });

//     const user = await User.findOne({ email });
//     if (!user) return res.status(401).json({ message: 'Invalid credentials' });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

//     const token = jwt.sign(
//       { _id: user._id, role: user.role },
//       JWT_SECRET,
//       { expiresIn: '7d' }
//     );

//     res.json({
//       message: 'Login successful',
//       token,
//       user: {
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         phone: user.phone,
//         address: user.address,
//         profilePhoto: user.profilePhoto,
//         category: user.category,
//         hourlyRate: user.hourlyRate,
//         experience: user.experience,
//         location: user.location
//       }
//     });
//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// }); /// 

//above 2 function are in auth.js

// ==========================
// Profile (Protected)
// ==========================
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/profile', auth, async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ==========================
// Upload Photo (Protected)
// ==========================
router.post('/upload-photo', auth, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const photoUrl = `/uploads/${req.file.filename}`;
    await User.findByIdAndUpdate(req.user._id, { profilePhoto: photoUrl });

    res.json({ message: 'Photo uploaded successfully', photoUrl });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ==========================
// Labourer Search / Listing
// ==========================
router.get('/labourers', async (req, res) => {
  try {
    const { category, city } = req.query;

    const query = { role: 'labourer', isAvailable: true };
    if (category) query.category = category;
    if (city) query['location.city'] = new RegExp(city, 'i');

    const labourers = await User.find(query)
      .select('-password')
      .sort({ rating: -1, createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      labourers,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


// ==========================
// Get Labourer by ID
// ==========================
router.get('/labourer/:id', async (req, res) => {
  try {
    const labourer = await User.findOne({
      _id: req.params.id,
      role: 'labourer'
    }).select('-password');

    if (!labourer) return res.status(404).json({ message: 'Labourer not found' });

    res.json(labourer);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ==========================
// Admin-only: List all users
// ==========================
router.get('/all-users', auth, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
