const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Category = require('../models/Category');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

/* ===============================
   MULTER CONFIG (WINDOWS SAFE)
   =============================== */


// 1. Path ko process.cwd() se resolve karein (Zyada safe hai Windows ke liye)
// categoryRoutes.js mein change karein
const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'categories');

// Ensure karein ki ye folder physically banta hai
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // File yahan save hogi
    },
    filename: (req, file, cb) => {
        // Unique filename: timestamp + random number
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('only images allowed hain!'), false);
    }
});

/* ===============================
   ROUTES
   =============================== */
  
router.get('/', async (req, res) => {
    try {
        const data = await Category.find().sort({ priority: 1 });
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/', protect, upload.single('image_url'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Image upload Error' });
        }

        console.log('✅ Image Uploaded:', req.file.filename);
        const imageUrl = `/uploads/categories/${req.file.filename}`;

        const category = new Category({
            name: req.body.name.trim(),
            priority: Number(req.body.priority) || 0,
            show_in_nav: req.body.show_in_nav === 'true',
            image_url: imageUrl
        });

        await category.save();
        res.status(201).json({ success: true, data: category });
    } catch (err) {
        // Agar error aaye toh uploaded file ko delete kar dein
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(400).json({ success: false, message: err.message });
    }
});


router.put('/:id', protect, upload.single('image_url'), async (req, res) => {
    try {
        const update = { ...req.body };

        if (req.file) {
            update.image_url = `/uploads/categories/${req.file.filename}`;
        }

        const updated = await Category.findByIdAndUpdate(
            req.params.id,
            update,
            { returnDocument: "after", runValidators: true }
        );

        res.json({ success: true, data: updated });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

router.delete('/:id', protect, async (req, res) => {
    try {
        const cat = await Category.findById(req.params.id);
        if (!cat) return res.status(404).json({ message: 'Category not found' });

        if (cat.image_url) {
            // Hum 'public' folder ko base maan kar path join karenge
            const fullPath = path.join(process.cwd(), 'public', cat.image_url);
            
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
            }
        }

        await cat.deleteOne();
        res.json({ success: true, message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
