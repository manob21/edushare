const User = require('../models/user');

class UserRepo {
  async incUploadCount(userId, n = 1) { return User.findByIdAndUpdate(userId, { $inc: { uploadCount: n } }, { new: true }); }
  async incDownloadCount(userId, n = 1) { return User.findByIdAndUpdate(userId, { $inc: { downloadCount: n } }, { new: true }); }
  async findById(id) { return User.findById(id); }
}

module.exports = new UserRepo();