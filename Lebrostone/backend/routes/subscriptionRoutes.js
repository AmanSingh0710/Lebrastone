
const express = require("express");
const router = express.Router();
const Subscriber = require("../models/subscriber");


// 🔹 POST — Save Email
router.post("/add", async (req, res) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check duplicate
    const exists = await Subscriber.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "Email already subscribed" });
    }

    const subscriber = new Subscriber({ email });
    await subscriber.save();

    res.status(201).json({
      message: "Subscribed successfully",
      data: subscriber,
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});


// 🔹 GET — Fetch All Emails
router.get("/getall", async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort({ createdAt: -1 });

    res.status(200).json({
      count: subscribers.length,
      data: subscribers,
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});


//delete a subscriber
router.delete("/delete/:id", async (req, res) => {
  try {
    await Subscriber.findByIdAndDelete(req.params.id);
    res.json({ message: "Subscriber deleted successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
