const mongoose = require('mongoose');

const reelSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    rating: { type: Number, default: 5 },
    reviewText: { type: String },
    videoUrl: { type: String, required: true }, // Video file path
    status: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Reel', reelSchema);