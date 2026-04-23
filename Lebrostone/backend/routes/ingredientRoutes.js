const express = require('express');
const router = express.Router();
const Ingredient = require('../models/Ingredient');
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const ingredientUploadDir = path.join(__dirname, '../public/uploads/ingredients');
if (!fs.existsSync(ingredientUploadDir)) {
  fs.mkdirSync(ingredientUploadDir, { recursive: true });
}

// Configure multer for ingredient images
const ingredientStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, ingredientUploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, 'ingredient-' + Date.now() + path.extname(file.originalname));
  }
});

const ingredientUpload = multer({ storage: ingredientStorage });

// GET all ingredients (public - for client)
router.get('/', async (req, res) => {
  try {
    const ingredients = await Ingredient.find({ status: true })
      .populate('products', 'name images unitPrice mrp selling_price')
      .sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: ingredients });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET all ingredients with all products (admin)
router.get('/all', protect, async (req, res) => {
  try {
    const ingredients = await Ingredient.find()
      .populate('products', 'name images unitPrice mrp selling_price category')
      .sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: ingredients });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single ingredient
router.get('/:id', async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id)
      .populate('products', 'name images unitPrice mrp selling_price category');
    if (!ingredient) {
      return res.status(404).json({ success: false, message: 'Ingredient not found' });
    }
    res.json({ success: true, data: ingredient });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// CREATE ingredient (admin)
router.post('/', protect, ingredientUpload.single('image'), async (req, res) => {
  try {
    const { title, products, status, order } = req.body;
    
    const ingredient = new Ingredient({
      title,
      image: req.file ? `/uploads/ingredients/${req.file.filename}` : '',
      products: products ? JSON.parse(products) : [],
      status: status === 'true' || status === true,
      order: order || 0
    });
    
    await ingredient.save();
    await ingredient.populate('products', 'name images unitPrice mrp selling_price');
    
    res.status(201).json({
      success: true,
      message: 'Ingredient created successfully!',
      data: ingredient
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// UPDATE ingredient (admin)
router.put('/:id', protect, ingredientUpload.single('image'), async (req, res) => {
  try {
    const { title, products, status, order } = req.body;
    
    const ingredient = await Ingredient.findById(req.params.id);
    if (!ingredient) {
      return res.status(404).json({ success: false, message: 'Ingredient not found' });
    }
    
    ingredient.title = title || ingredient.title;
    if (status !== undefined) {
      ingredient.status = status === 'true' || status === true;
    }
    ingredient.order = order || ingredient.order;
    
    if (req.file) {
      ingredient.image = `/uploads/ingredients/${req.file.filename}`;
    }
    
    if (products) {
      ingredient.products = JSON.parse(products);
    }
    
    await ingredient.save();
    await ingredient.populate('products', 'name images unitPrice mrp selling_price');
    
    res.json({
      success: true,
      message: 'Ingredient updated successfully!',
      data: ingredient
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// TOGGLE ingredient status (admin)
router.put('/:id/toggle', protect, async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);
    if (!ingredient) {
      return res.status(404).json({ success: false, message: 'Ingredient not found' });
    }
    
    ingredient.status = !ingredient.status;
    await ingredient.save();
    
    res.json({
      success: true,
      message: `Ingredient is now ${ingredient.status ? 'Active' : 'Inactive'}`,
      data: ingredient
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE ingredient (admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const ingredient = await Ingredient.findByIdAndDelete(req.params.id);
    if (!ingredient) {
      return res.status(404).json({ success: false, message: 'Ingredient not found' });
    }
    
    res.json({
      success: true,
      message: 'Ingredient deleted successfully!'
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
