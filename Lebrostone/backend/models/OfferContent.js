const mongoose = require('mongoose');

const OfferContentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['findOffer', 'offerBanner'],
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null
  },
  ctaText: {
    type: String,
    default: 'Shop Now'
  },
  status: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('OfferContent', OfferContentSchema);
