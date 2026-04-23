const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

require("dotenv").config();

const app = express();

/* ===============================
   ENSURE UPLOAD DIRECTORIES
   =============================== */
const uploadDirs = [
  path.join(__dirname, "public/uploads/brands"),
  path.join(__dirname, "public/uploads/categories"),
  path.join(__dirname, "public/uploads/concerns"),
  path.join(__dirname, "public/uploads/ingredients"),
  path.join(__dirname, "public/uploads/offercontent"),
];

uploadDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Folder Created: ${dir}`);
  }
});

/* ===============================
   CORS CONFIG
   =============================== */
const allowedOrigins = [

  "https://lebrostone.lifeinfotechinstitute.com",
  "http://lebrostone.com",
  "http://www.lebrostone.com",
  "https://lebrostone.com",
  "https://www.lebrostone.com",

  "https://lebrostonebackend4.lifeinfotechinstitute.com",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5000",
  "http://localhost:5001",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5001",
];

// --- 1. CORS FIRST ---
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const isAllowed =
        allowedOrigins.includes(origin) ||
        origin.includes("localhost") ||
        origin.includes("127.0.0.1");

      if (isAllowed) callback(null, true);
      else callback(new Error("Not allowed by CORS"));
    },

    credentials: true,

    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-user-id",   // ⭐ IMPORTANT
    ],
  })
);

// --- 2. BODY PARSERS ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ===============================
   STATIC FILES (UPLOADS)
   =============================== */
// app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(
  "/uploads",
  express.static(path.join(__dirname, "public", "uploads")),
);
/* ===============================
   GOOGLE AUTH FIX (OPTIONAL)
   =============================== */
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});

/* ===============================
   DATABASE CONNECTION
   =============================== */
const dbURI = process.env.MONGO_URI;
if (!dbURI) {
  console.error("❌ MONGO_URI not found in .env");
  process.exit(1);
}

mongoose
  .connect(dbURI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => {
    console.error("MongoDB Connection Error ❌", err);
    process.exit(1);
  });

/* ===============================
   ROUTES
   =============================== */
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/admin/settings", require("./routes/adminSettingsRoutes"));
app.use("/api/admin/sliders", require("./routes/adminSlider"));
app.use("/api/admin/faqs", require("./routes/adminFAQ"));

app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/brands", require("./routes/brandRoutes"));

app.use("/api/subcategories", require("./routes/subCategoryRoutes"));
app.use("/api/subsubcategories", require("./routes/subSubCategoryRoutes"));

app.use("/api/seasons", require("./routes/seasonRoute"));
app.use("/api/anantam", require("./routes/anantamRoutes"));

app.use("/api/cart", require("./routes/cart"));
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/coupons", require("./routes/couponRoutes"));
app.use("/api", require("./routes/webSignUpRoute"));
app.use("/api/combos", require("./routes/comboRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/reels", require("./routes/reelRoutes"));
app.use("/api/blogs", require("./routes/blogRoutes"));
app.use("/api/stories", require("./routes/storyRoutes"));
app.use("/api/variants", require("./routes/variantRoute"));
app.use("/api/features", require("./routes/featureRoutes"));
app.use("/api/concerns", require("./routes/concernRoutes"));
app.use("/api/ingredients", require("./routes/ingredientRoutes"));
app.use("/api/offer-content", require("./routes/offerContentRoutes"));
app.use("/api/subscription", require("./routes/subscriptionRoutes"));

// Password Reset and Account Management Routes
app.use("/api/auth", require("./routes/passwordResetRoutes"));

// Support Ticket System Routes
app.use("/api/support", require("./routes/supportTicketRoutes"));

app.use("/api/pages", require("./routes/PageRoutes"));


app.get("/", (req, res) => {
  res.send("Lebrostone Backend is running 🚀");
});

/* ===============================
   START SERVER
   =============================== */
const PORT = process.env.PORT || 5001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
