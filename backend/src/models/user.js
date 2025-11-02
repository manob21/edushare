const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  uploadCount: { type: Number, default: 0 },
  downloadCount: { type: Number, default: 0 },
  downloadedResources: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource'
  }],
  credits: {
    type: Number,
    default: 50
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);