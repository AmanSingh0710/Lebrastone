// routes/comboRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Combo = require('../models/Combo');
const Product = require('../models/Product');

// Middleware import with safety check
const auth = require('../middleware/authMiddleware');
const protect = auth?.protect || ((req, res, next) => next());
const admin = auth?.admin || ((req, res, next) => next());

// ============================================
// Multer Configuration
// ============================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/combos/');
  },
  filename: (req, file, cb) => {
    cb(null, 'combo-' + Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images are allowed (jpeg, jpg, png, webp, gif)'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// ============================================
// GET ALL COMBOS (for ComboList.jsx)
// Supports: pagination, search, filter, sort
// ============================================
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 100, // Frontend does client-side pagination
      search = '', 
      status = 'all',
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build query
    let query = {};

    // Filter by status
    if (status !== 'all') {
      query.status = status === 'active' || status === 'true';
    }

    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort options
    const sortOptions = {};
    if (sortBy === 'comboPrice') {
      sortOptions.comboPrice = order === 'asc' ? 1 : -1;
    } else if (sortBy === 'discountAmount') {
      sortOptions.discountAmount = order === 'asc' ? 1 : -1;
    } else if (sortBy === 'productCount') {
      // Sort by number of products
      sortOptions['products.length'] = order === 'asc' ? 1 : -1;
    } else {
      sortOptions.createdAt = order === 'asc' ? 1 : -1;
    }

    // Fetch combos with populated products
    const combos = await Combo.find(query)
      .populate('products', 'name unitPrice unit thumbnail category')
      .sort(sortOptions);

    res.json({ 
      success: true, 
      data: combos,
      count: combos.length
    });
  } catch (err) {
    console.error('Get combos error:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message || 'Failed to fetch combos' 
    });
  }
});

// ============================================
// GET SINGLE COMBO BY ID (for ComboView.jsx)
// ============================================
router.get('/:id', async (req, res) => {
  try {
    const combo = await Combo.findById(req.params.id)
      .populate('products', 'name unitPrice unit thumbnail category brand description')
      .populate({
        path: 'products',
        populate: {
          path: 'category',
          select: 'name'
        }
      });

    if (!combo) {
      return res.status(404).json({ 
        success: false, 
        message: 'Combo not found' 
      });
    }

    res.json({ 
      success: true, 
      combo: combo // Frontend expects 'combo' key
    });
  } catch (err) {
    console.error('Get combo error:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message || 'Failed to fetch combo' 
    });
  }
});

// ============================================
// CREATE NEW COMBO
// ============================================
router.post('/', upload.single('thumbnail'), async (req, res) => {
  try {
    let { products } = req.body;
    
    // Parse products if it's a string
    if (typeof products === 'string') {
      try {
        products = JSON.parse(products);
      } catch (e) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid products format' 
        });
      }
    }

    // Validation: At least 2 products required
    if (!products || !Array.isArray(products) || products.length < 2) {
      return res.status(400).json({ 
        success: false, 
        message: 'Combo must contain at least 2 products' 
      });
    }

    // Validation: Combo price must be positive
    if (!req.body.comboPrice || Number(req.body.comboPrice) <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid combo price is required' 
      });
    }

    // Create combo
    const combo = new Combo({
      ...req.body,
      products: products.map(id => id),
      thumbnail: req.file ? `/uploads/combos/${req.file.filename}` : null,
      status: req.body.status === 'true' || req.body.status === true || req.body.status === undefined
    });

    await combo.save();

    // Populate products for response
    const createdCombo = await Combo.findById(combo._id)
      .populate('products', 'name unitPrice unit thumbnail category');

    res.status(201).json({ 
      success: true, 
      message: '✅ Combo Created Successfully!', 
      data: createdCombo 
    });
  } catch (err) {
    console.error('Create combo error:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message || 'Failed to create combo' 
    });
  }
});

