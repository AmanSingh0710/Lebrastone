const express = require('express');
const router = express.Router();
const OfferContent = require('../models/OfferContent');
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const offerUploadDir = path.join(__dirname, '../public/uploads/offercontent');
if (!fs.existsSync(offerUploadDir)) {
  fs.mkdirSync(offerUploadDir, { recursive: true });
}

// Configure multer for offer content images
const offerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, offerUploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, 'offer-' + Date.now() + path.extname(file.originalname));
  }
});

const offerUpload = multer({ storage: offerStorage });

// GET all offer content (public - for client)
router.get('/', async (req, res) => {
  try {
    const offers = await OfferContent.find({ status: true })
      .populate('productId', 'name images unitPrice mrp selling_price');
    res.json({ success: true, data: offers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET offer content by type (public)
router.get('/type/:type', async (req, res) => {
  try {
    const offer = await OfferContent.findOne({ 
      type: req.params.type,
      status: true 
    }).populate('productId', 'name images unitPrice mrp selling_price');
    
    if (!offer) {
      return res.json({ success: true, data: null });
    }
    res.json({ success: true, data: offer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET all offer content (admin)
router.get('/all', protect, async (req, res) => {
  try {
    const offers = await OfferContent.find()
      .populate('productId', 'name images unitPrice mrp selling_price')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: offers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single offer content
router.get('/:id', async (req, res) => {
  try {
    const offer = await OfferContent.findById(req.params.id)
      .populate('productId', 'name images unitPrice mrp selling_price');
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer content not found' });
    }
    res.json({ success: true, data: offer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// CREATE or UPDATE offer content (admin)
router.post('/', protect, offerUpload.single('image'), async (req, res) => {
  try {
    const { type, title, description, productId, ctaText, status } = req.body;
    
    // Check if offer with this type already exists
    let offer = await OfferContent.findOne({ type });
    
    if (offer) {
      // Update existing
      offer.title = title || offer.title;
      offer.description = description !== undefined ? description : offer.description;
      offer.ctaText = ctaText || offer.ctaText;
      if (status !== undefined) {
        offer.status = status === 'true' || status === true;
      }
      if (req.file) {
        offer.image = `/uploads/offercontent/${req.file.filename}`;
      }
      if (productId) {
        offer.productId = productId;
      }
    } else {
      // Create new
      offer = new OfferContent({
        type,
        title,
        description: description || '',
        image: req.file ? `/uploads/offercontent/${req.file.filename}` : '',
        productId: productId || null,
        ctaText: ctaText || 'Shop Now',
        status: status === 'true' || status === true
      });
    }
    
    await offer.save();
    await offer.populate('productId', 'name images unitPrice mrp selling_price');
    
    res.status(201).json({
      success: true,
      message: 'Offer content saved successfully!',
      data: offer
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// UPDATE offer content (admin)
router.put('/:id', protect, offerUpload.single('image'), async (req, res) => {
  try {
    const { title, description, productId, ctaText, status } = req.body;
    
    const offer = await OfferContent.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer content not found' });
    }
    
    offer.title = title || offer.title;
    offer.description = description !== undefined ? description : offer.description;
    offer.ctaText = ctaText || offer.ctaText;
    if (status !== undefined) {
      offer.status = status === 'true' || status === true;
    }
    
    if (req.file) {
      offer.image = `/uploads/offercontent/${req.file.filename}`;
    }
    
    if (productId) {
      offer.productId = productId;
    }
    
    await offer.save();
    await offer.populate('productId', 'name images unitPrice mrp selling_price');
    
    res.json({
      success: true,
      message: 'Offer content updated successfully!',
      data: offer
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE offer content (admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const offer = await OfferContent.findByIdAndDelete(req.params.id);
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer content not found' });
    }
    
    res.json({
      success: true,
      message: 'Offer content deleted successfully!'
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// TOGGLE offer status (admin)
router.put('/:id/toggle', protect, async (req, res) => {
  try {
    const offer = await OfferContent.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer content not found' });
    }
    
    offer.status = !offer.status;
    await offer.save();
    
    res.json({
      success: true,
      message: `Offer is now ${offer.status ? 'Active' : 'Inactive'}`,
      data: offer
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
