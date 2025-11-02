const path = require('path');
const GridFsStorage = require('./GridFsStorage');
const DiskStorage = require('./DiskStorage');

function createStorage({ db } = {}) {
  const mode = (process.env.STORAGE || 'gridfs').toLowerCase();
  if (mode === 'disk') {
    return new DiskStorage({ baseDir: path.join(__dirname, '../../uploads') });
  }
  // gridfs
  return new GridFsStorage({ db, bucketName: 'files' });
}

module.exports = { createStorage };