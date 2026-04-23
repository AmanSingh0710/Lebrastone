const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: { 
        type: String, 
        required: true, 
        unique: true, 
        uppercase: true, 
        trim: true 
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        default: 'fixed',
        required: true
    },
    discountValue: { 
        type: Number, 
        required: true 
    },
    // Product-specific: array of product IDs this coupon applies to
    applicableProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    minOrderAmount: { 
        type: Number, 
        default: 0 
    },
    startDate: { 
        type: Date, 
        required: true 
    },
    expiryDate: { 
        type: Date, 
        required: true 
    },
    isActive: { 
        type: Boolean, 
        default: true 
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Coupon', couponSchema);