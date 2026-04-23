const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Brand = require('../models/Brand'); // Apna model path check karein
const { protect } = require('../middleware/authMiddleware'); // Admin protection ke liye

// --- Multer Storage Setup ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/brands/'); // Ensure ye folder backend mein exist karta ho
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// @route   POST /api/brands
// @desc    Naya Brand create karein
router.post('/', protect, upload.single('logo'), async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: "Brand name is required" });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: "Brand logo is required" });
        }

        // Image path database ke liye
        const logoPath = `/uploads/brands/${req.file.filename}`;

        const newBrand = new Brand({
            name,
            logo: logoPath
        });

        const savedBrand = await newBrand.save();

        res.status(201).json({
            success: true,
            message: "Brand added successfully! ✅",
            data: savedBrand
        });

    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: "Brand name already exists." });
        }
        res.status(500).json({ success: false, message: err.message });
    }
});

// @route   GET /api/brands
// @desc    Saare brands ki list fetch karein
router.get('/', async (req, res) => {
    try {
        const brands = await Brand.find().sort({ name: 1 });
        res.status(200).json({ success: true, data: brands });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});


router.put('/:id', protect, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const updatedBrand = await Brand.findByIdAndUpdate(
            id, 
            { $set: updateData }, 
            { returnDocument: "after" }
        );

        if (!updatedBrand) {
            return res.status(404).json({ success: false, message: "Brand not found" });
        }

        res.status(200).json({
            success: true,
            message: "Brand updated successfully! ✅",
            data: updatedBrand
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/:id', protect, upload.single('logo'), async (req, res) => {
    try {
        const { id } = req.params;
        let brand = await Brand.findById(id);
        if (!brand) return res.status(404).json({ success: false, message: "Brand not found" });

        let updateData = { name: req.body.name || brand.name, status: req.body.status !== undefined ? req.body.status : brand.status };

        // Agar naya logo upload hua hai
        if (req.file) {
            // Purani image delete karein
            const oldImagePath = path.join(__dirname, '..', 'public', brand.logo);
            if (fs.existsSync(oldImagePath)) { fs.unlinkSync(oldImagePath); }
            
            updateData.logo = `/uploads/brands/${req.file.filename}`;
        }

        const updatedBrand = await Brand.findByIdAndUpdate(id, { $set: updateData }, { returnDocument: "after" });
        res.status(200).json({ success: true, message: "Brand updated successfully! ✅", data: updatedBrand });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ✅ DELETE ROUTE: Database aur Storage dono se remove karega
// @route    DELETE /api/brands/:id
router.delete('/:id', protect, async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);
        if (!brand) return res.status(404).json({ success: false, message: "Brand not found" });

        // Server se image file delete karein
        const imagePath = path.join(__dirname, '..', 'public', brand.logo);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        await Brand.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Brand deleted successfully! 🗑️" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;