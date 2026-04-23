const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { protect } = require("../middleware/authMiddleware");
const Product = require("../models/Product");
const Settings = require("../models/Settings");

/* =========================
    MULTER CONFIG
========================= */
const storage = multer.diskStorage({
  destination: "public/uploads/products/",
  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname),
    );
  },
});

// Ensure banner upload directory exists
const bannerUploadDir = path.join(__dirname, "../public/uploads/banners");
if (!fs.existsSync(bannerUploadDir)) {
  fs.mkdirSync(bannerUploadDir, { recursive: true });
}

const bannerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, bannerUploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, "anantam-main-banner" + path.extname(file.originalname));
  },
});

const upload = multer({ storage }).any();
const bannerUpload = multer({ storage: bannerStorage });

const BASE_URL =
  process.env.BASE_URL ||
  "https://lebrostonebackend4.lifeinfotechinstitute.com/";

// Helper to transform URL based on request (localhost vs production)
const transformUrl = (url, req) => {
  if (!url) return url;

  // Check if request is from localhost via various headers
  const origin = req.get("origin") || req.get("referer") || "";
  const host = req.get("host") || "";
  const isLocalhost =
    origin.includes("localhost") ||
    host.includes("localhost") ||
    origin.includes("127.0.0.1");

  if (isLocalhost && url.includes("lifeinfotechinstitute.com")) {
    return url.replace(
      "https://lebrostonebackend4.lifeinfotechinstitute.com",
      "http://localhost:5001",
    );
  }
  return url;
};

/* =========================
    HELPERS
========================= */
const parseJsonFields = (data) => {
  const fieldsToParse = [
    "variants",
    "features",
    "faqs",
    "included_products",
    "quantity",
    "existingImages",
    "existingFeatureImages",
  ];
  fieldsToParse.forEach((field) => {
    if (data[field] && typeof data[field] === "string") {
      try {
        data[field] = JSON.parse(data[field]);
      } catch (e) {
        console.error(`Error parsing ${field}:`, e);
      }
    }
  });
  return data;
};

const cleanObjectIds = (data) => {
  // ✅ Change category_id to category
  if (
    data.category === "" ||
    data.category === "null" ||
    data.category === undefined
  )
    delete data.category;
  if (data.subCategory === "" || data.subCategory === "null")
    delete data.subCategory;
  if (data.brand === "" || data.brand === "null") delete data.brand;
  return data;
};

const toUploadPath = (file) => `/uploads/products/${file.filename}`;

const groupFilesByField = (files = []) =>
  files.reduce((acc, file) => {
    if (!acc[file.fieldname]) acc[file.fieldname] = [];
    acc[file.fieldname].push(file);
    return acc;
  }, {});

const normalizeVariants = (variants) => {
  if (!Array.isArray(variants)) return [];
  return variants.map((variant = {}) => ({
    ...variant,
    title: String(variant.title || "").trim(),
    size:
      String(variant.size || "").trim() ||
      String(variant.weight || "").trim() ||
      String(variant.title || "").trim(),
    weight: String(variant.weight || "").trim(),
    sku: String(variant.sku || "").trim(),
    price: Number(variant.price) || 0,
    selling_price: Number(variant.selling_price) || 0,
    mrp: Number(variant.mrp) || 0,
    stockQty: Number(variant.stockQty) || 0,
    discountAmount: Number(variant.discountAmount ?? variant.discount) || 0,
    discountType:
      variant.discountType === "Flat" || variant.discountType === "Percent"
        ? variant.discountType
        : "Percent",
    thumbnail: variant.thumbnail || "",
    images: Array.isArray(variant.images) ? variant.images.filter(Boolean) : [],
    unitValue:
      variant.unitValue === "" || variant.unitValue === undefined
        ? undefined
        : Number(variant.unitValue) || 0,
    unitMeasure: String(variant.unitMeasure || "").trim(),
    isAvailable:
      variant.isAvailable === undefined
        ? true
        : variant.isAvailable === true || variant.isAvailable === "true",
  }));
};

const getVariantIdentityKey = (variant = {}) =>
  [variant.title, variant.size, variant.weight]
    .map((value) => String(value || "").trim().toLowerCase())
    .join("||");