// ============================================
// UPDATE COMBO
// ============================================
router.put('/:id', upload.single('thumbnail'), async (req, res) => {
  try {
    let { products } = req.body;
    
    if (typeof products === 'string') {
      products = JSON.parse(products);
    }

    // Find combo
    const combo = await Combo.findById(req.params.id);

    if (!combo) {
      return res.status(404).json({ 
        success: false, 
        message: 'Combo not found' 
      });
    }

    // Update fields
    if (req.body.name !== undefined) combo.name = req.body.name;
    if (req.body.description !== undefined) combo.description = req.body.description;
    if (req.body.comboPrice) combo.comboPrice = Number(req.body.comboPrice);
    if (req.body.originalPrice) combo.originalPrice = Number(req.body.originalPrice);
    if (req.body.discountAmount !== undefined) combo.discountAmount = Number(req.body.discountAmount);
    if (req.body.discountType) combo.discountType = req.body.discountType;
    if (req.body.minOrderQty) combo.minOrderQty = Number(req.body.minOrderQty);
    if (req.body.comboStock !== undefined) combo.comboStock = Number(req.body.comboStock);
    if (req.body.status !== undefined) combo.status = req.body.status === 'true' || req.body.status === true;
    
    if (products && Array.isArray(products)) {
      combo.products = products.map(id => id);
    }

    // Update thumbnail if new file uploaded
    if (req.file) {
      combo.thumbnail = `/uploads/combos/${req.file.filename}`;
    }

    await combo.save();

    // Populate products for response
    const updatedCombo = await Combo.findById(combo._id)
      .populate('products', 'name unitPrice unit thumbnail category');

    res.json({ 
      success: true, 
      message: '✅ Combo Updated Successfully!', 
      data: updatedCombo 
    });
  } catch (err) {
    console.error('Update combo error:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message || 'Failed to update combo' 
    });
  }
});

// ============================================
// DELETE COMBO (Soft Delete)
// ============================================
router.delete('/:id', async (req, res) => {
  try {
    const combo = await Combo.findById(req.params.id);

    if (!combo) {
      return res.status(404).json({ 
        success: false, 
        message: 'Combo not found' 
      });
    }

    // Soft delete - set status to false
    combo.status = false;
    await combo.save();

    res.json({ 
      success: true, 
      message: '✅ Combo Deleted Successfully!' 
    });
  } catch (err) {
    console.error('Delete combo error:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message || 'Failed to delete combo' 
    });
  }
});

// ============================================
// UPDATE COMBO STATUS (Activate/Deactivate)
// ============================================
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    const combo = await Combo.findById(req.params.id);

    if (!combo) {
      return res.status(404).json({ 
        success: false, 
        message: 'Combo not found' 
      });
    }

    combo.status = status === 'true' || status === true;
    await combo.save();

    res.json({ 
      success: true, 
      message: `✅ Combo ${combo.status ? 'Activated' : 'Deactivated'} Successfully!`,
      data: combo 
    });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message || 'Failed to update status' 
    });
  }
});

// ============================================
// GET ACTIVE COMBOS ONLY (For Public/Frontend)
// ============================================
router.get('/active/list', async (req, res) => {
  try {
    const combos = await Combo.find({ status: true })
      .populate('products', 'name unitPrice unit thumbnail category brand')
      .sort({ createdAt: -1 });

    res.json({ 
      success: true, 
      data: combos 
    });
  } catch (err) {
    console.error('Get active combos error:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message || 'Failed to fetch active combos' 
    });
  }
});

// ============================================
// GET COMBO STATS (For Admin Dashboard)
// ============================================
router.get('/stats/overview', async (req, res) => {
  try {
    const totalCombos = await Combo.countDocuments();
    const activeCombos = await Combo.countDocuments({ status: true });
    const inactiveCombos = await Combo.countDocuments({ status: false });
    
    // Calculate average discount
    const allCombos = await Combo.find({ status: true });
    const avgDiscount = allCombos.length > 0 
      ? allCombos.reduce((sum, c) => sum + ((c.discountAmount / c.originalPrice) * 100 || 0), 0) / allCombos.length
      : 0;
    
    // Total savings
    const totalSavings = allCombos.reduce((sum, c) => sum + c.discountAmount, 0);

    res.json({ 
      success: true,
      data: {
        total: totalCombos,
        active: activeCombos,
        inactive: inactiveCombos,
        averageDiscount: Math.round(avgDiscount),
        totalSavings: totalSavings
      }
    });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message || 'Failed to fetch stats' 
    });
  }
});

module.exports = router;