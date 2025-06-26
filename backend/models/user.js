const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['labourer', 'employer', 'admin'],
    required: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  profilePhoto: {
    type: String,
    default: ''
  },
  // Labourer specific fields
 category: {
  type: String,
  enum: [
    'General Helper', 'Construction Labour', 'Factory Worker', 'Loader/Unloader', 'Cleaning Staff',
    'Painter', 'Electrician Helper', 'Plumber Helper', 'Gardening', 'Carpenter',
    'Welder', 'Mason', 'Tile Fitter', 'Scaffolder', 'Security Guard',
    'Warehouse Worker', 'Driver', 'Housekeeping', 'Cook', 'Other'
  ],
  required: function() { return this.role === 'labourer'; }
}
,
  hourlyRate: {
    type: Number,
    required: function() { return this.role === 'labourer'; }
  },
  experience: {
    type: Number,
    default: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  location: {
    city: String,
    state: String,
    pincode: String
  }
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
// ... [rest of your schema and methods unchanged]

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