const validateVariantsForSave = (variants = []) => {
  const seen = new Set();

  for (const variant of variants) {
    const title = String(variant.title || "").trim();
    const size = String(variant.size || "").trim();
    const weight = String(variant.weight || "").trim();
    const identityKey = getVariantIdentityKey(variant);
    const displayLabel = [size, weight, title].filter(Boolean).join(" • ") || "variant";
    const effectivePrice =
      Number(variant.selling_price) || Number(variant.price) || Number(variant.mrp) || 0;

    if (!title && !size && !weight) {
      return "Each variant must include at least one of title, size or weight.";
    }

    if (effectivePrice <= 0) {
      return `Variant "${displayLabel}" must have a valid price.`;
    }

    if (seen.has(identityKey)) {
      return `Duplicate variant found: "${displayLabel}". Keep title/size/weight unique.`;
    }

    seen.add(identityKey);
  }

  return "";
};

const filterMeaningfulVariants = (variants = []) =>
  variants.filter((variant) => {
    const hasText = [variant.title, variant.size, variant.weight, variant.sku].some(
      (value) => typeof value === "string" && value.trim() !== "",
    );
    const hasNumbers = [
      variant.price,
      variant.selling_price,
      variant.mrp,
      variant.discountAmount,
      variant.stockQty,
    ].some((value) => Number(value) > 0);
    const hasMedia =
      (typeof variant.thumbnail === "string" && variant.thumbnail.trim() !== "") ||
      (Array.isArray(variant.images) && variant.images.length > 0);

    return hasText || hasNumbers || hasMedia;
  });

const applyVariantMediaFromFiles = (variants, uploadedFilesByField) =>
  (variants || []).map((variant, index) => {
    const nextVariant = { ...variant };

    const thumbnailField = `variantThumbnail_${index}`;
    const imagesField = `variantImages_${index}`;

    if (uploadedFilesByField[thumbnailField]?.[0]) {
      nextVariant.thumbnail = toUploadPath(uploadedFilesByField[thumbnailField][0]);
    }

    const newVariantImages = (uploadedFilesByField[imagesField] || []).map(
      toUploadPath,
    );
    if (newVariantImages.length > 0) {
      nextVariant.images = [...(nextVariant.images || []), ...newVariantImages];
    }

    return nextVariant;
  });

/* ==========================================
    1. STATIC / SPECIAL ROUTES
========================================== */

