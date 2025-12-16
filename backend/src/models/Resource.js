const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true }, // Keep for backward compatibility
    description: { type: String },

    // New hierarchical categorization fields
    category: { 
      type: String,
      // Accept frontend category keys
      enum: ['PRIMARY', 'SECONDARY', 'HIGHER_SECONDARY', 'UNDER_GRADUATE', 'POST_GRADUATE', 'JOB', 'OTHER']
    },
    level: { type: String }, // e.g., "Class 1", "Class 9", "CSE", "BCS"
    group: { type: String }, // e.g., "Science", "Commerce", "Humanities" (for 9-12)
    subjectCategory: { type: String }, // The actual subject like "Mathematics", "Bangla"
    topic: { type: String }, // For under-graduate/post-graduate major topics

    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // current file fields
    fileName: { type: String, required: true },
    contentType: { type: String },

    // only required when stored on disk
    fileUrl: {
      type: String,
      required: function () {
        return this.storage === 'disk';
      },
    },

    // legacy fields (no longer required)
    name: { type: String }, // optional alias of fileName
    url: { type: String },  // optional alias of fileUrl

    // storage strategy
    storage: { type: String, enum: ['disk', 'gridfs'], default: 'disk', index: true },
    gridFsId: { type: mongoose.Schema.Types.ObjectId },
    fileSize: { type: Number },

    // preview file fields (for first 5 pages of PDF)
    previewGridFsId: { type: mongoose.Schema.Types.ObjectId },
    previewFileUrl: { type: String },
    previewFileSize: { type: Number },

    // per-file stats
    downloads: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resource', ResourceSchema);