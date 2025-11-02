class StorageAdapter {
  async upload(buffer, name, mime, metadata) { throw new Error('Not implemented'); }
  openDownloadStream(id, opts) { throw new Error('Not implemented'); }
  async stat(id) { throw new Error('Not implemented'); }
}
module.exports = StorageAdapter;