const express = require('express');
const router = express.Router();
const ProductFeature = require('../models/ProductFeature');

// --- 1. SAVE / UPDATE ---
router.post('/save', async (req, res) => {
    const { productId, features, ingredients, howToUse } = req.body;
    try {
        const data = await ProductFeature.findOneAndUpdate(
            { productId }, 
            { features, ingredients, howToUse },
            { upsert: true, returnDocument: "after" }
        );
        res.json({ success: true, message: "Data saved successfully!", data });
    } catch (err) { 
        res.status(400).json({ success: false, message: err.message }); 
    }
});

// --- 2. GET BY PRODUCT ID ---
router.get('/:productId', async (req, res) => {
    try {
        const details = await ProductFeature.findOne({ productId: req.params.productId });
        if (!details) {
            return res.status(200).json({ features: [], ingredients: [], howToUse: "" });
        }
        res.json(details);
    } catch (err) { 
        res.status(500).json({ message: err.message }); 
    }
});

// --- 3. DELETE ---
router.delete('/:productId', async (req, res) => {
    try {
        await ProductFeature.findOneAndDelete({ productId: req.params.productId });
        res.json({ success: true, message: "Deleted successfully!" });
    } catch (err) { 
        res.status(500).json({ success: false, message: err.message }); 
    }
});

// --- GET ALL FEATURES WITH PRODUCT DETAILS ---
router.get('/all/list', async (req, res) => {
    try {
        // Isse product details (name, sku, unitPrice) bhi specs ke saath mil jayenge
        const allSpecs = await ProductFeature.find().populate('productId', 'name sku unitPrice currentStockQty unit');
        res.json({ success: true, data: allSpecs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;