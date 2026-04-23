const mongoose = require('mongoose');

const anantamBannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  subtitle: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    required: true
  },
  ctaText: {
    type: String,
    default: 'EXPLORE COLLECTION'
  },
  seriesName: {
    type: String,
    default: 'THE ANANTAM SERIES'
  },
  status: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  priority: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('AnantamBanner', anantamBannerSchema);