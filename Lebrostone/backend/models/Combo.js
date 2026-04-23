const mongoose = require('mongoose');

const comboSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Combo name is required'],
    trim: true,
    minlength: [3, 'Combo name must be at least 3 characters'],
    maxlength: [100, 'Combo name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Combo description is required'],
    trim: true
  },
  // ✅ Array validation fixed to check total length
  products: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],
    validate: {
      validator: function(val) {
        return val && val.length >= 2;
      },
      message: 'Combo must contain at least 2 products'
    },
    required: [true, 'Products array is required']
  },
  comboPrice: {
    type: Number,
    required: [true, 'Combo price is required'],
    min: [0, 'Combo price cannot be negative']
  },
  originalPrice: {
    type: Number,
    required: [true, 'Original price is required'],
    min: [0, 'Original price cannot be negative']
  },
  discountAmount: { type: Number, default: 0 },
  discountType: { type: String, enum: ['Flat', 'Percent'], default: 'Flat' },
  minOrderQty: { type: Number, default: 1 },
  comboStock: { type: Number, default: 0 },
  thumbnail: { type: String, default: null },
  status: { type: Boolean, default: true }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ✅ Pre-save Middleware (Next Error Fixed using Async)
comboSchema.pre('save', async function() {
  if (this.originalPrice && this.comboPrice) {
    this.discountAmount = this.originalPrice - this.comboPrice;
  }
  if (this.comboPrice >= this.originalPrice) {
    this.discountAmount = 0;
  }
});

const Combo = mongoose.model('Combo', comboSchema);
module.exports = Combo;