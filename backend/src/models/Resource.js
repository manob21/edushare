const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a resource title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: [
      'Computer Science',
      'Mathematics',
      'Physics',
      'Chemistry',
      'Biology',
      'Engineering',
      'Business',
      'Economics',
      'Literature',
      'History',
      'Other'
    ]
  },
  field: {
    type: String,
    required: [true, 'Please specify the field'],
    trim: true
  },
  fileType: {
    type: String,
    required: true,
    enum: ['PDF', 'DOCX', 'PPTX', 'MP4', 'ZIP', 'OTHER']
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL is required']
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true,
    max: [104857600, 'File size cannot exceed 100MB']
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  creditsRequired: {
    type: Number,
    default: 10,
    min: [5, 'Minimum credits required is 5'],
    max: [30, 'Maximum credits required is 30']
  },
  creditsEarned: {
    type: Number,
    default: 20,
    min: [10, 'Minimum credits earned is 10'],
    max: [50, 'Maximum credits earned is 50']
  },
  downloads: {
    type: Number,
    default: 0
  },
  downloadedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    downloadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  semester: String,
  year: Number,
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for search functionality
resourceSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Resource', resourceSchema);