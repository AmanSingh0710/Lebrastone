const express = require('express');
const router = express.Router();
const Variant = require('../models/Variant');
const Product = require('../models/Product');

// --- 1. CREATE: Variant Save Karein ---
router.post('/add-variant', async (req, res) => {
  try {
    const newVariant = new Variant(req.body);
    const savedVariant = await newVariant.save();
    res.status(201).json({ message: "Variant added successfully!", data: savedVariant });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- 2. READ: Sabhi Variants aur unke Product details dekhein ---
router.get('/all-variants', async (req, res) => {
  try {
    // populate('productId', 'name') se hume product ka naam bhi mil jayega
    const variants = await Variant.find().populate('productId', 'name');
    res.json(variants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Dropdown ke liye products (Jo aapne pehle maanga tha)
router.get('/get-products', async (req, res) => {
  try {
    const products = await Product.find({}, 'name _id');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- 3. UPDATE: Kisi variant ko update karein ---
router.put('/update-variant/:id', async (req, res) => {
  try {
    const updatedVariant = await Variant.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { returnDocument: "after" } // updated data return karne ke liye
    );
    res.json({ message: "Variant updated!", data: updatedVariant });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- 4. DELETE: Variant ko delete karein ---
router.delete('/delete-variant/:id', async (req, res) => {
  try {
    await Variant.findByIdAndDelete(req.params.id);
    res.json({ message: "Variant deleted successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;