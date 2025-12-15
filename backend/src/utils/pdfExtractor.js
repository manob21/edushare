const { PDFDocument } = require('pdf-lib');

/**
 * Extract the first N pages from a PDF buffer
 * @param {Buffer} pdfBuffer - Original PDF file buffer
 * @param {number} pageCount - Number of pages to extract (default: 5)
 * @returns {Promise<Buffer>} - Buffer containing the extracted pages
 */
async function extractFirstPages(pdfBuffer, pageCount = 5) {
  try {
    // Load the original PDF
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const totalPages = pdfDoc.getPageCount();
    
    // If PDF has fewer pages than requested, use all pages
    const pagesToExtract = Math.min(pageCount, totalPages);
    
    // Create a new PDF document
    const newPdfDoc = await PDFDocument.create();
    
    // Copy the first N pages
    const copiedPages = await newPdfDoc.copyPages(pdfDoc, Array.from({ length: pagesToExtract }, (_, i) => i));
    
    // Add copied pages to the new document
    copiedPages.forEach(page => {
      newPdfDoc.addPage(page);
    });
    
    // Save the new PDF as a buffer
    const pdfBytes = await newPdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (error) {
    console.error('Error extracting PDF pages:', error);
    throw new Error('Failed to extract PDF pages: ' + error.message);
  }
}

/**
 * Check if a file is a PDF based on its mimetype
 * @param {string} mimetype - File mimetype
 * @returns {boolean}
 */
function isPdf(mimetype) {
  return mimetype === 'application/pdf';
}

module.exports = {
  extractFirstPages,
  isPdf,
};
