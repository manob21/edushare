const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/auth');
const Resource = require('../models/Resource');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Upload resource
router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    const { title, subject, description } = req.body;
    const file = req.file;

    if (!title || !subject || !description || !file) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // Save resource to DB
    const resource = await Resource.create({
      title,
      subject,
      description,
      fileUrl: `/uploads/${file.filename}`,
      uploadedBy: req.user._id
    });

    res.status(201).json({ success: true, message: 'Resource uploaded!', resource });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Upload failed', error: error.message });
  }
});

module.exports = router;