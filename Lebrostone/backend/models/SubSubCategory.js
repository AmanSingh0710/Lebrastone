const mongoose = require('mongoose');

const subSubCategorySchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, "Sub Sub Category name is required"], 
        trim: true 
    },
    mainCategory: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Category', 
        required: true 
    },
    subCategory: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'SubCategory', 
        required: true 
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

module.exports = mongoose.model('SubSubCategory', subSubCategorySchema);