const mongoose = require("mongoose");

const storySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    image: { type: String, required: true },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    status: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Story", storySchema);
