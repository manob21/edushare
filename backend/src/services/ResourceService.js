const ResourceRepo = require('../repositories/ResourceRepo');
const UserRepo = require('../repositories/UserRepo');
const FileService = require('./FileService');
const { contentTypeFor } = require('../utils/contentType');
const DownloadRepo = require('../repositories/DownloadRepo');
const { extractFirstPages, isPdf } = require('../utils/pdfExtractor');

class ResourceService {
  async listAll() { return ResourceRepo.findAll(); }
  async listPopular() { return ResourceRepo.findPopular(10); }
  async listSubjects() { return ResourceRepo.distinctSubjects(); }
  async listBySubject(subject) { return ResourceRepo.findBySubject(subject); }
  async getById(id) { return ResourceRepo.findById(id); }
  async myUploads(userId) { return ResourceRepo.myUploads(userId); }
  async myDownloads(userId) { return DownloadRepo.findResourcesByUser(userId, 100); }

  async upload({ userId, file, title, subject, description }) {
    // Upload the full file
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

    // If the file is a PDF, generate and save a preview (first 5 pages)
    if (isPdf(file.mimetype)) {
      try {
        const previewBuffer = await extractFirstPages(file.buffer, 5);
        const previewFilename = `preview_${file.originalname}`;
        const previewMeta = await FileService.upload(previewBuffer, previewFilename, file.mimetype, { uploader: userId, isPreview: true });
        
        // Add preview fields to resource document
        resourceDoc.previewGridFsId = FileService.isGridFs() ? previewMeta.id : undefined;
        resourceDoc.previewFileUrl = FileService.isGridFs() ? undefined : previewMeta.filePath;
        resourceDoc.previewFileSize = previewMeta.length;
      } catch (error) {
        console.error('Failed to generate PDF preview:', error);
        // Continue without preview if it fails - preview is optional
      }
    }

    const doc = await ResourceRepo.create(resourceDoc);
    const updatedUser = await UserRepo.incUploadCount(userId, 1);
    return { doc, counters: { uploadCount: updatedUser?.uploadCount, downloadCount: updatedUser?.downloadCount } };
  }

  async registerDownload(resourceId, userId) {
    await Promise.all([
      ResourceRepo.incDownloads(resourceId, 1),
      userId ? UserRepo.incDownloadCount(userId, 1) : Promise.resolve(),
      userId ? DownloadRepo.record(userId, resourceId) : Promise.resolve(),
    ]);
  }
}

module.exports = new ResourceService();