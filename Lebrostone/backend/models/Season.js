const mongoose = require('mongoose');

const seasonSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true, 
    enum: ['Bestseller', 'New Arrival', 'Combo'] //
  },
  status: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Season', seasonSchema);