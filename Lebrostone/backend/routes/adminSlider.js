const express = require("express");
const fs = require("fs");
const path = require("path");
const Slider = require("../models/Slider");
const upload = require("../middleware/upload");

const router = express.Router();

/* ================= GET (List + Search + Pagination) ================= */
router.get("/", async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;

    const query = {};
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const sliders = await Slider.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Slider.countDocuments(query);

    res.json({ success: true, sliders, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ================= CREATE ================= */
router.post(
  "/",
  (req, res, next) => {
    req.uploadPath = "uploads/sliders";
    next();
  },
  upload.single("image"),
  async (req, res) => {
    try {
      const { title, status, productId, type } = req.body;

      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "Image is required" });
      }

      const imageUrl = `uploads/sliders/${req.file.filename}`;

      const slider = await Slider.create({
        title,
        image: imageUrl,
        status: status === "true" || status === true,
        productID: productId || "",
        type: type || "desktop",
      });

      res.status(201).json({ success: true, slider });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },
);

/* ================= UPDATE ================= */
router.put(
  "/:id",
  (req, res, next) => {
    req.uploadPath = "uploads/sliders";
    next();
  },
  upload.single("image"),
  async (req, res) => {
    try {
      const slider = await Slider.findById(req.params.id);
      if (!slider) {
        return res.status(404).json({ success: false, message: "Not found" });
      }

      // New image uploaded?
      if (req.file) {
        // delete old image
        if (slider.image) {
          try {
            const uploadDir = slider.image.includes("uploads/") 
              ? slider.image.split("uploads/")[1] 
              : null;
            
            if (uploadDir) {
              const oldPath = path.join(
                __dirname,
                "..",
                "public",
                "uploads",
                uploadDir,
              );
              if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
              }
            }
          } catch (error) {
            console.error("Error deleting old image:", error);
          }
        }

        slider.image = `uploads/sliders/${req.file.filename}`;
      }

      slider.title = req.body.title || slider.title;
      slider.status =
        req.body.status === "true" ||
        req.body.status === true ||
        req.body.status === "false"
          ? req.body.status === "true" || req.body.status === true
          : slider.status;
      slider.productID = req.body.productId || slider.productID;
      slider.type = req.body.type || slider.type;

      await slider.save();

      res.json({ success: true, slider });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },
);

/* ================= DELETE ================= */
router.delete("/:id", async (req, res) => {
  try {
    const slider = await Slider.findById(req.params.id);
    if (!slider) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    if (slider.image) {
      try {
        const uploadDir = slider.image.includes("uploads/") 
          ? slider.image.split("uploads/")[1] 
          : null;
        
        if (uploadDir) {
          const imgPath = path.join(
            __dirname,
            "..",
            "public",
            "uploads",
            uploadDir,
          );
          if (fs.existsSync(imgPath)) {
            fs.unlinkSync(imgPath);
          }
        }
      } catch (error) {
        console.error("Error deleting image:", error);
      }
    }

    await slider.deleteOne();
    res.json({ success: true, message: "Slider deleted" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
