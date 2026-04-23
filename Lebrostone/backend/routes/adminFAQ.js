const express = require('express');
const router = express.Router();
const Faq = require('../models/Faq');
const Product = require('../models/Product');
const Category = require('../models/Category');

// 1. Categories fetch (URL: /api/admin/faqs/categories)
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ message: "Error fetching categories" });
  }
});

// 2. Selected Category ke Products fetch (URL: /api/admin/faqs/products)
router.get('/products', async (req, res) => {
  try {
    const { category } = req.query;
    const products = await Product.find({ category_id: category });
    res.json({ products });
  } catch (err) {
    res.status(500).json({ message: "Error fetching products" });
  }
});

// 3. Selected Product ke FAQs fetch (URL: /api/admin/faqs)
router.get('/', async (req, res) => {
  try {
    const { productId } = req.query;
    const faqs = await Faq.find({ productId }).sort({ createdAt: -1 });
    res.json({ faqs });
  } catch (err) {
    res.status(500).json({ message: "Error fetching FAQs" });
  }
});

// 4. Naya FAQ add karein (URL: /api/admin/faqs)
router.post('/', async (req, res) => {
  try {
    const { question, answer, productId } = req.body;
    const newFaq = new Faq({ question, answer, productId });
    await newFaq.save();
    res.status(201).json({ success: true, faq: newFaq });
  } catch (err) {
    res.status(400).json({ message: "Error saving FAQ" });
  }
});

// 5. FAQ Delete karein (URL: /api/admin/faqs/:id)
router.delete('/:id', async (req, res) => {
  try {
    const deletedFaq = await Faq.findByIdAndDelete(req.params.id);
    if (!deletedFaq) return res.status(404).json({ message: "FAQ not found" });
    res.status(200).json({ message: "FAQ deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;