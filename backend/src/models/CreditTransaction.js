const mongoose = require('mongoose');

const creditTransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  transactionType: {
    type: String,
    required: true,
    enum: ['EARN', 'SPEND', 'INITIAL', 'BONUS', 'REFUND']
  },
  amount: {
    type: Number,
    required: true
  },
  balanceBefore: {
    type: Number,
    required: true
  },
  balanceAfter: {
    type: Number,
    required: true
  },
  resource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource'
  },
  description: {
    type: String,
    required: true,
    maxlength: [200, 'Description cannot be more than 200 characters']
  },
  metadata: {
    uploadTitle: String,
    downloadTitle: String,
    recipientUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
creditTransactionSchema.index({ user: 1, createdAt: -1 });
creditTransactionSchema.index({ transactionType: 1 });

module.exports = mongoose.model('CreditTransaction', creditTransactionSchema);