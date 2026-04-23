const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Story = require("../models/Story");
const { protect } = require("../middleware/authMiddleware");

const storage = multer.diskStorage({
  destination: "public/uploads/stories/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Create Story
router.post("/add", protect, upload.single("image"), async (req, res) => {
  try {
    const { title, description } = req.body;
    const newStory = new Story({
      title,
      description: description || "",
      image: req.file ? `/uploads/stories/${req.file.filename}` : "",
    });
    await newStory.save();
    res
      .status(201)
      .json({ success: true, message: "Story Created! ✨", data: newStory });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get All Stories
router.get("/all", async (req, res) => {
  try {
    const stories = await Story.find()
      .populate("productId", "name thumbnail")
      .sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: stories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get Active Stories Only
router.get("/active", async (req, res) => {
  try {
    const stories = await Story.find({ status: true })
      .populate("productId", "name thumbnail")
      .sort({ order: 1 });
    res.json({ success: true, data: stories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get Single Story by ID
router.get("/:id", async (req, res) => {
  try {
    const story = await Story.findById(req.params.id).populate(
      "productId",
      "name thumbnail",
    );
    if (!story) {
      return res
        .status(404)
        .json({ success: false, message: "Story not found" });
    }
    res.json({ success: true, data: story });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update Story
router.put("/update/:id", protect, upload.single("image"), async (req, res) => {
  try {
    const { title, description, status } = req.body;
    const updateData = { title };

    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (req.file) {
      updateData.image = `/uploads/stories/${req.file.filename}`;
    }

    const updatedStory = await Story.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: "after" },
    );

    if (!updatedStory) {
      return res
        .status(404)
        .json({ success: false, message: "Story not found" });
    }

    res.json({
      success: true,
      message: "Story Updated! ✨",
      data: updatedStory,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete Story
router.delete("/delete/:id", protect, async (req, res) => {
  try {
    const deletedStory = await Story.findByIdAndDelete(req.params.id);

    if (!deletedStory) {
      return res
        .status(404)
        .json({ success: false, message: "Story not found" });
    }

    res.json({ success: true, message: "Story Deleted! 🗑️" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update Story Order
router.put("/reorder/:id", protect, async (req, res) => {
  try {
    const { order } = req.body;
    const updatedStory = await Story.findByIdAndUpdate(
      req.params.id,
      { order },
      { returnDocument: "after" },
    );

    if (!updatedStory) {
      return res
        .status(404)
        .json({ success: false, message: "Story not found" });
    }

    res.json({ success: true, message: "Order Updated!", data: updatedStory });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
