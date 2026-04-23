const express = require('express');
const router = express.Router();
const SubCategory = require('../models/SubCategory');
const { protect } = require('../middleware/authMiddleware');

// ✅ 1. GET ALL SUB-CATEGORIES
// Saari sub-categories fetch karega aur unke main category ka naam bhi laayega
router.get('/', async (req, res) => {
    try {
        const subCats = await SubCategory.find()
            .populate('mainCategory', 'name') // Main category ka sirf naam chahiye
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: subCats });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ✅ 2. CREATE SUB-CATEGORY
router.post('/', protect, async (req, res) => {
    try {
        const newSubCat = new SubCategory(req.body);
        const saved = await newSubCat.save();
        res.status(201).json({ success: true, data: saved });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ✅ 3. EDIT/UPDATE SUB-CATEGORY
// @route   PUT /api/subcategories/:id
router.put('/:id', protect, async (req, res) => {
    try {
        const { id } = req.params;
        const updatedSubCat = await SubCategory.findByIdAndUpdate(
            id,
            { $set: req.body },
            { returnDocument: "after", runValidators: true }
        );

        if (!updatedSubCat) {
            return res.status(404).json({ success: false, message: "Sub Category not found" });
        }

        res.status(200).json({
            success: true,
            message: "Sub Category updated successfully! ✅",
            data: updatedSubCat
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ✅ 4. DELETE SUB-CATEGORY
// @route   DELETE /api/subcategories/:id
router.delete('/:id', protect, async (req, res) => {
    try {
        const deletedSubCat = await SubCategory.findByIdAndDelete(req.params.id);

        if (!deletedSubCat) {
            return res.status(404).json({ success: false, message: "Sub Category not found" });
        }

        res.status(200).json({
            success: true,
            message: "Sub Category deleted successfully! 🗑️"
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;