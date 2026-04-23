const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    image: { type: String, required: true }, // Blog main image
    shortDescription: { type: String, required: true }, // Card par dikhane ke liye
    longDescription: { type: String, required: true }, // Editor wala content
    author: { type: String, default: 'Admin' },
    status: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);