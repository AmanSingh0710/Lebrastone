const express = require('express');
const router = express.Router();
const SubSubCategory = require('../models/SubSubCategory');
const { protect } = require('../middleware/authMiddleware');

// Add Sub Sub Category
router.post('/', protect, async (req, res) => {
    try {
        const newSubSub = new SubSubCategory(req.body);
        await newSubSub.save();
        res.status(201).json({ success: true, message: "Sub Sub Category Added! ✅" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get All with Full Relations (Populate)
router.get('/', async (req, res) => {
    try {
        const list = await SubSubCategory.find()
            .populate('mainCategory', 'name')
            .populate('subCategory', 'name')
            .sort({ priority: 1 });
        res.status(200).json({ success: true, data: list });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Edit Route
router.put('/:id', protect, async (req, res) => {
    try {
        await SubSubCategory.findByIdAndUpdate(req.params.id, req.body);
        res.status(200).json({ success: true, message: "Updated! ✅" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Delete Route
router.delete('/:id', protect, async (req, res) => {
    try {
        await SubSubCategory.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Deleted! 🗑️" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;