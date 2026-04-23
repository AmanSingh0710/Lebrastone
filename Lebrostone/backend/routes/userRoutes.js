const express = require('express');
const router = express.Router();
const User = require('../models/User');

// 1. Sabhi users ko get karne ke liye (Admin Dashboard)
// Path: GET /api/user/all
router.get('/all', async (req, res) => {
  try {
    const users = await User.find()
      .populate('cart.productId') 
      .sort({ createdAt: -1 });
    res.status(200).json(users); 
  } catch (error) {
    res.status(500).json({ message: "Server error occurred", error: error.message });
  }
});

// 2. Single user ke liye (Cart fetch karne ke liye)
// Path: GET /api/user/:id
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('cart.productId') 
      .select('-password');
      
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. ✅ UPDATE Cart (Iske bina Cart se remove/update nahi hoga)
// Path: PUT /api/user/update-cart/:id
router.put('/update-cart/:id', async (req, res) => {
  try {
    const { cart } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { cart: cart },
      { returnDocument: "after" }
    ).populate('cart.productId');

    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. ✅ UPDATE Address
// Path: PUT /api/user/update-address/:id
router.put('/update-address/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const { address } = req.body; 

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { address: address },
      { returnDocument: "after" } 
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ 
      success: true, 
      message: "Address updated successfully", 
      data: updatedUser 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. ✅ UPDATE Profile
// Path: PUT /api/user/update-profile/:id
router.put('/update-profile/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, phone, address } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email, phoneNumber: phone, address },
      { returnDocument: "after" }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "Profile updated successfully", data: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// 5. ✅ DELETE User
router.delete('/delete-user/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 6. ✅ BLOCK User
// Path: PUT /api/user/block/:id
router.put('/block/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: true },
      { returnDocument: "after" }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, message: "User blocked successfully", data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 7. ✅ UNBLOCK User
// Path: PUT /api/user/unblock/:id
router.put('/unblock/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: false },
      { returnDocument: "after" }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, message: "User unblocked successfully", data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;