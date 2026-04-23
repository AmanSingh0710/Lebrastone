const mongoose = require('mongoose');

const sliderSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    image: { type: String, required: true }, 
    status: { type: Boolean, default: true },
    productID: { type: String, required: true },
    type: { type: String, enum: ['mobile', 'desktop'], default: 'desktop' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Slider', sliderSchema);
