const mongoose = require('mongoose');

const productFeatureSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // Ensure your Product model is named 'Product'
    required: true,
    unique: true 
  },
  features: [{ type: String }],      // Array of strings
  ingredients: [{ type: String }],   // Array of strings
  howToUse: { type: String },        // Text instructions
}, { timestamps: true });

// Model ka naam 'ProductFeature' rakhein jo file name se match kare
module.exports = mongoose.model('ProductFeature', productFeatureSchema);