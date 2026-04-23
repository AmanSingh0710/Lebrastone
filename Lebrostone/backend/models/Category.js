const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  // Har category ek Brand se link hogi
  brand: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Brand', 
    required: false 
  },
  name: { 
    type: String, 
    required: true, 
    trim: true,
    unique: true 
  },
  image_url: { 
    type: String, 
    required: true 
  },
 
  priority: { 
    type: Number, 
    default: 0 
  },

  show_in_nav: { 
    type: Boolean, 
    default: false 
  },
}, { 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
});

module.exports = mongoose.model('Category', categorySchema);