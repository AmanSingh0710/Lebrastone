const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const { protect } = require("../middleware/authMiddleware");

// 1. Get Admin Profile
router.get("/profile", protect, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select("-password");
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.json({
      success: true,
      data: admin,
    });
  } catch (error) {
    console.error("Get admin profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// 2. Update Admin Email
router.put("/update-email", protect, async (req, res) => {
  try {
    const { newEmail, password } = req.body;

    // Validate inputs
    if (!newEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "New email and current password are required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Find admin
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Verify current password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Check if email already exists
    const existingAdmin = await Admin.findOne({ email: newEmail });
    if (
      existingAdmin &&
      existingAdmin._id.toString() !== admin._id.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "Email is already in use",
      });
    }

    // Update email
    admin.email = newEmail;
    await admin.save();

    // Return updated admin without password
    const updatedAdmin = await Admin.findById(admin._id).select("-password");

    res.json({
      success: true,
      message: "Email updated successfully",
      data: updatedAdmin,
    });
  } catch (error) {
    console.error("Update email error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// 3. Update Admin Password
router.put("/update-password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate inputs
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    // Password strength validation
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    // Find admin
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Verify current password
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password (model handles hashing on save)
    admin.password = newPassword;
    await admin.save();

    res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Update password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// 4. Update Admin Profile (Email and Password together)
router.put("/update-profile", protect, async (req, res) => {
  try {
    const { newEmail, currentPassword, newPassword } = req.body;

    // Must provide at least one field to update
    if (!newEmail && !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide email or password to update",
      });
    }

    // Find admin
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Verify current password for any changes
    if (!currentPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password is required for profile updates",
      });
    }

    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update email if provided
    if (newEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newEmail)) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid email address",
        });
      }

      // Check if email already exists
      const existingAdmin = await Admin.findOne({ email: newEmail });
      if (
        existingAdmin &&
        existingAdmin._id.toString() !== admin._id.toString()
      ) {
        return res.status(400).json({
          success: false,
          message: "Email is already in use",
        });
      }

      admin.email = newEmail;
    }

    // Update password if provided
    if (newPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "New password must be at least 6 characters long",
        });
      }

      admin.password = newPassword; // Model handles hashing on save
    }

    await admin.save();

    // Return updated admin without password
    const updatedAdmin = await Admin.findById(admin._id).select("-password");

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedAdmin,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
