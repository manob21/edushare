const { GridFSBucket } = require('mongodb');

class GridFsStorage {
  constructor({ db, bucketName = 'files' } = {}) {
    if (!db) throw new Error('GridFsStorage requires a connected Mongo DB instance');
    this.bucket = new GridFSBucket(db, { bucketName });
  }

  async upload(buffer, name, mime, metadata = {}) {
    const uploadStream = this.bucket.openUploadStream(name, { contentType: mime, metadata });
    const id = uploadStream.id;

    await new Promise((resolve, reject) => {
      uploadStream.once('error', reject);
      uploadStream.once('finish', resolve);
      uploadStream.end(buffer);
    });

    const files = await this.bucket.find({ _id: id }).toArray();
    const fileDoc = files[0] || {};
    return { id, length: fileDoc.length, contentType: fileDoc.contentType, fileName: fileDoc.filename };
  }

  openDownloadStream(id, opts = {}) {
    const { start, endExclusive } = opts;
    if (typeof start === 'number' && typeof endExclusive === 'number') {
      return this.bucket.openDownloadStream(id, { start, end: endExclusive });
    }
    return this.bucket.openDownloadStream(id);
  }

  async stat(id) {
    const files = await this.bucket.find({ _id: id }).toArray();
    const fileDoc = files[0];
    if (!fileDoc) return null;
    return { length: fileDoc.length, filename: fileDoc.filename, contentType: fileDoc.contentType };
  }
}

module.exports = GridFsStorage;