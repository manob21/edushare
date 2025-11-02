const Resource = require('../models/Resource');

class ResourceRepo {
  async create(doc) { return Resource.create(doc); }
  async findAll() { return Resource.find().populate('uploadedBy', 'name email').sort({ createdAt: -1 }); }
  async findPopular(limit = 10) {
    return Resource.find().populate('uploadedBy', 'name email').sort({ downloads: -1, createdAt: -1 }).limit(limit);
  }
  async distinctSubjects() { return Resource.distinct('subject'); }
  async findBySubject(subject) {
    return Resource.find({ subject: new RegExp(subject, 'i') }).populate('uploadedBy', 'name email').sort({ createdAt: -1 });
  }
  async findById(id) { return Resource.findById(id); }
  async myUploads(userId) { return Resource.find({ uploadedBy: userId }).sort({ createdAt: -1 }); }
  async incDownloads(id, n = 1) { return Resource.findByIdAndUpdate(id, { $inc: { downloads: n } }, { new: true }); }
}

module.exports = new ResourceRepo();