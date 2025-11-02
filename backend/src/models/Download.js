const mongoose = require('mongoose');

const DownloadSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
    resource: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', index: true, required: true },
  },
  { timestamps: true }
);

// Optional: speed up lookups
DownloadSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Download', DownloadSchema);