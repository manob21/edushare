const express = require('express');
const router = express.Router();
const multer = require('multer');

const { protect } = require('../middleware/auth');
const ResourceController = require('../controllers/resourceController');

// Multer: memory storage for GridFS
const uploadMem = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 * 1024 * 200 }, // 200MB
});

// Public lists
router.get('/all', ResourceController.listAll);
router.get('/popular', ResourceController.listPopular);
router.get('/subjects', ResourceController.listSubjects);
router.get('/subject/:subject', ResourceController.listBySubject);

// User lists
router.get('/my-uploads', protect, ResourceController.myUploads);
router.get('/my-downloads', protect, ResourceController.myDownloads);

// Upload
router.post('/upload', protect, uploadMem.single('file'), ResourceController.upload);

// View and download
router.get('/view/:id', ResourceController.view);
router.get('/download/:id', protect, ResourceController.download);

// Generic get-by-id
router.get('/:id', ResourceController.getById);

module.exports = router;