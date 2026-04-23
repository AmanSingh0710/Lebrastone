const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, "Sub Category name is required"], 
        trim: true 
    },
    // Optional rakha hai taaki baad mein assign kar sakein
    mainCategory: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Category', 
        default: null 
    },
    brand: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Brand', 
        default: null 
    },
    priority: { 
        type: Number, 
        default: 0 
    },
    status: { 
        type: Boolean, 
        default: true 
    }
}, { timestamps: true });

module.exports = mongoose.model('SubCategory', subCategorySchema);