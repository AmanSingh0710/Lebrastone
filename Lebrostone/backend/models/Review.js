const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5, default: 5 },
    comment: { type: String, required: true },
    customerImage: { type: String }, // Path for the image file
    status: { type: Boolean, default: true } // Show/Hide on website
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);