const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const {
  generateOTP,
  sendPasswordResetOTP,
  sendMobileChangeOTP,
} = require("../utils/emailService");

// 1. Forgot Password - Send OTP to email
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email",
      });
    }

    // Generate OTP
    const otp = generateOTP();

    // Hash OTP for security
    const hashedOTP = await bcrypt.hash(otp, 12);

    // Set expiration time (10 minutes)
    const expires = Date.now() + 10 * 60 * 1000;

    // Save OTP and expiration to user document
    user.resetPasswordToken = hashedOTP;
    user.resetPasswordExpires = expires;
    await user.save();

    // Send OTP via email
    const emailResult = await sendPasswordResetOTP(email, otp);

    if (emailResult.success) {
      res.json({
        success: true,
        message: "OTP sent to your email address",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to send OTP email",
      });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// 2. Verify Password Reset OTP
router.post("/verify-reset-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate inputs
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if OTP exists and not expired
    if (!user.resetPasswordToken || !user.resetPasswordExpires) {
      return res.status(400).json({
        success: false,
        message: "No OTP request found",
      });
    }

    if (Date.now() > user.resetPasswordExpires) {
      // Clear expired OTP
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    // Verify OTP
    const isValid = await bcrypt.compare(otp, user.resetPasswordToken);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    res.json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// 3. Reset Password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Validate inputs
    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP, and new password are required",
      });
    }

    // Password strength validation
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check OTP validity
    if (!user.resetPasswordToken || !user.resetPasswordExpires) {
      return res.status(400).json({
        success: false,
        message: "No valid OTP request found",
      });
    }

    if (Date.now() > user.resetPasswordExpires) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    // Verify OTP
    const isValid = await bcrypt.compare(otp, user.resetPasswordToken);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Update password and clear OTP fields
    user.password = newPassword; // Model handles hashing on save
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// 4. Request Mobile Number Change - Send OTP
router.post("/request-mobile-change", async (req, res) => {
  try {
    const { email, newPhoneNumber } = req.body;

    // Validate inputs
    if (!email || !newPhoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Email and new phone number are required",
      });
    }

    // Validate phone number format
    if (!/^[0-9]{10}$/.test(newPhoneNumber)) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be 10 digits",
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if new number is same as current
    if (user.phoneNumber === newPhoneNumber) {
      return res.status(400).json({
        success: false,
        message: "New phone number is same as current number",
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const hashedOTP = await bcrypt.hash(otp, 12);
    const expires = Date.now() + 10 * 60 * 1000;

    // Save OTP details
    user.mobileChangeOTP = hashedOTP;
    user.mobileChangeOTPExpires = expires;
    user.pendingPhoneNumber = newPhoneNumber;
    await user.save();

    // Send OTP via email
    const emailResult = await sendMobileChangeOTP(email, otp);

    if (emailResult.success) {
      res.json({
        success: true,
        message: "OTP sent to your email for mobile number verification",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to send OTP email",
      });
    }
  } catch (error) {
    console.error("Mobile change request error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// 5. Verify Mobile Change OTP
router.post("/verify-mobile-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.mobileChangeOTP || !user.mobileChangeOTPExpires) {
      return res.status(400).json({
        success: false,
        message: "No mobile change request found",
      });
    }

    if (Date.now() > user.mobileChangeOTPExpires) {
      // Clear expired data
      user.mobileChangeOTP = undefined;
      user.mobileChangeOTPExpires = undefined;
      user.pendingPhoneNumber = undefined;
      await user.save();

      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    const isValid = await bcrypt.compare(otp, user.mobileChangeOTP);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Update phone number and clear OTP fields
    user.phoneNumber = user.pendingPhoneNumber;
    user.mobileChangeOTP = undefined;
    user.mobileChangeOTPExpires = undefined;
    user.pendingPhoneNumber = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Mobile number updated successfully",
    });
  } catch (error) {
    console.error("Verify mobile OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
