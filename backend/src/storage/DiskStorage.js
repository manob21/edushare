const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

class DiskStorage {
  constructor({ baseDir }) {
    this.baseDir = baseDir || path.join(__dirname, '../../uploads');
    if (!fs.existsSync(this.baseDir)) fs.mkdirSync(this.baseDir, { recursive: true });
  }

  async upload(buffer, name, mime) {
    const id = randomUUID();
    const safeName = `${id}-${name.replace(/[^\w.-]/g, '_')}`;
    const filePath = path.join(this.baseDir, safeName);
    await fs.promises.writeFile(filePath, buffer);
    const stat = await fs.promises.stat(filePath);
    return { id: filePath, length: stat.size, contentType: mime, fileName: safeName, filePath };
  }

  openDownloadStream(idOrPath) {
    return fs.createReadStream(idOrPath);
  }

  async stat(idOrPath) {
    if (!fs.existsSync(idOrPath)) return null;
    const stat = await fs.promises.stat(idOrPath);
    return { length: stat.size, filename: path.basename(idOrPath) };
  }
}

module.exports = DiskStorage;