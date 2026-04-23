const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  senderType: {
    type: String,
    enum: ['user', 'admin'],
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  attachment: {
    type: String, // File path if uploaded
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  }
}, { 
  timestamps: true 
});

// Index for better query performance
messageSchema.index({ ticketId: 1, createdAt: 1 });
messageSchema.index({ senderType: 1 });

module.exports = mongoose.model('Message', messageSchema);