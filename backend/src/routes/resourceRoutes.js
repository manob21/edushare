const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/auth');
const Resource = require('../models/Resource');
const User = require('../models/user');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|ppt|pptx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    }
    cb(new Error('Only documents (PDF, DOC, DOCX, PPT, PPTX, TXT) are allowed!'));
  }
});

// Upload resource
router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    const { title, subject, description } = req.body;
    const file = req.file;

    if (!title || !description || !file) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required.' 
      });
    }

    // Save resource to DB
    const resource = await Resource.create({
      title,
      subject, // This will be the new subject if "Other" is selected
      description,
      fileName: file.originalname,
      fileUrl: `/uploads/${file.filename}`,
      fileSize: file.size,
      uploadedBy: req.user._id
    });

    // Increment user's upload count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { uploadCount: 1 }
    });

    // Get updated user data
    const updatedUser = await User.findById(req.user._id);

    res.status(201).json({ 
      success: true, 
      message: 'Resource uploaded successfully!', 
      resource,
      user: {
        uploadCount: updatedUser.uploadCount,
        downloadCount: updatedUser.downloadCount
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Upload failed', 
      error: error.message 
    });
  }
});

// Get all resources
router.get('/all', async (req, res) => {
  try {
    const resources = await Resource.find()
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: resources.length,
      resources
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching resources',
      error: error.message
    });
  }
});

// Get resources by subject
router.get('/subject/:subject', async (req, res) => {
  try {
    const { subject } = req.params;
    const resources = await Resource.find({ subject })
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: resources.length,
      resources
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching resources',
      error: error.message
    });
  }
});

// Get all unique subjects
router.get('/subjects', async (req, res) => {
  try {
    const subjects = await Resource.distinct('subject');
    res.status(200).json({
      success: true,
      subjects: subjects.sort()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching subjects',
      error: error.message
    });
  }
});

// Download resource
router.get('/download/:id', protect, async (req, res) => {
  try {
    // Check if user has uploaded at least 3 documents
    const user = await User.findById(req.user._id);
    if (user.uploadCount < 3) {
      return res.status(403).json({
        success: false,
        message: `You need to upload ${3 - user.uploadCount} more document(s) to unlock downloads`
      });
    }

    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    const filePath = path.join(__dirname, '../../', resource.fileUrl);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Increment user's download count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { downloadCount: 1 }
    });

    // Increment resource's download count (optional)
    await Resource.findByIdAndUpdate(req.params.id, {
      $inc: { downloadCount: 1 }
    });

    // Send file for download
    res.download(filePath, resource.fileName, (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }
    });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      message: 'Download failed',
      error: error.message
    });
  }
});

module.exports = router;