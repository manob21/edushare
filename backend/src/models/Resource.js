const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    description: { type: String },

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

    // per-file stats
    downloads: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resource', ResourceSchema);