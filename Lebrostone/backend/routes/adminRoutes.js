const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();

// ✅ MODELS IMPORT
const Admin = require("../models/Admin");
const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");
const Category = require("../models/Category");

// =========================================================
// ✅ MISSING MIDDLEWARE ADDED HERE (Protect Function)
// =========================================================
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Token nikaalo ("Bearer <token>" se)
      token = req.headers.authorization.split(" ")[1];

      // Token Verify karo
      const decoded = jwt.verify(token, "super_secret_admin_key");

      // User ID ko request object me daal do
      req.admin = await Admin.findById(decoded.id).select("-password");

      // Agar master admin hai (database me nahi hai par token valid hai)
      if (!req.admin && decoded.id === "master_admin") {
        req.admin = { id: "master_admin", email: "admin@gmail.com" };
      }

      return next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

/* ================= 1. TEMPORARY REGISTER ROUTE ================= */
router.post("/temp-register", async (req, res) => {
  try {
    const email = "admin@gmail.com";
    const password = "Admin@123";
    const name = "Admin User";

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res
        .status(400)
        .json({ success: false, message: "Admin already exists!" });
    }

    const newAdmin = await Admin.create({
      email,
      password, // Model handles hashing on save
      name,
    });

    res.status(201).json({
      success: true,
      message: "New admin account created for admin@gmail.com!",
      admin: { email: newAdmin.email },
    });
  } catch (err) {
    res.status(400).json({ success: false, message: "Error: " + err.message });
  }
});

/* ================= 2. LOGIN ADMIN ================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Admin check DB me
    const admin = await Admin.findOne({ email });

    // MASTER LOGIN BACKDOOR (Agar DB me user udd gaya ho tab bhi login ho jaye)
    if (email === "admin@gmail.com" && password === "Admin@123") {
      const token = jwt.sign(
        { id: admin ? admin._id : "master_admin" },
        "super_secret_admin_key",
        { expiresIn: "24h" },
      );
      return res.json({
        success: true,
        message: "Master Login successful",
        token: token,
        adminId: admin ? admin._id : "master_admin",
      });
    }

    // Normal DB Check
    if (!admin) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: admin._id }, "super_secret_admin_key", {
      expiresIn: "24h",
    });

    res.json({
      success: true,
      message: "Login successful",
      token: token,
      adminId: admin._id,
    });
  } catch (error) {
    console.error("❌ LOGIN ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ================= 3. DASHBOARD STATS (PROTECTED) ================= */
router.get("/dashboard-stats", protect, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();

    const revenueResult = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$finalTotal" } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    const recentOrders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        totalProducts,
        totalOrders,
        totalUsers,
        totalRevenue,
        recentOrders,
      },
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ success: false, message: "Error fetching stats" });
  }
});

/* ================= 4. GET ALL PRODUCTS (PROTECTED) ================= */
router.get("/products", protect, async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category", "name")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: products });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching products" });
  }
});

/* ================= 5. GET ALL CATEGORIES (PROTECTED) ================= */
router.get("/categories", protect, async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json({ success: true, data: categories });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching categories" });
  }
});

module.exports = router;
