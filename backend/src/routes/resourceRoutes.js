const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');
const Resource = require('../models/Resource');
const User = require('../models/user');
const multer = require('multer');
const mongoose = require('mongoose');

// Helper to get content type
function contentTypeFor(name = '') {
  const ext = name.toLowerCase().split('.').pop();
  return ext === 'pdf' ? 'application/pdf' : 'application/octet-stream';
}

// INLINE STREAM VIEW (no download prompt, with Range support)
router.get('/view/:id', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    const filenameOnDisk = path.basename(resource.fileUrl || '');
    const filePath = path.join(__dirname, '../../uploads', filenameOnDisk);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File not found' });

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;

    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Disposition', `inline; filename="${resource.fileName}"`);
    res.setHeader('Content-Type', contentTypeFor(resource.fileName));

    const range = req.headers.range;
    if (range) {
      const m = /^bytes=(\d*)-(\d*)$/.exec(range);
      let start = m && m[1] ? parseInt(m[1], 10) : 0;
      let end = m && m[2] ? parseInt(m[2], 10) : fileSize - 1;
      if (isNaN(start) || isNaN(end) || start > end || end >= fileSize) {
        return res.status(416).set({ 'Content-Range': `bytes */${fileSize}` }).end();
      }
      const chunk = end - start + 1;
      res.status(206).set({
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Content-Length': chunk,
      });
      fs.createReadStream(filePath, { start, end }).pipe(res);
    } else {
      res.status(200).set({ 'Content-Length': fileSize });
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (e) {
    console.error('view error', e);
    res.status(500).json({ message: 'Error opening file' });
  }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, PPT, PPTX, and TXT are allowed.'));
    }
  }
});

// Upload resource
router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    const { title, subject, description } = req.body;
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Store relative path that works from frontend
    const fileUrl = `/uploads/${req.file.filename}`;

    const resource = new Resource({
      title,
      description,
      subject,
      fileUrl,
      fileName: req.file.originalname,
      uploadedBy: userId,
    });

    await resource.save();

    // Update user upload count
    const user = await User.findById(userId);
    user.uploadCount = (user.uploadCount || 0) + 1;
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Resource uploaded successfully',
      resource,
      user: {
        name: user.name,
        email: user.email,
        uploadCount: user.uploadCount,
        downloadCount: user.downloadCount || 0,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message || 'Upload failed' });
  }
});

// Get all resources
router.get('/all', async (req, res) => {
  try {
    const resources = await Resource.find()
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, resources });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching resources' });
  }
});

// Get resources by subject
router.get('/subject/:subject', async (req, res) => {
  try {
    const { subject } = req.params;
    const resources = await Resource.find({ subject: new RegExp(subject, 'i') })
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, resources });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching resources' });
  }
});

// Get all unique subjects
router.get('/subjects', async (req, res) => {
  try {
    const subjects = await Resource.distinct('subject');
    res.json({ success: true, subjects });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subjects' });
  }
});

// ---------------- Specific routes — keep ABOVE the generic one ----------------

// Lists
router.get('/my-uploads', protect, async (req, res) => {
  try {
    const resources = await Resource.find({ uploadedBy: req.user.id })
      .sort({ createdAt: -1 });
    res.json({ success: true, resources });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user uploads' });
  }
});

router.get('/my-downloads', protect, async (req, res) => {
  try {
    const resources = await Resource.find()
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, resources });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user downloads' });
  }
});

// PDF inline view (stream)
router.get('/view/:id', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    const filenameOnDisk = path.basename(resource.fileUrl || '');
    const filePath = path.join(__dirname, '../../uploads', filenameOnDisk);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File not found' });

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;

    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Disposition', `inline; filename="${resource.fileName}"`);
    res.setHeader('Content-Type', contentTypeFor(resource.fileName));

    const range = req.headers.range;
    if (range) {
      const m = /^bytes=(\d*)-(\d*)$/.exec(range);
      let start = m && m[1] ? parseInt(m[1], 10) : 0;
      let end = m && m[2] ? parseInt(m[2], 10) : fileSize - 1;
      if (isNaN(start) || isNaN(end) || start > end || end >= fileSize) {
        return res.status(416).set({ 'Content-Range': `bytes */${fileSize}` }).end();
      }
      const chunk = end - start + 1;
      res.status(206).set({
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Content-Length': chunk,
      });
      fs.createReadStream(filePath, { start, end }).pipe(res);
    } else {
      res.status(200).set({ 'Content-Length': fileSize });
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (e) {
    console.error('view error', e);
    res.status(500).json({ message: 'Error opening file' });
  }
});

// Download resource
router.get('/download/:id', protect, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Check if user has uploaded at least 3 resources
    const user = await User.findById(req.user.id);
    if (user.uploadCount < 3) {
      return res.status(403).json({ message: 'You must upload 3 resources to download' });
    }

    // Construct full file path
    const filePath = path.join(__dirname, '../../uploads', path.basename(resource.fileUrl));

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    // Update download count
    resource.downloadCount = (resource.downloadCount || 0) + 1;
    await resource.save();

    // Update user download count
    user.downloadCount = (user.downloadCount || 0) + 1;
    await user.save();

    // Send file with inline disposition
    res.setHeader('Content-Disposition', `inline; filename="${resource.fileName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.download(filePath, resource.fileName);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Error downloading resource' });
  }
});

// Any other named routes, e.g. /all, /subjects, /subject/:subject, etc.
// Make sure they are also above the generic :id route.

// ---------------- Generic get-by-id — keep LAST and validate ObjectId --------
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  // If it’s not a valid ObjectId, do NOT try to query Mongo (prevents CastError)
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: 'Resource not found' });
  }

  try {
    const resource = await Resource.findById(id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    res.json({ resource });
  } catch (e) {
    console.error('Get by id error:', e);
    res.status(500).json({ message: 'Error fetching resource' });
  }
});

module.exports = router;