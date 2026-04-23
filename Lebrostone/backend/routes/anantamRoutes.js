const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { protect } = require("../middleware/authMiddleware");
const Product = require("../models/Product");
const AnantamBanner = require("../models/AnantamBanner");

// Ensure upload directory exists
const bannerUploadDir = path.join(__dirname, "../public/uploads/banners");
if (!fs.existsSync(bannerUploadDir)) {
  fs.mkdirSync(bannerUploadDir, { recursive: true });
}

/* ==========================================
   1. BANNER CONFIGURATION (Multer)
========================================== */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, bannerUploadDir);
  },
  filename: (req, file, cb) => {
    // Fixed name taaki purana banner overwrite ho jaye
    cb(null, "anantam-main-banner" + path.extname(file.originalname));
  },
});

const upload = multer({ storage });
const BASE_URL =
  process.env.BASE_URL ||
  "https://lebrostonebackend4.lifeinfotechinstitute.com/";

// Multer configuration for banner images
const bannerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, bannerUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      "anantam-banner-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

const bannerUpload = multer({ storage: bannerStorage });

/* ==========================================
   2. ANANTAM BANNER CRUD API ROUTES
========================================== */

// GET All Anantam Banners (Public - only active ones)
router.get("/banners", async (req, res) => {
  try {
    const currentDate = new Date();
    const banners = await AnantamBanner.find({
      status: true,
      startDate: { $lte: currentDate },
      $or: [{ endDate: { $gte: currentDate } }, { endDate: null }],
    }).sort({ priority: -1, createdAt: -1 });

    res.json({ success: true, data: banners });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET All Banners (Admin - all statuses)
router.get("/banners/all", protect, async (req, res) => {
  try {
    const banners = await AnantamBanner.find().sort({ createdAt: -1 });
    res.json({ success: true, data: banners });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// CREATE New Anantam Banner (Admin Only)
router.post(
  "/banners",
  protect,
  bannerUpload.single("image"),
  async (req, res) => {
    try {
      const {
        title,
        subtitle,
        description,
        ctaText,
        seriesName,
        status,
        startDate,
        endDate,
        priority,
      } = req.body;

      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "Image is required" });
      }

      const imageUrl = `uploads/banners/${req.file.filename}`;

      const newBanner = new AnantamBanner({
        title,
        subtitle,
        description: description || "",
        imageUrl,
        ctaText: ctaText || "EXPLORE COLLECTION",
        seriesName: seriesName || "THE ANANTAM SERIES",
        status: status === "true" || status === true,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        priority: parseInt(priority) || 0,
      });

      const savedBanner = await newBanner.save();
      res
        .status(201)
        .json({
          success: true,
          data: savedBanner,
          message: "Anantam Banner created successfully!",
        });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
);

// UPDATE Anantam Banner (Admin Only)
router.put(
  "/banners/:id",
  protect,
  bannerUpload.single("image"),
  async (req, res) => {
    try {
      const {
        title,
        subtitle,
        description,
        ctaText,
        seriesName,
        status,
        startDate,
        endDate,
        priority,
      } = req.body;

      const updateData = {};
      if (title) updateData.title = title;
      if (subtitle) updateData.subtitle = subtitle;
      if (description !== undefined) updateData.description = description;
      if (ctaText) updateData.ctaText = ctaText;
      if (seriesName) updateData.seriesName = seriesName;
      if (status !== undefined)
        updateData.status = status === "true" || status === true;
      if (startDate) updateData.startDate = new Date(startDate);
      if (endDate) updateData.endDate = new Date(endDate);
      if (priority !== undefined) updateData.priority = parseInt(priority);

      if (req.file) {
        updateData.imageUrl = `uploads/banners/${req.file.filename}`;
      }

      const updatedBanner = await AnantamBanner.findByIdAndUpdate(
        req.params.id,
        updateData,
        { returnDocument: "after", runValidators: true },
      );

      if (!updatedBanner) {
        return res
          .status(404)
          .json({ success: false, message: "Banner not found" });
      }

      res.json({
        success: true,
        data: updatedBanner,
        message: "Anantam Banner updated successfully!",
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
);

// DELETE Anantam Banner (Admin Only)
router.delete("/banners/:id", protect, async (req, res) => {
  try {
    const deletedBanner = await AnantamBanner.findByIdAndDelete(req.params.id);

    if (!deletedBanner) {
      return res
        .status(404)
        .json({ success: false, message: "Banner not found" });
    }

    res.json({
      success: true,
      message: "Anantam Banner deleted successfully!",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET Single Banner (Public)
router.get("/banners/:id", async (req, res) => {
  try {
    const banner = await AnantamBanner.findById(req.params.id);

    if (!banner) {
      return res
        .status(404)
        .json({ success: false, message: "Banner not found" });
    }

    res.json({ success: true, data: banner });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Legacy Banner Routes (kept for backward compatibility)
router.get("/banner", (req, res) => {
  res.json({ success: true, url: `uploads/banners/anantam-main-banner.png` });
});

router.post("/banner-upload", protect, upload.single("banner"), (req, res) => {
  try {
    if (req.file) {
      const bannerUrl = `uploads/banners/${req.file.filename}`;
      res.json({
        success: true,
        url: bannerUrl,
        message: "Banner Updated! ✅",
      });
    } else {
      res.status(400).json({ success: false, message: "File missing ❌" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ==========================================
   3. PRODUCT COLLECTION ROUTES
========================================== */

// GET Selected Anantam Collection (Public)
router.get("/collection", async (req, res) => {
  try {
    const products = await Product.find({ is_anantam: true }).sort({
      updatedAt: -1,
    });
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ ADD THIS: Toggle Anantam Status Route
router.put("/anantam/:id", protect, async (req, res) => {
  try {
    const { is_anantam } = req.body;

    // Database mein product ka status update karein
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { is_anantam: is_anantam },
      { returnDocument: "after" },
    );

    if (!updatedProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, data: updatedProduct });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
