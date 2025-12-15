const { PDFDocument } = require('pdf-lib');

/**
 * generatePdfPreview(buffer, pageLimit = 5)
 * Returns a Buffer of a PDF containing only the first N pages.
 */
async function generatePdfPreview(inputBuffer, pageLimit = 5) {
  if (!Buffer.isBuffer(inputBuffer)) throw new Error('inputBuffer must be a Buffer');

  const srcDoc = await PDFDocument.load(inputBuffer);
  const total = srcDoc.getPageCount();
  const take = Math.min(pageLimit, total);

  const outDoc = await PDFDocument.create();
  const pages = await outDoc.copyPages(srcDoc, [...Array(take).keys()]);
  pages.forEach((p) => outDoc.addPage(p));
  const outBytes = await outDoc.save();
  return Buffer.from(outBytes);
}

module.exports = { generatePdfPreview };