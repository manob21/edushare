const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const path = require('path');
const mongoose = require('mongoose');
const FileService = require('./services/FileService');

dotenv.config();

// Connect to database
connectDB();

// After mongoose connects, initialize FileService (GridFS bucket)
mongoose.connection.once('open', async () => {
  try {
    const db = mongoose.connection.db; // native driver db
    await FileService.init(db);
    console.log('FileService initialized');
  } catch (e) {
    console.error('FileService init failed:', e);
    process.exit(1);
  }
});

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Serve static uploads with inline PDF headers and CORS
app.use(
  '/uploads',
  express.static(path.join(__dirname, '..', 'uploads'), {
    setHeaders: (res, filePath) => {
      const lower = filePath.toLowerCase();
      // Allow embedding from any origin during dev (so iframes work reliably)
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Accept-Ranges', 'bytes'); // range support for PDF viewer

      if (lower.endsWith('.pdf')) {
        res.setHeader('Content-Type', 'application/pdf');
        // Critical: render in browser, do not download
        res.setHeader('Content-Disposition', 'inline');
      }
    },
  })
);

// Keep static /uploads with inline-friendly headers (for direct links too)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'), {
  setHeaders: (res, filePath) => {
    const lower = filePath.toLowerCase();
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Accept-Ranges', 'bytes');
    if (lower.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
    }
  },
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resource', resourceRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to EduShare API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  res.status(500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});