const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  description: { type: String },

  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  fileName: { type: String, required: true },
  contentType: { type: String },

  // Only required when storing on disk
  fileUrl: {
    type: String,
    required: function () {
      return this.storage === 'disk';
    },
  },

  // Storage strategy
  storage: { type: String, enum: ['disk', 'gridfs'], default: 'disk', index: true },
  gridFsId: { type: mongoose.Schema.Types.ObjectId },
  fileSize: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model('Resource', ResourceSchema);