const express = require('express');
const router = express.Router();
const Concern = require('../models/Concern');
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const concernUploadDir = path.join(__dirname, '../public/uploads/concerns');
if (!fs.existsSync(concernUploadDir)) {
  fs.mkdirSync(concernUploadDir, { recursive: true });
}

// Configure multer for concern images
const concernStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, concernUploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, 'concern-' + Date.now() + path.extname(file.originalname));
  }
});

const concernUpload = multer({ storage: concernStorage });

// GET all concerns (public - for client)
router.get('/', async (req, res) => {
  try {
    const concerns = await Concern.find({ status: true })
      .populate('products', 'name images unitPrice mrp selling_price')
      .sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: concerns });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET all concerns with all products (admin)
router.get('/all', protect, async (req, res) => {
  try {
    const concerns = await Concern.find()
      .populate('products', 'name images unitPrice mrp selling_price category')
      .sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: concerns });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single concern
router.get('/:id', async (req, res) => {
  try {
    const concern = await Concern.findById(req.params.id)
      .populate('products', 'name images unitPrice mrp selling_price category');
    if (!concern) {
      return res.status(404).json({ success: false, message: 'Concern not found' });
    }
    res.json({ success: true, data: concern });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// SEARCH products for concern (for admin dropdown)
router.get('/search-products', protect, async (req, res) => {
  try {
    const { q, category } = req.query;
    
    let query = {};
    
    // Search by name or description
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }
    
    // Filter by category if provided
    if (category) {
      query.category = category;
    }
    
    const products = await Product.find(query)
      .select('name images category unitPrice mrp selling_price')
      .populate('category', 'name')
      .limit(50);
    
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// CREATE concern (admin)
router.post('/', protect, concernUpload.single('image'), async (req, res) => {
  try {
    const { title, products, status, order } = req.body;
    
    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }
    
    const concern = new Concern({
      title,
      image: req.file ? `/uploads/concerns/${req.file.filename}` : '',
      products: products ? JSON.parse(products) : [],
      status: status === 'true' || status === true,
      order: order || 0
    });
    
    await concern.save();
    await concern.populate('products', 'name images unitPrice mrp selling_price');
    
    res.status(201).json({
      success: true,
      message: 'Concern created successfully!',
      data: concern
    });
  } catch (err) {
    console.error('Error creating concern:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// UPDATE concern (admin)
router.put('/:id', protect, concernUpload.single('image'), async (req, res) => {
  try {
    const { title, products, status, order } = req.body;
    
    const concern = await Concern.findById(req.params.id);
    if (!concern) {
      return res.status(404).json({ success: false, message: 'Concern not found' });
    }
    
    concern.title = title || concern.title;
    if (status !== undefined) {
      concern.status = status === 'true' || status === true;
    }
    concern.order = order || concern.order;
    
    if (req.file) {
      concern.image = `/uploads/concerns/${req.file.filename}`;
    }
    
    if (products) {
      concern.products = JSON.parse(products);
    }
    
    await concern.save();
    await concern.populate('products', 'name images unitPrice mrp selling_price');
    
    res.json({
      success: true,
      message: 'Concern updated successfully!',
      data: concern
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// TOGGLE concern status (admin)
router.put('/:id/toggle', protect, async (req, res) => {
  try {
    const concern = await Concern.findById(req.params.id);
    if (!concern) {
      return res.status(404).json({ success: false, message: 'Concern not found' });
    }
    
    concern.status = !concern.status;
    await concern.save();
    
    res.json({
      success: true,
      message: `Concern is now ${concern.status ? 'Active' : 'Inactive'}`,
      data: concern
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE concern (admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const concern = await Concern.findByIdAndDelete(req.params.id);
    if (!concern) {
      return res.status(404).json({ success: false, message: 'Concern not found' });
    }
    
    res.json({
      success: true,
      message: 'Concern deleted successfully!'
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
