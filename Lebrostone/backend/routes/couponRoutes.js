const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');

// ✅ 1. Naya Coupon Create karein (Product-specific support)
router.post('/add', async (req, res) => {
    try {
        const { 
            code, 
            discountType, 
            discountValue, 
            applicableProducts, 
            minOrderAmount, 
            startDate, 
            expiryDate 
        } = req.body;

        const newCoupon = new Coupon({
            code: code.toUpperCase(),
            discountType,
            discountValue,
            applicableProducts: applicableProducts || [], // Array of product IDs
            minOrderAmount: minOrderAmount || 0,
            startDate,
            expiryDate,
            isActive: true
        });

        await newCoupon.save();
        res.status(201).json({ success: true, data: newCoupon });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// ✅ 2. Saare Coupons fetch karein
router.get('/all', async (req, res) => {
    try {
        const coupons = await Coupon.find()
            .populate('applicableProducts', 'name')
            .sort({ createdAt: -1 });
        res.status(200).json(coupons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ 3. Coupon delete karein
router.delete('/delete/:id', async (req, res) => {
    try {
        const deleted = await Coupon.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ success: false, message: "Coupon not found" });
        res.status(200).json({ success: true, message: "Coupon deleted!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ 4. Apply Coupon (Product-specific validation)
router.post('/apply', async (req, res) => {
    try {
        const { code, cartItems } = req.body;
        
        // Find coupon by code
        const coupon = await Coupon.findOne({ code: code.toUpperCase() });
        
        // Generic error message for all validation failures
        const INVALID_COUPON_MSG = "Invalid coupon";
        
        if (!coupon) {
            return res.status(400).json({ 
                success: false, 
                message: INVALID_COUPON_MSG 
            });
        }
        
        // Check if coupon is active
        if (!coupon.isActive) {
            return res.status(400).json({ 
                success: false, 
                message: INVALID_COUPON_MSG 
            });
        }
        
        // Check date range
        const now = new Date();
        if (now < new Date(coupon.startDate)) {
            return res.status(400).json({ 
                success: false, 
                message: INVALID_COUPON_MSG 
            });
        }
        if (now > new Date(coupon.expiryDate)) {
            return res.status(400).json({ 
                success: false, 
                message: INVALID_COUPON_MSG 
            });
        }
        
        // Calculate discount based on applicable products
        let totalDiscount = 0;
        let applicableTotal = 0;
        const applicableItems = [];
        
        // If no specific products defined, apply to all
        const hasSpecificProducts = coupon.applicableProducts && coupon.applicableProducts.length > 0;
        
        cartItems.forEach(item => {
            const productId = item.productId?._id || item.productId;
            const isApplicable = !hasSpecificProducts || 
                coupon.applicableProducts.some(id => id.toString() === productId.toString());
            
            if (isApplicable) {
                const itemTotal = item.price * item.quantity;
                applicableTotal += itemTotal;
                
                let itemDiscount = 0;
                if (coupon.discountType === 'percentage') {
                    itemDiscount = (itemTotal * coupon.discountValue) / 100;
                } else {
                    // Fixed discount - distribute proportionally if needed
                    itemDiscount = Math.min(coupon.discountValue, itemTotal);
                }
                
                totalDiscount += itemDiscount;
                applicableItems.push({
                    productId,
                    name: item.name,
                    quantity: item.quantity,
                    itemTotal,
                    discount: itemDiscount
                });
            }
        });
        
        // Check minimum order amount for applicable items
        if (applicableTotal < coupon.minOrderAmount) {
            return res.status(400).json({ 
                success: false, 
                message: INVALID_COUPON_MSG 
            });
        }
        
        // If no applicable items found
        if (applicableItems.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: INVALID_COUPON_MSG 
            });
        }
        
        res.status(200).json({
            success: true,
            message: "Coupon applied successfully",
            data: {
                coupon: {
                    code: coupon.code,
                    discountType: coupon.discountType,
                    discountValue: coupon.discountValue
                },
                applicableItems,
                applicableTotal,
                totalDiscount: Math.round(totalDiscount * 100) / 100,
                discountMessage: coupon.discountType === 'percentage' 
                    ? `${coupon.discountValue}% off on applicable items`
                    : `₹${coupon.discountValue} off on applicable items`
            }
        });
        
    } catch (error) {
        res.status(500).json({ success: false, message: "Invalid coupon" });
    }
});

// ✅ 5. Update Coupon
router.put('/update/:id', async (req, res) => {
    try {
        const { 
            code, 
            discountType, 
            discountValue, 
            applicableProducts, 
            minOrderAmount, 
            startDate, 
            expiryDate,
            isActive 
        } = req.body;
        
        const updated = await Coupon.findByIdAndUpdate(
            req.params.id,
            {
                code: code?.toUpperCase(),
                discountType,
                discountValue,
                applicableProducts,
                minOrderAmount,
                startDate,
                expiryDate,
                isActive
            },
            { returnDocument: "after" }
        );
        
        if (!updated) {
            return res.status(404).json({ success: false, message: "Coupon not found" });
        }
        
        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;