// --- SEARCH & FILTER ---
router.get("/search", async (req, res) => {
  try {
    const { category, concern, ingredient, tag, is_combo, q } = req.query;
    let query = {};

    // Text search by product name
    if (q && q !== "") {
      query.$or = [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    if (category && category !== "null") query.category = category;
    if (concern && concern !== "null") query.concern = new RegExp(concern, "i");
    if (ingredient && ingredient !== "null")
      query.ingredients = { $in: [new RegExp(ingredient, "i")] };

    if (tag === "bestseller") query.is_bestseller = true;
    if (tag === "newarrival") query.is_new_arrival = true;
    if (is_combo === "true") query.is_combo = true;

    const products = await Product.find(query)
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- GET Banner (DB se) ---
router.get("/banner", async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: "banner_settings" });
    if (!settings) {
      settings = await Settings.create({ key: "banner_settings" });
    }
    // Only return URL if it's valid (not the default placeholder and has uploads path)
    let bannerUrl = settings.currentBannerUrl || null;
    if (
      bannerUrl &&
      (bannerUrl.includes("banar/banner1.jpg") ||
        !bannerUrl.includes("/uploads/"))
    ) {
      bannerUrl = null;
    }
    // Transform URL based on request origin (for local vs production)
    bannerUrl = transformUrl(bannerUrl, req);
    res.json({ success: true, url: bannerUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- Collection fetch ---
router.get("/anantam-collection", async (req, res) => {
  try {
    const products = await Product.find({ is_anantam: true }).sort({
      updatedAt: -1,
    });
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ==========================================
    2. MAIN PRODUCT ROUTES (Public)
========================================== */

// Get All Products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category", "name") // ✅ Changed from category_id
      .populate("subCategory", "name") // ✅ Matches your JSON data
      .populate("subSubCategory", "name")
      .populate("brand", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get by Category
router.get("/by-category/:categoryId", async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.categoryId })
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: products }); // Wrapped in 'data' for consistency
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get by Concern - Fetch from Concern model which has product associations
router.get("/by-concern/:concernName", async (req, res) => {
  try {
    // Find concern by name (case-insensitive)
    const Concern = require("../models/Concern");
    const concern = await Concern.findOne({
      title: { $regex: new RegExp(`^${req.params.concernName}$`, "i") },
    }).populate(
      "products",
      "name images unitPrice mrp selling_price category variants",
    );

    if (!concern) {
      return res.json({ success: true, data: [] });
    }

    res.json({ success: true, data: concern.products || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get by Ingredient - Fetch from Ingredient model which has product associations
router.get("/by-ingredient/:ingredientName", async (req, res) => {
  try {
    // Find ingredient by name (case-insensitive)
    const Ingredient = require("../models/Ingredient");
    const ingredient = await Ingredient.findOne({
      title: { $regex: new RegExp(`^${req.params.ingredientName}$`, "i") },
    }).populate(
      "products",
      "name images unitPrice mrp selling_price category variants",
    );

    if (!ingredient) {
      return res.json({ success: true, data: [] });
    }

    res.json({ success: true, data: ingredient.products || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ==========================================
    3. PROTECTED ROUTES (Admin Operations)
========================================== */

// --- CREATE COMBO ROUTE ---
router.post("/create-combo", protect, async (req, res) => {
  try {
    // ✅ 1. Frontend se aane wali key 'included_products' hai
    const { name, included_products, mrp, selling_price, category_id } =
      req.body;

    // Validation: IDs honi chahiye
    if (!included_products || included_products.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No products selected for combo!" });
    }

    // Products fetch karein images ke liye
    const productsData = await Product.find({
      _id: { $in: included_products },
    });
    const comboImages = productsData
      .map((p) => p.images[0])
      .filter((img) => img);

    const newCombo = new Product({
      name,
      is_combo: true,
      // ✅ 2. Key name match karein (included_products)
      included_products: included_products,
      category_id,
      // ✅ 3. Main level par bhi price save karein taaki ₹0 na dikhe
      mrp: Number(mrp),
      selling_price: Number(selling_price),
      variants: [
        {
          size: "Combo Pack",
          mrp: Number(mrp),
          selling_price: Number(selling_price),
        },
      ],
      // Images logic
      images:
        comboImages.length > 0 ? comboImages : ["uploads/default-combo.png"],
      in_stock: true,
    });

    await newCombo.save();
    res.status(201).json({
      success: true,
      message: "Combo Created Successfully! 🎁",
      data: newCombo,
    });
  } catch (err) {
    console.error("Combo Save Error:", err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// --- Create Product ---
router.post("/", protect, upload, async (req, res) => {
  try {
    let data = { ...req.body };
    const uploadedFilesByField = groupFilesByField(req.files || []);

    // Parse JSON fields (variants may come as JSON string)
    data = parseJsonFields(data);
    data = cleanObjectIds(data);

    // 1. Files handling
    if (uploadedFilesByField.thumbnail?.[0]) {
      data.thumbnail = toUploadPath(uploadedFilesByField.thumbnail[0]);
    }
    if (uploadedFilesByField.images?.length > 0) {
      data.images = uploadedFilesByField.images.map(toUploadPath);
    }
    if (uploadedFilesByField.featureImages?.length > 0) {
      data.featureImages = uploadedFilesByField.featureImages.map(
        (file, idx) => ({
          url: toUploadPath(file),
          order: idx,
        }),
      );
    }

    data.variants = filterMeaningfulVariants(
      applyVariantMediaFromFiles(normalizeVariants(data.variants), uploadedFilesByField),
    );
    const variantValidationError = validateVariantsForSave(data.variants);
    if (variantValidationError) {
      return res.status(400).json({ success: false, message: variantValidationError });
    }

    // 2. Formatting Numbers (Prevent ₹0 issue)
    data.unitPrice = Number(data.unitPrice) || 0;
    data.mrp = Number(data.mrp) || 0;
    data.selling_price = Number(data.selling_price) || 0;
    data.minOrderQty = Number(data.minOrderQty) || 1;
    data.currentStockQty = Number(data.currentStockQty) || 0;
    data.discountAmount = Number(data.discountAmount) || 0;
    data.taxAmount = Number(data.taxAmount) || 0;
    data.shippingCost = Number(data.shippingCost) || 0;

    // 3. Status logic
    data.status = data.status === "true" || data.status === true;

    const newProduct = new Product(data);
    await newProduct.save();

    res.status(201).json({
      success: true,
      message: "Product Created Successfully! ✅",
      data: newProduct,
    });
  } catch (err) {
    console.error("Save Error:", err);
    res.status(400).json({ success: false, message: err.message });
  }
});
// --- Update Anantam Status ---
router.put("/anantam/:id", protect, async (req, res) => {
  try {
    const { is_anantam } = req.body;
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { is_anantam },
      { returnDocument: "after" },
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Product nahi mila" });
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// --- Toggle Bestseller ---
router.put("/:id/bestseller", protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    product.is_bestseller = !product.is_bestseller;
    await product.save();

    res.json({ success: true, is_bestseller: product.is_bestseller });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// --- Banner Upload (DB mein save) ---
router.post(
  "/banner-upload",
  protect,
  bannerUpload.single("banner"),
  async (req, res) => {
    try {
      if (req.file) {
        const newUrl = `uploads/banners/${req.file.filename}`;

        await Settings.findOneAndUpdate(
          { key: "banner_settings" },
          { currentBannerUrl: newUrl },
          { upsert: true },
        );

        res.json({
          success: true,
          url: newUrl,
          message: "Banner Saved in DB! ✅",
        });
      } else {
        res.status(400).json({ success: false, message: "File missing ❌" });
      }
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
);

/* ==========================================
    4. PARAMETERIZED ROUTES
========================================== */

// --- Get Single Product ---
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category")
      .populate("subCategory")
      .populate("subSubCategory")
      .populate("brand");

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- Update Full Product ---

// --- Delete Product ---

router.put("/status/:id", protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    // Status ko flip karein (true -> false / false -> true)
    product.status = !product.status;
    await product.save();

    res.json({
      success: true,
      message: `Product is now ${product.status ? "Active" : "Inactive"}`,
      status: product.status,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id); // MongoDB ID search

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Aapke frontend ke logic ke mutabik data wrap karke bhejein
    res.json({ data: product });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Product Deleted 🗑️" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/:id", protect, upload, async (req, res) => {
  try {
    const { id } = req.params;
    let data = { ...req.body };
    const uploadedFilesByField = groupFilesByField(req.files || []);

    // 1. Helper functions ka upyog (Jo aapne pehle define kiye hain)
    data = parseJsonFields(data);
    data = cleanObjectIds(data);

    // respect existing images arrays sent by client
    if (data.existingImages) {
      data.images = data.existingImages;
      delete data.existingImages;
    }
    if (data.existingFeatureImages) {
      data.featureImages = data.existingFeatureImages;
      delete data.existingFeatureImages;
    }
    if (data.variants) {
      data.variants = normalizeVariants(data.variants);
    }

    // 2. Number fields ko ensure karein (Prevent string errors)
    if (data.unitPrice !== undefined) data.unitPrice = Number(data.unitPrice);
    if (data.mrp !== undefined) data.mrp = Number(data.mrp);
    if (data.selling_price !== undefined)
      data.selling_price = Number(data.selling_price);
    if (data.currentStockQty !== undefined)
      data.currentStockQty = Number(data.currentStockQty);
    if (data.minOrderQty !== undefined) data.minOrderQty = Number(data.minOrderQty);

    // 3. File Upload handling (Multer .fields ke liye)
    if (uploadedFilesByField.thumbnail?.[0]) {
      data.thumbnail = toUploadPath(uploadedFilesByField.thumbnail[0]);
    }

    // Additional Gallery Images update logic
    if (uploadedFilesByField.images?.length > 0) {
      const newGalleryImages = uploadedFilesByField.images.map(toUploadPath);
      if (data.images && Array.isArray(data.images)) {
        data.images = [...data.images, ...newGalleryImages];
      } else {
        data.images = newGalleryImages;
      }
    }
    // Feature images update (add to existing list)
    if (uploadedFilesByField.featureImages?.length > 0) {
      const newFeat = uploadedFilesByField.featureImages.map((file, idx) => ({
        url: toUploadPath(file),
        order: idx,
      }));
      if (data.featureImages && Array.isArray(data.featureImages)) {
        data.featureImages = [...data.featureImages, ...newFeat];
      } else {
        data.featureImages = newFeat;
      }
    }

    if (Array.isArray(data.variants)) {
      data.variants = filterMeaningfulVariants(
        applyVariantMediaFromFiles(data.variants, uploadedFilesByField),
      );
      const variantValidationError = validateVariantsForSave(data.variants);
      if (variantValidationError) {
        return res.status(400).json({ success: false, message: variantValidationError });
      }
    }

    // 4. Database update
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: data },
      { returnDocument: "after", runValidators: true },
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product nahi mila! ❌",
      });
    }

    res.json({
      success: true,
      message: "Product Updated Successfully! ✅",
      data: updatedProduct,
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;
