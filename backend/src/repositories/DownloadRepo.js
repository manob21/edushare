const mongoose = require('mongoose');
const Download = require('../models/Download');

class DownloadRepo {
  async record(userId, resourceId) {
    return Download.create({ user: userId, resource: resourceId });
  }

  // Return unique resources the user downloaded (most recent first)
  async findResourcesByUser(userId, limit = 100) {
    const uid = new mongoose.Types.ObjectId(userId);
    const rows = await Download.aggregate([
      { $match: { user: uid } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: '$resource', lastDownloadedAt: { $first: '$createdAt' } } },
      { $sort: { lastDownloadedAt: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'resources',
          localField: '_id',
          foreignField: '_id',
          as: 'resource',
        },
      },
      { $unwind: '$resource' },
    ]);
    return rows.map((r) => r.resource);
  }
}

module.exports = new DownloadRepo();