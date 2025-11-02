const express = require('express');
const multer = require('multer');
const path = require('path');
const { signup, login, getCurrentUser, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profiles/');
  },
  filename: function (req, file, cb) {
    cb(null, `profile-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpeg, jpg, png) are allowed'));
  }
});

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, getCurrentUser);
router.patch('/profile', protect, upload.single('profilePicture'), updateProfile);

module.exports = router;