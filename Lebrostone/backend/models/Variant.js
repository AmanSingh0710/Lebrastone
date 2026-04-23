const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // Aapke Product model ka naam
    required: true
  },
  weightOrSize: { type: String, required: true }, // Jaise: "10g"
  price: { type: Number, required: true },       // Jaise: 30
  stock: { type: Number, default: 0 },
  sku: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Variant', variantSchema);