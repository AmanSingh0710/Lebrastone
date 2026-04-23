const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Reel = require('../models/Reel');
const { protect } = require('../middleware/authMiddleware');

// Multer Config for Videos
const storage = multer.diskStorage({
    destination: 'public/uploads/reels/',
    filename: (req, file, cb) => {
        cb(null, 'reel-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /mp4|webm|mov|quicktime/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (extname) return cb(null, true);
        cb("Error: Only Videos are allowed!");
    }
});

// Add New Reel
router.post('/add', protect, upload.single('video'), async (req, res) => {
    try {
        const { customerName, rating, reviewText } = req.body;
        if (!req.file) return res.status(400).json({ message: "Please upload a video" });

        const newReel = new Reel({
            customerName,
            rating,
            reviewText,
            videoUrl: `/uploads/reels/${req.file.filename}`
        });

        await newReel.save();
        res.status(201).json({ success: true, data: newReel });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get All Reels
router.get('/all', async (req, res) => {
    try {
        const reels = await Reel.find({ status: true }).sort({ createdAt: -1 });
        res.json(reels);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete Reel
router.delete('/:id', async (req, res) => {
    try {
        const reel = await Reel.findByIdAndDelete(req.params.id);
        if (!reel) return res.status(404).json({ message: "Reel not found" });
        res.json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
module.exports = router;