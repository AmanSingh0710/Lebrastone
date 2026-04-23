const express = require("express");
const router = express.Router();
const User = require("../models/User");

// 1. Manual Sign-Up Route (YEH NAYA ADD KIYA HAI)
router.post("/manual-signup", async (req, res) => {
  try {
    const { name, email, phoneNumber, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Create new user
    user = new User({
      name,
      email,
      phoneNumber,
      password, // Model handles hashing on save
      address: { houseNo: "", nearby: "", city: "", state: "", pincode: "" },
    });

    await user.save();
    res
      .status(201)
      .json({ success: true, message: "User registered successfully", user });
  } catch (err) {
    console.error("Signup Error:", err);
    res
      .status(500)
      .json({
        success: false,
        message: "Server Error during signup",
        error: err.message,
      });
  }
});

// 2. Manual Login Route - Login with Mobile Number
router.post("/login", async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;

    // Find user by phoneNumber
    const user = await User.findOne({ phoneNumber });

    // Check for user existence and password match
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid Mobile Number or Password" });
    }

    const isMatched = await user.comparePassword(password);

    if (!isMatched) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid Mobile Number or Password" });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked. Please contact admin.",
      });
    }

    res.status(200).json({ success: true, user, token: "dummy-token" });
  } catch (err) {
    console.error("Login Error:", err);
    res
      .status(500)
      .json({
        success: false,
        message: "Server Error during login",
        error: err.message,
      });
  }
});

// 3. Google Auth Route
router.post("/google-auth", async (req, res) => {
  const { email, name, sub, picture } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        name,
        email,
        googleId: sub,
        picture,
        address: { houseNo: "", nearby: "", city: "", state: "", pincode: "" },
      });
      await user.save();
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked. Please contact admin.",
      });
    }

    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error("Google Auth Error:", err);
    res
      .status(500)
      .json({
        success: false,
        message: "Server Error during Google Auth",
        error: err.message,
      });
  }
});

module.exports = router;
