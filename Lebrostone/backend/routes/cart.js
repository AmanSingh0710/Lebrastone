const express = require("express");
const router = express.Router();
const User = require("../models/User");

// ✅ ADD TO CART ROUTE
router.post("/add", async (req, res) => {
  try {
    const { userId, productId, variantId, quantity, price, name, image } =
      req.body;

    // 1. User find karein
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // 2. Check duplicate (Same Product + Same Variant)
    const existingItemIndex = user.cart.findIndex(
      (item) =>
        item &&
        item.productId &&
        item.variantId &&
        item.productId.toString() === productId &&
        item.variantId.toString() === variantId,
    );

    if (existingItemIndex > -1) {
      // Quantity update karein
      user.cart[existingItemIndex].quantity =
        (Number(user.cart[existingItemIndex].quantity) || 0) + Number(quantity);
    } else {
      // Naya item add karein
      user.cart.push({
        productId,
        variantId,
        quantity: Number(quantity),
        price,
        name,
        image,
      });
    }

    await user.save();
    res
      .status(200)
      .json({ success: true, message: "Cart Updated!", cart: user.cart });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
});

module.exports = router;
