const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: "SubCategory" },
    subSubCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubSubCategory",
    },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
    productType: { type: String, default: "Physical" },
    sku: { type: String, unique: true },
    unit: { type: String, default: "kg" },
    unitPrice: { type: Number, required: true },
    mrp: { type: Number, default: 0 },
    selling_price: { type: Number, default: 0 },
    // Structured quantity information (backwards compatible)
    quantity: {
      value: { type: Number, default: 0 },
      unit: { type: String, default: "kg" }, // e.g., g, kg, ml, L, pc, pack
      type: {
        type: String,
        enum: ["weight", "volume", "count", "other"],
        default: "other",
      },
    },
    minOrderQty: { type: Number, default: 1 },
    currentStockQty: { type: Number, default: 0 },
    discountType: { type: String, default: "Flat" },
    discountAmount: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0 },
    thumbnail: { type: String }, // Image Path
    images: [String], // Additional Images
    // Feature images used inside product description (separate from gallery)
    featureImages: [
      {
        url: { type: String },
        order: { type: Number, default: 0 },
        alt: { type: String, default: "" },
      },
    ],
    // Variants for product (size/weight/pack variants)
    variants: [
      {
        // human-readable size/label (use v.size preferred, but keep title for legacy data)
        size: { type: String },
        title: { type: String }, // fallback for older entries
        weight: { type: String },
        sku: { type: String },
        price: { type: Number, default: 0 },
        selling_price: { type: Number, default: 0 },
        mrp: { type: Number, default: 0 },
        discountAmount: { type: Number, default: 0 },
        discountType: {
          type: String,
          enum: ["Flat", "Percent"],
          default: "Percent",
        },
        stockQty: { type: Number, default: 0 },
        isAvailable: { type: Boolean, default: true },
        thumbnail: { type: String, default: "" },
        images: [{ type: String }],
        // optional structured unit for the variant
        unitValue: { type: Number },
        unitMeasure: { type: String },
      },
    ],
    status: { type: Boolean, default: true },
    productTag: {
      type: String,
      enum: ["Simple", "Best Seller", "New Arrival"],
      default: "Simple",
    },
    promotion: {
      type: Boolean,
      default: false, // By default promotion deactive rahega
    },
    is_anantam: {
      type: Boolean,
      default: false,
    },
    concern: { type: String, trim: true },
    ingredients: [{ type: String, trim: true }],
    howToUse: { type: String, default: "" },
    is_bestseller: { type: Boolean, default: false },
    is_new_arrival: { type: Boolean, default: false },
    is_combo: { type: Boolean, default: false },
    included_products: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);
