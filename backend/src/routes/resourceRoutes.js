const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const multer = require('multer');

const { protect } = require('../middleware/auth');
const Resource = require('../models/Resource');
const User = require('../models/user'); // ADD

const uploadMem = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 * 1024 * 200 }, // 200MB
});

// Helper
function contentTypeFor(name = '') {
  const ext = name.toLowerCase().split('.').pop();
  switch (ext) {
    case 'pdf': return 'application/pdf';
    case 'txt': return 'text/plain';
    case 'doc': return 'application/msword';
    case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'ppt': return 'application/vnd.ms-powerpoint';
    case 'pptx': return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    default: return 'application/octet-stream';
  }
}

// ---------------- Public lists ----------------
router.get('/all', async (req, res) => {
  try {
    const resources = await Resource.find().populate('uploadedBy', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, resources });
  } catch {
    res.status(500).json({ message: 'Error fetching resources' });
  }
});

router.get('/subjects', async (req, res) => {
  try {
    const subjects = await Resource.distinct('subject');
    res.json({ success: true, subjects });
  } catch {
    res.status(500).json({ message: 'Error fetching subjects' });
  }
});

router.get('/subject/:subject', async (req, res) => {
  try {
    const { subject } = req.params;
    const resources = await Resource.find({ subject: new RegExp(subject, 'i') })
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, resources });
  } catch {
    res.status(500).json({ message: 'Error fetching resources' });
  }
});

// ---------------- User lists (auth) ----------------
router.get('/my-uploads', protect, async (req, res) => {
  try {
    const resources = await Resource.find({ uploadedBy: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, resources });
  } catch {
    res.status(500).json({ message: 'Error fetching user uploads' });
  }
});

router.get('/my-downloads', protect, async (req, res) => {
  // If you track downloads, query by user here. For now return recent resources.
  try {
    const resources = await Resource.find().populate('uploadedBy', 'name email').sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, resources });
  } catch {
    res.status(500).json({ message: 'Error fetching user downloads' });
  }
});

// ---------------- Upload to GridFS ----------------
// Upload (GridFS) — increment user's uploadCount
router.post('/upload', protect, uploadMem.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file' });

    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'files' });
    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype,
      metadata: { uploader: req.user.id },
    });
    const fileId = uploadStream.id;

    uploadStream.end(req.file.buffer);

    uploadStream.once('error', (e) => {
      console.error('GridFS upload error:', e);
      if (!res.headersSent) res.status(500).json({ message: 'Upload failed' });
    });

    uploadStream.once('finish', async () => {
      try {
        const files = await bucket.find({ _id: fileId }).toArray();
        const fileDoc = files[0];

        const doc = await Resource.create({
          title: req.body.title,
          subject: req.body.subject,
          description: req.body.description,
          uploadedBy: req.user.id,
          fileName: req.file.originalname,
          contentType: req.file.mimetype,
          storage: 'gridfs',
          gridFsId: fileId,
          fileSize: fileDoc?.length,
        });

        // increment user uploadCount
        const updatedUser = await User.findByIdAndUpdate(
          req.user.id,
          { $inc: { uploadCount: 1 } },
          { new: true }
        ).select('uploadCount downloadCount');

        res.status(201).json({
          resource: doc,
          counters: updatedUser ? {
            uploadCount: updatedUser.uploadCount,
            downloadCount: updatedUser.downloadCount,
          } : undefined,
        });
      } catch (e) {
        console.error('Post-upload save error:', e);
        if (!res.headersSent) res.status(500).json({ message: 'Upload failed' });
      }
    });
  } catch (e) {
    console.error('Upload route error:', e);
    res.status(500).json({ message: 'Upload failed' });
  }
});

// ---------------- Stream view (GridFS or disk) ----------------
router.get('/view/:id', async (req, res) => {
  try {
    const r = await Resource.findById(req.params.id);
    if (!r) return res.status(404).json({ message: 'Resource not found' });

    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Disposition', `inline; filename="${r.fileName}"`);
    res.setHeader('Content-Type', r.contentType || contentTypeFor(r.fileName));

    // GridFS
    if (r.storage === 'gridfs' && r.gridFsId) {
      const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'files' });
      const files = await bucket.find({ _id: r.gridFsId }).toArray();
      if (!files.length) return res.status(404).json({ message: 'File not found' });
      const size = files[0].length;

      const range = req.headers.range;
      if (range) {
        const m = /^bytes=(\d*)-(\d*)$/.exec(range);
        let start = m && m[1] ? parseInt(m[1], 10) : 0;
        let end = m && m[2] ? parseInt(m[2], 10) : size - 1;
        if (isNaN(start) || isNaN(end) || start > end || end >= size) {
          return res.status(416).set({ 'Content-Range': `bytes */${size}` }).end();
        }
        const chunk = end - start + 1;
        res.status(206).set({ 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': chunk });
        return bucket.openDownloadStream(r.gridFsId, { start, end: end + 1 }).pipe(res); // end exclusive
      }
      res.status(200).set({ 'Content-Length': size });
      return bucket.openDownloadStream(r.gridFsId).pipe(res);
    }

    // Disk fallback
    const filePath = path.join(__dirname, '../../uploads', path.basename(r.fileUrl || ''));
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File not found' });
    const stat = fs.statSync(filePath);
    const size = stat.size;
    const range = req.headers.range;

    if (range) {
      const m = /^bytes=(\d*)-(\d*)$/.exec(range);
      let start = m && m[1] ? parseInt(m[1], 10) : 0;
      let end = m && m[2] ? parseInt(m[2], 10) : size - 1;
      if (isNaN(start) || isNaN(end) || start > end || end >= size) {
        return res.status(416).set({ 'Content-Range': `bytes */${size}` }).end();
      }
      const chunk = end - start + 1;
      res.status(206).set({ 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': chunk });
      return fs.createReadStream(filePath, { start, end }).pipe(res);
    }
    res.status(200).set({ 'Content-Length': size });
    fs.createReadStream(filePath).pipe(res);
  } catch (e) {
    console.error('View error:', e);
    res.status(500).json({ message: 'Error opening file' });
  }
});

// Download — increment user's downloadCount and resource downloads
router.get('/download/:id', protect, async (req, res) => {
  try {
    const r = await Resource.findById(req.params.id);
    if (!r) return res.status(404).json({ message: 'Resource not found' });

    // fire-and-forget counter updates
    Promise.allSettled([
      User.findByIdAndUpdate(req.user.id, { $inc: { downloadCount: 1 } }),
      Resource.findByIdAndUpdate(r._id, { $inc: { downloads: 1 } }),
    ]).catch(() => { });

    res.setHeader('Content-Disposition', `attachment; filename="${r.fileName}"`);
    res.setHeader('Content-Type', r.contentType || 'application/octet-stream');

    if (r.storage === 'gridfs' && r.gridFsId) {
      const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'files' });
      return bucket.openDownloadStream(r.gridFsId).pipe(res);
    }
    const filePath = path.join(__dirname, '../../uploads', path.basename(r.fileUrl || ''));
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File not found' });
    fs.createReadStream(filePath).pipe(res);
  } catch (e) {
    console.error('Download error:', e);
    res.status(500).json({ message: 'Download failed' });
  }
});

// ---------------- Generic get-by-id (LAST) ----------------
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ message: 'Resource not found' });
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