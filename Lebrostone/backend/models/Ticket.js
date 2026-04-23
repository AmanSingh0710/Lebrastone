const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Technical Issue', 'Order Related', 'Product Inquiry', 'Billing Issue', 'Account Issue', 'Other']
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  attachment: {
    type: String, // File path if uploaded
    default: null
  },
  status: {
    type: String,
    enum: ['Open', 'Pending', 'Resolved', 'Closed'],
    default: 'Open'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  closedAt: {
    type: Date,
    default: null
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true 
});

// Index for better query performance
ticketSchema.index({ userId: 1, createdAt: -1 });
ticketSchema.index({ status: 1 });

module.exports = mongoose.model('Ticket', ticketSchema);