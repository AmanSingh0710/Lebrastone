const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const User = require("../models/User");

// 1. Place New Order
router.post("/place", async (req, res) => {
  try {
    let {
      userId,
      guestName,
      guestPhone,
      products,
      subTotal,
      discount,
      finalTotal,
      address,
    } = req.body;

    // --- AUTO-REGISTRATION FOR GUESTS ---
    if (!userId && guestPhone) {
      // Find by phone
      let userByPhone = await User.findOne({ phoneNumber: guestPhone });

      if (!userByPhone) {
        // New guest registration
        userByPhone = new User({
          name: guestName,
          email: `${guestPhone}@guest.lebrostone.com`,
          phoneNumber: guestPhone,
          password: guestPhone, // Default pass is phone
          address: address,
        });
        await userByPhone.save();
      } else {
        // Re-link if phone exists
        if (!userByPhone.address?.city) {
          userByPhone.address = address;
          await userByPhone.save();
        }
      }
      userId = userByPhone._id;
    }

    const newOrder = new Order({
      user: userId || null,
      guestName: userId ? "" : guestName,
      guestPhone: userId ? "" : guestPhone,
      products,
      subTotal,
      discount,
      finalTotal,
      shippingAddress: address,
    });

    await newOrder.save();

    // ONLY clear cart if user is logged in
    if (userId) {
      await User.findByIdAndUpdate(userId, { cart: [] });
    }

    res.status(201).json({
      success: true,
      message: "Order Placed!",
      orderId: newOrder._id,
      isNewUser: !req.body.userId, // Flag for frontend
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. Admin: Update Delivery Status
router.put("/update-status/:id", async (req, res) => {
  try {
    const { status } = req.body;
    await Order.findByIdAndUpdate(req.params.id, { deliveryStatus: status });
    res.json({ success: true, message: "Delivery Status Updated!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Database mein is userId se jude saare orders dhoondna
    const orders = await Order.find({ user: userId }).sort({ orderDate: -1 });

    if (!orders) {
      return res
        .status(404)
        .json({ success: false, message: "No orders found for this user" });
    }

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/all", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email phoneNumber")
      .sort({ orderDate: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Delete order record
router.delete("/delete/:id", async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Order deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
