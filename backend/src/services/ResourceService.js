const ResourceRepo = require('../repositories/ResourceRepo');
const UserRepo = require('../repositories/UserRepo');
const FileService = require('./FileService');
const { contentTypeFor } = require('../utils/contentType');

class ResourceService {
  async listAll() { return ResourceRepo.findAll(); }
  async listPopular() { return ResourceRepo.findPopular(10); }
  async listSubjects() { return ResourceRepo.distinctSubjects(); }
  async listBySubject(subject) { return ResourceRepo.findBySubject(subject); }
  async getById(id) { return ResourceRepo.findById(id); }
  async myUploads(userId) { return ResourceRepo.myUploads(userId); }

  async upload({ userId, file, title, subject, description }) {
    const meta = await FileService.upload(file.buffer, file.originalname, file.mimetype, { uploader: userId });

    const resourceDoc = {
      title,
      subject,
      description,
      uploadedBy: userId,
      fileName: file.originalname,
      contentType: file.mimetype || contentTypeFor(file.originalname),
      storage: FileService.isGridFs() ? 'gridfs' : 'disk',
      gridFsId: FileService.isGridFs() ? meta.id : undefined,
      fileSize: meta.length,
      fileUrl: FileService.isGridFs() ? undefined : meta.filePath,
      // legacy optional
      name: file.originalname,
      url: FileService.isGridFs() ? undefined : meta.filePath,
    };

    const doc = await ResourceRepo.create(resourceDoc);
    const updatedUser = await UserRepo.incUploadCount(userId, 1);
    return { doc, counters: { uploadCount: updatedUser?.uploadCount, downloadCount: updatedUser?.downloadCount } };
  }

  async registerDownload(resourceId, userId) {
    await Promise.all([
      ResourceRepo.incDownloads(resourceId, 1),
      userId ? UserRepo.incDownloadCount(userId, 1) : Promise.resolve(),
    ]);
  }
}

module.exports = new ResourceService();