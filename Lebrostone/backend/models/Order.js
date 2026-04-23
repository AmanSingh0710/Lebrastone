const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  guestName: { type: String },
  guestPhone: { type: String },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      name: String,
      quantity: Number,
      price: Number,
      image: String,
      variantId: String,
    },
  ],
  subTotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  finalTotal: { type: Number, required: true },
  shippingAddress: {
    houseNo: String,
    nearby: String,
    city: String,
    state: String,
    pincode: String,
  },
  // Coupon information
  coupon: {
    code: { type: String },
    discountType: { type: String, enum: ["percentage", "fixed"] },
    discountValue: { type: Number },
    totalDiscount: { type: Number },
  },
  paymentStatus: { type: String, default: "Pending" },
  deliveryStatus: {
    type: String,
    enum: ["Pending", "Shipped", "Delivered", "Cancelled"],
    default: "Pending",
  },
  orderDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);
