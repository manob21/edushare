const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const ResourceService = require('../services/ResourceService');
const FileService = require('../services/FileService');
const { parseRangeHeader } = require('../utils/httpRange');
const { contentTypeFor } = require('../utils/contentType');

exports.listAll = asyncHandler(async (req, res) => {
  const resources = await ResourceService.listAll();
  res.json({ success: true, resources });
});

exports.listPopular = asyncHandler(async (req, res) => {
  const resources = await ResourceService.listPopular();
  res.json({ success: true, resources });
});

exports.listSubjects = asyncHandler(async (req, res) => {
  const subjects = await ResourceService.listSubjects();
  res.json({ success: true, subjects });
});

exports.listBySubject = asyncHandler(async (req, res) => {
  const resources = await ResourceService.listBySubject(req.params.subject);
  res.json({ success: true, resources });
});

exports.myUploads = asyncHandler(async (req, res) => {
  const resources = await ResourceService.myUploads(req.user.id);
  res.json({ success: true, resources });
});

// Placeholder my-downloads (keep behavior)
exports.myDownloads = asyncHandler(async (req, res) => {
  const resources = await ResourceService.myDownloads(req.user.id);
  res.json({ success: true, resources });
});

exports.upload = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file' });
  const { title, subject, description } = req.body;
  const out = await ResourceService.upload({
    userId: req.user.id,
    file: req.file,
    title, subject, description,
  });
  res.status(201).json({ resource: out.doc, counters: out.counters });
});

exports.view = asyncHandler(async (req, res) => {
  const resource = await ResourceService.getById(req.params.id);
  if (!resource) return res.status(404).json({ message: 'Resource not found' });

  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('Content-Disposition', `inline; filename="${resource.fileName}"`);
  res.setHeader('Content-Type', resource.contentType || contentTypeFor(resource.fileName));

  // GridFS
  if (resource.storage === 'gridfs' && resource.gridFsId) {
    const stat = await FileService.stat(resource.gridFsId);
    if (!stat) return res.status(404).json({ message: 'File not found' });

    const range = parseRangeHeader(req.headers.range, stat.length);
    if (range?.invalid) {
      return res.status(416).set({ 'Content-Range': `bytes */${stat.length}` }).end();
    }
    if (range) {
      res.status(206).set({ 'Content-Range': `bytes ${range.start}-${range.end}/${stat.length}`, 'Content-Length': range.chunk });
      return FileService.openDownloadStream(resource.gridFsId, { start: range.start, endExclusive: range.end + 1 }).pipe(res);
    }
    res.status(200).set({ 'Content-Length': stat.length });
    return FileService.openDownloadStream(resource.gridFsId).pipe(res);
  }

  // Disk fallback
  const filePath = resource.fileUrl ? path.resolve(resource.fileUrl) : '';
  if (!filePath || !fs.existsSync(filePath)) return res.status(404).json({ message: 'File not found' });
  const stat = fs.statSync(filePath);
  const range = parseRangeHeader(req.headers.range, stat.size);
  if (range?.invalid) return res.status(416).set({ 'Content-Range': `bytes */${stat.size}` }).end();
  if (range) {
    res.status(206).set({ 'Content-Range': `bytes ${range.start}-${range.end}/${stat.size}`, 'Content-Length': range.chunk });
    return fs.createReadStream(filePath, { start: range.start, end: range.end }).pipe(res);
  }
  res.status(200).set({ 'Content-Length': stat.size });
  fs.createReadStream(filePath).pipe(res);
});

exports.download = asyncHandler(async (req, res) => {
  const resource = await ResourceService.getById(req.params.id);
  if (!resource) return res.status(404).json({ message: 'Resource not found' });

  res.setHeader('Content-Disposition', `attachment; filename="${resource.fileName}"`);
  res.setHeader('Content-Type', resource.contentType || 'application/octet-stream');

  // Increment counters (fire-and-forget)
  ResourceService.registerDownload(resource._id, req.user?.id).catch(() => {});

  if (resource.storage === 'gridfs' && resource.gridFsId) {
    return FileService.openDownloadStream(resource.gridFsId).pipe(res);
  }
  const filePath = resource.fileUrl ? path.resolve(resource.fileUrl) : '';
  if (!filePath || !fs.existsSync(filePath)) return res.status(404).json({ message: 'File not found' });
  fs.createReadStream(filePath).pipe(res);
});

exports.getById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ message: 'Resource not found' });
  const resource = await ResourceService.getById(id);
  if (!resource) return res.status(404).json({ message: 'Resource not found' });
  res.json({ resource });
});