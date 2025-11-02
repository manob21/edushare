const path = require('path');
const { createStorage } = require('../storage/factory');

class FileService {
  constructor() {
    this.adapter = null;
    this.mode = (process.env.STORAGE || 'gridfs').toLowerCase();
  }

  async init(db) {
    if (this.adapter) return;
    this.adapter = createStorage({ db });
  }

  // Guard to ensure initialized
  ensureReady() {
    if (!this.adapter) {
      throw new Error('FileService not initialized. Call FileService.init() after DB connects.');
    }
  }

  async upload(buffer, name, mime, metadata) {
    this.ensureReady();
    return this.adapter.upload(buffer, name, mime, metadata);
  }

  async stat(idOrPath) {
    this.ensureReady();
    return this.adapter.stat(idOrPath);
  }

  openDownloadStream(idOrPath, opts) {
    this.ensureReady();
    return this.adapter.openDownloadStream(idOrPath, opts);
  }

  isGridFs() {
    return this.mode !== 'disk';
  }
}

module.exports = new FileService();