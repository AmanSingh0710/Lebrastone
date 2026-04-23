import React, { useState, useEffect } from "react";
import instance from "../../web/api/AxiosConfig";
import { useToast } from "../../../context/ToastContext";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import {
  Save,
  Image as ImageIcon,
  Info,
  Cpu,
  Plus,
  Trash,
  Layers,
} from "lucide-react";

const createEmptyVariant = () => ({
  title: "",
  size: "",
  weight: "",
  sku: "",
  price: 0,
  selling_price: 0,
  mrp: 0,
  discountAmount: 0,
  discountType: "Percent",
  stockQty: 0,
  unitValue: 0,
  unitMeasure: "",
  thumbnail: "",
  images: [],
  thumbnailFile: null,
  imageFiles: [],
});

const normalizeVariantText = (value) => String(value || "").trim();

const getVariantDisplayLabel = (variant) => {
  const parts = [variant.size, variant.weight, variant.title]
    .map(normalizeVariantText)
    .filter(Boolean)
    .filter((value, index, arr) => arr.indexOf(value) === index);
  return parts.join(" • ");
};

const getVariantIdentityKey = (variant) =>
  [variant.title, variant.size, variant.weight]
    .map((value) => normalizeVariantText(value).toLowerCase())
    .join("||");

const isMeaningfulVariant = (variant) => {
  const hasText = [variant.title, variant.size, variant.weight, variant.sku].some(
    (value) => normalizeVariantText(value) !== "",
  );
  const hasNumbers = [
    variant.price,
    variant.selling_price,
    variant.mrp,
    variant.discountAmount,
    variant.stockQty,
  ].some((value) => Number(value) > 0);
  const hasMedia =
    (typeof variant.thumbnail === "string" && normalizeVariantText(variant.thumbnail) !== "") ||
    (Array.isArray(variant.images) && variant.images.length > 0) ||
    (variant.thumbnailFile instanceof File) ||
    (Array.isArray(variant.imageFiles) && variant.imageFiles.length > 0);

  return hasText || hasNumbers || hasMedia;
};

const validateVariants = (variants = []) => {
  const activeVariants = variants.filter(isMeaningfulVariant);
  const seen = new Set();

  for (let i = 0; i < activeVariants.length; i += 1) {
    const variant = activeVariants[i];
    const title = normalizeVariantText(variant.title);
    const size = normalizeVariantText(variant.size);
    const weight = normalizeVariantText(variant.weight);
    const identityKey = getVariantIdentityKey(variant);
    const displayLabel = getVariantDisplayLabel(variant) || `Variant #${i + 1}`;
    const effectivePrice =
      Number(variant.selling_price) || Number(variant.price) || Number(variant.mrp) || 0;

    if (!title && !size && !weight) {
      return `Variant #${i + 1}: add at least one field from Title, Size or Weight.`;
    }

    if (effectivePrice <= 0) {
      return `${displayLabel}: add valid price/MRP/selling price.`;
    }

    if (seen.has(identityKey)) {
      return `Duplicate variant found: ${displayLabel}. Keep Title/Size/Weight unique for each variant.`;
    }
    seen.add(identityKey);
  }

  return "";
};

const AddProduct = () => {
  const { success, error } = useToast();
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [subSubCategories, setSubSubCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Schema ke exact keys ke saath state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    subCategory: "",
    subSubCategory: "",
    brand: "",
    productType: "Physical",
    sku: "",
    unit: "kg",
    unitPrice: 0,
    mrp: 0,
    selling_price: 0,
    // structured quantity (for display) and variant support
    quantity: { value: 0, unit: "g", type: "weight" },
    variants: [],
    currentStockQty: 0,
    discountType: "Flat",
    discountAmount: 0,
    taxAmount: 0, // Added
    taxCalculation: "Include with product", // Added
    shippingCost: 0,
    multiplyQty: false, // Added
    status: true,
    is_new_arrival: false,
    is_bestseller: false,
  });

  const [thumbnail, setThumbnail] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);

  useEffect(() => {
    fetchDependencies();
  }, []);
  const [featureImagesFiles, setFeatureImagesFiles] = useState([]);

  // Variants helpers
  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [...(prev.variants || []), createEmptyVariant()],
    }));
  };
  const updateVariant = (index, key, value) => {
    setFormData((prev) => {
      const v = [...(prev.variants || [])];
      v[index] = { ...v[index], [key]: value };
      return { ...prev, variants: v };
    });
  }; // key may be 'size' now

  const removeVariant = (index) => {
    setFormData((prev) => ({
      ...prev,
      variants: (prev.variants || []).filter((_, i) => i !== index),
    }));
  };

  const handleVariantPriceChange = (index, key, value) => {
    const numericValue = Number(value) || 0;
    setFormData((prev) => {
      const variants = [...(prev.variants || [])];
      const variant = { ...variants[index], [key]: numericValue };
      const mrp = Number(variant.mrp) || 0;
      const selling = Number(variant.selling_price) || 0;
      const discount =
        mrp > selling && mrp > 0 ? Math.round(((mrp - selling) / mrp) * 100) : 0;
      variant.discountAmount = discount;
      variant.discountType = "Percent";
      variants[index] = variant;
      return { ...prev, variants };
    });
  };

  const handleVariantThumbnail = (index, file) => {
    if (!file) return;
    updateVariant(index, "thumbnailFile", file);
  };

  const handleVariantImages = (index, files) => {
    const nextFiles = Array.from(files || []);
    if (!nextFiles.length) return;
    setFormData((prev) => {
      const variants = [...(prev.variants || [])];
      variants[index] = {
        ...variants[index],
        imageFiles: [...(variants[index].imageFiles || []), ...nextFiles],
      };
      return { ...prev, variants };
    });
  };

  const clearVariantThumbnail = (index) => {
    setFormData((prev) => {
      const variants = [...(prev.variants || [])];
      variants[index] = { ...variants[index], thumbnail: "", thumbnailFile: null };
      return { ...prev, variants };
    });
  };

  const removeVariantGalleryImage = (index, imageIndex, source = "existing") => {
    setFormData((prev) => {
      const variants = [...(prev.variants || [])];
      const target = { ...variants[index] };
      if (source === "new") {
        target.imageFiles = (target.imageFiles || []).filter(
          (_, idx) => idx !== imageIndex,
        );
      } else {
        target.images = (target.images || []).filter((_, idx) => idx !== imageIndex);
      }
      variants[index] = target;
      return { ...prev, variants };
    });
  };
  const fetchDependencies = async () => {
    try {
      const getHeader = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      };
      const [cat, sub, subSub, br] = await Promise.all([
        instance.get("/api/categories", getHeader),
        instance.get("/api/subcategories", getHeader),
        instance.get("/api/subsubcategories", getHeader),
        instance.get("/api/brands", getHeader),
      ]);
      setCategories(cat.data.data || []);
      setSubCategories(sub.data.data || []);
      setSubSubCategories(subSub.data.data || []);
      setBrands(br.data.data || []);
    } catch (err) {
      error(err.message || "Failed to load product dependencies");
    }
  };

  const handleFeatureImages = (e) => {
    const files = Array.from(e.target.files);
    setFeatureImagesFiles((prev) => [...prev, ...files]);
  };

  const handleCategoryChange = (id) => {
    setFormData({
      ...formData,
      category: id,
      subCategory: "",
      subSubCategory: "",
    });
    setFilteredSubs(
      subCategories.filter(
        (s) => (s.mainCategory?._id || s.mainCategory) === id,
      ),
    );
  };

  const handleSubCategoryChange = (id) => {
    setFormData({ ...formData, subCategory: id, subSubCategory: "" });
    setFilteredSubSubs(
      subSubCategories.filter(
        (s) => (s.subCategory?._id || s.subCategory) === id,
      ),
    );
  };

  const handleAdditionalImages = (e) => {
    const files = Array.from(e.target.files);
    setAdditionalImages((prev) => [...prev, ...files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.category) {
      error("Product name and category are required");
      return;
    }

    if (!thumbnail) {
      error("Please upload a product thumbnail");
      return;
    }
    const variantValidationError = validateVariants(formData.variants || []);
    if (variantValidationError) {
      error(variantValidationError);
      return;
    }

    setLoading(true);
    const data = new FormData();
    const sanitizedVariants = (formData.variants || []).map((variant) => ({
      title: normalizeVariantText(variant.title),
      size:
        normalizeVariantText(variant.size) ||
        normalizeVariantText(variant.weight) ||
        normalizeVariantText(variant.title),
      weight: normalizeVariantText(variant.weight),
      sku: normalizeVariantText(variant.sku),
      price: Number(variant.price) || 0,
      mrp: Number(variant.mrp) || 0,
      selling_price: Number(variant.selling_price) || 0,
      discountAmount: Number(variant.discountAmount) || 0,
      discountType: variant.discountType || "Percent",
      stockQty: Number(variant.stockQty) || 0,
      unitValue: Number(variant.unitValue) || 0,
      unitMeasure: normalizeVariantText(variant.unitMeasure),
      thumbnail: normalizeVariantText(variant.thumbnail),
      images: Array.isArray(variant.images) ? variant.images : [],
    }));

    // Append simple string/number fields
    Object.keys(formData).forEach((key) => {
      if (key === "variants" || key === "quantity") return;
      data.append(key, formData[key]);
    });

    // Structured fields
    data.append("variants", JSON.stringify(sanitizedVariants));
    data.append("quantity", JSON.stringify(formData.quantity || {}));

    if (thumbnail) data.append("thumbnail", thumbnail);
    additionalImages.forEach((file) => data.append("images", file));
    featureImagesFiles.forEach((file) => data.append("featureImages", file));
    (formData.variants || []).forEach((variant, idx) => {
      if (variant.thumbnailFile instanceof File) {
        data.append(`variantThumbnail_${idx}`, variant.thumbnailFile);
      }
      (variant.imageFiles || []).forEach((file) => {
        if (file instanceof File) {
          data.append(`variantImages_${idx}`, file);
        }
      });
    });

    try {
      await instance.post("/api/products", data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      success("Product added successfully!");

      // Reset form
      setFormData({
        name: "",
        description: "",
        category: "",
        subCategory: "",
        subSubCategory: "",
        brand: "",
        productType: "Physical",
        sku: "",
        unit: "kg",
        unitPrice: 0,
        mrp: 0,
        selling_price: 0,
        quantity: { value: 0, unit: "g", type: "weight" },
        variants: [],
        currentStockQty: 0,
        discountType: "Flat",
        discountAmount: 0,
        taxAmount: 0,
        taxCalculation: "Include with product",
        shippingCost: 0,
        multiplyQty: false,
        status: true,
        is_new_arrival: false,
        is_bestseller: false,
      });
      setThumbnail(null);
      setAdditionalImages([]);
      setFeatureImagesFiles([]);
    } catch (err) {
      error(err.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="p-4 md:p-6 bg-[#f8fafc] min-h-screen text-slate-700 font-sans">
      {/* --- Identical Heading Style --- */}
      <h1 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Layers size={20} className="text-blue-600" /> Add New Product
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 max-w-[1400px] mx-auto"
      >
        {/* BASIC INFO */}
        <div className="bg-white rounded shadow-sm border p-6">
          <label className="block text-xs font-bold mb-2 uppercase text-slate-500 italic">
            Product Name (EN)
          </label>
          <div className="col-span-1 md:col-span-1">
            <label className="block text-xs font-bold mb-2 uppercase italic text-slate-400">
              Quantity Value
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                className="w-2/5 border rounded p-2.5 font-bold"
                value={formData.quantity.value}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantity: {
                      ...formData.quantity,
                      value: Number(e.target.value),
                    },
                  })
                }
              />
              <select
                className="w-3/5 border rounded p-2.5 font-bold"
                value={formData.quantity.unit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantity: { ...formData.quantity, unit: e.target.value },
                  })
                }
              >
                <option value="g">g</option>
                <option value="kg">kg</option>
                <option value="mg">mg</option>
                <option value="ml">ml</option>
                <option value="ltr">L</option>
                <option value="pc">pc</option>
                <option value="pack">pack</option>
                <option value="dozen">dozen</option>
              </select>
            </div>
            <select
              className="mt-2 w-full border rounded p-2.5 font-bold"
              value={formData.quantity.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  quantity: { ...formData.quantity, type: e.target.value },
                })
              }
            >
              <option value="weight">Weight</option>
              <option value="volume">Volume</option>
              <option value="count">Count</option>
              <option value="other">Other</option>
            </select>
          </div>
          <input
            type="text"
            className="w-full border rounded p-2.5 mb-4 font-semibold text-lg"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <label className="block text-xs font-bold mb-2 uppercase text-slate-500 italic">
            Description (EN)
          </label>
          <div className="h-64 mb-12">
            <ReactQuill
              theme="snow"
              className="h-48 bg-white"
              value={formData.description}
              onChange={(val) => setFormData({ ...formData, description: val })}
            />
          </div>
        </div>

        {/* GENERAL SETUP (Dropdwons) */}
        <div className="bg-white rounded shadow-sm border">
          <div className="px-6 py-4 border-b bg-slate-50 flex items-center gap-2 font-bold uppercase text-xs">
            <Cpu size={18} className="text-blue-500" /> General Setup
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-xs font-bold mb-2 uppercase italic text-slate-400">
                Category
              </label>
              <select
                className="w-full border rounded p-2.5 font-bold"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-2 uppercase italic text-slate-400">
                Sub Category
              </label>
              <select
                className="w-full border rounded p-2.5 font-bold"
                name="subCategory"
                value={formData.subCategory}
                onChange={handleInputChange}
              >
                <option value="">Select Sub Category</option>
                {subCategories.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}{" "}
                    {s.mainCategory?.name ? `(${s.mainCategory.name})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-2 uppercase italic text-slate-400">
                Sub Sub Category
              </label>
              <select
                className="w-full border rounded p-2.5 font-bold"
                name="subSubCategory"
                value={formData.subSubCategory}
                onChange={handleInputChange}
              >
                <option value="">Select Sub Sub Category</option>
                {subSubCategories.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}{" "}
                    {s.subCategory?.name ? `(${s.subCategory.name})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-2 uppercase italic text-slate-400">
                Brand
              </label>
              <select
                className="w-full border rounded p-2.5 font-bold"
                value={formData.brand}
                onChange={(e) =>
                  setFormData({ ...formData, brand: e.target.value })
                }
              >
                <option value="">Select Brand</option>
                {brands.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold mb-2 uppercase italic text-slate-400">
                Product SKU
              </label>
              <input
                type="text"
                placeholder="Ex: 161183"
                className="w-full border rounded p-2.5 font-bold"
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              {/* Theme ke mutabiq Label styling */}
              <label className="block text-xs font-black mb-2 uppercase italic text-slate-500">
                Unit Selection *
              </label>

              <select
                className="w-full border rounded-lg p-2.5 font-bold bg-white outline-none focus:border-blue-400 text-sm shadow-sm transition-all"
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
                required
              >
                <option value="" disabled>
                  -- Choose Unit --
                </option>

                {/* Weight Units (Vajan) */}
                <optgroup
                  label="Weight (Vajan)"
                  className="font-bold text-blue-600"
                >
                  <option value="kg" className="text-slate-700">
                    Kilogram (kg)
                  </option>
                  <option value="g" className="text-slate-700">
                    Gram (g)
                  </option>
                  <option value="mg" className="text-slate-700">
                    Milligram (mg)
                  </option>
                  <option value="ton" className="text-slate-700">
                    Metric Ton
                  </option>
                  <option value="lb" className="text-slate-700">
                    Pound (lb)
                  </option>
                </optgroup>

                {/* Volume Units (Liquid) */}
                <optgroup
                  label="Volume / Liquid"
                  className="font-bold text-blue-600"
                >
                  <option value="ltr" className="text-slate-700">
                    Litre (ltr)
                  </option>
                  <option value="ml" className="text-slate-700">
                    Millilitre (ml)
                  </option>
                  <option value="gal" className="text-slate-700">
                    Gallon
                  </option>
                </optgroup>

                {/* Counting Units (Ginti) */}
                <optgroup
                  label="Counting / Pieces"
                  className="font-bold text-blue-600"
                >
                  <option value="pc" className="text-slate-700">
                    Piece (pc)
                  </option>
                  <option value="pack" className="text-slate-700">
                    Pack
                  </option>
                  <option value="box" className="text-slate-700">
                    Box
                  </option>
                  <option value="dozen" className="text-slate-700">
                    Dozen
                  </option>
                  <option value="set" className="text-slate-700">
                    Set
                  </option>
                  <option value="bundle" className="text-slate-700">
                    Bundle
                  </option>
                  <option value="roll" className="text-slate-700">
                    Roll
                  </option>
                  <option value="pair" className="text-slate-700">
                    Pair
                  </option>
                </optgroup>
              </select>
            </div>
          </div>
        </div>

        {/* PRICING & STOCK */}
        <div className="bg-white rounded shadow-sm border">
          {/* Header Section */}
          <div className="px-6 py-4 border-b bg-slate-50 flex items-center gap-2 font-bold uppercase text-xs text-blue-900">
            <Info size={18} className="text-blue-500" /> Pricing & others
          </div>

          {/* Input Fields Grid */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Unit Price */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase italic flex items-center gap-1">
                Base Price (₹) <Info size={12} className="text-slate-400" />
              </label>
              <input
                type="number"
                className="w-full border rounded-lg p-2.5 outline-none focus:border-blue-400"
                value={formData.unitPrice}
                onChange={(e) =>
                  setFormData({ ...formData, unitPrice: e.target.value })
                }
                placeholder="Standard cost price"
                required
              />
            </div>

            {/* MRP */}
            <div className="flex flex-col gap-1.5 border-2 border-emerald-100 p-2 rounded-lg bg-emerald-50/20">
              <label className="text-xs font-bold text-emerald-600 uppercase italic flex items-center gap-1">
                Maximum Retail Price (MRP){" "}
                <Info size={12} className="text-emerald-300" />
              </label>
              <input
                type="number"
                className="w-full border border-emerald-200 rounded-lg p-2.5 outline-none focus:border-emerald-400 font-bold text-emerald-700"
                value={formData.mrp}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setFormData({ ...formData, mrp: val });
                }}
                placeholder="Printed price on pack"
              />
            </div>

            {/* Selling Price */}
            <div className="flex flex-col gap-1.5 border-2 border-blue-100 p-2 rounded-lg bg-blue-50/20">
              <label className="text-xs font-bold text-blue-600 uppercase italic flex items-center gap-1">
                Actual Selling Price (₹){" "}
                <Info size={12} className="text-blue-300" />
              </label>
              <input
                type="number"
                className="w-full border border-blue-200 rounded-lg p-2.5 outline-none focus:border-blue-400 font-bold text-blue-700"
                value={formData.selling_price}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setFormData({ ...formData, selling_price: val });

                  // Auto calculate discount if possible
                  if (formData.mrp > 0 && val > 0) {
                    const diff = formData.mrp - val;
                    if (formData.discountType === "Flat") {
                      setFormData((prev) => ({
                        ...prev,
                        selling_price: val,
                        discountAmount: diff,
                      }));
                    } else {
                      setFormData((prev) => ({
                        ...prev,
                        selling_price: val,
                        discountAmount: Math.round((diff / formData.mrp) * 100),
                      }));
                    }
                  }
                }}
                placeholder="The price customer pays"
              />
            </div>

            {/* Discount Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase italic flex items-center gap-1">
                Discount Method <Info size={12} className="text-slate-400" />
              </label>
              <select
                className="w-full border rounded-lg p-2.5 bg-white outline-none focus:border-blue-400"
                value={formData.discountType}
                onChange={(e) =>
                  setFormData({ ...formData, discountType: e.target.value })
                }
              >
                <option value="Flat">FLAT (₹ OFF)</option>
                <option value="Percent">PERCENTAGE (% OFF)</option>
              </select>
            </div>

            {/* Discount Amount */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase italic flex items-center gap-1">
                Discount To Show <Info size={12} className="text-slate-400" />
              </label>
              <input
                type="number"
                className="w-full border rounded-lg p-2.5 outline-none focus:border-blue-400"
                value={formData.discountAmount}
                onChange={(e) =>
                  setFormData({ ...formData, discountAmount: e.target.value })
                }
                placeholder={
                  formData.discountType === "Flat"
                    ? "e.g. 50 (₹ off)"
                    : "e.g. 10 (% off)"
                }
              />
            </div>

            {/* Current Stock Qty */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase italic flex items-center gap-1">
                Current Stock Qty <Info size={12} className="text-slate-400" />
              </label>
              <input
                type="number"
                className="w-full border rounded-lg p-2.5 outline-none focus:border-blue-400"
                value={formData.currentStockQty}
                onChange={(e) =>
                  setFormData({ ...formData, currentStockQty: e.target.value })
                }
                placeholder="How many in stock?"
              />
            </div>

            {/* Minimum Order Qty */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase italic flex items-center gap-1">
                Min Purchase Qty <Info size={12} className="text-slate-400" />
              </label>
              <input
                type="number"
                className="w-full border rounded-lg p-2.5 outline-none focus:border-blue-400"
                value={formData.minOrderQty}
                onChange={(e) =>
                  setFormData({ ...formData, minOrderQty: e.target.value })
                }
              />
            </div>

            {/* Tax Amount */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase italic flex items-center gap-1">
                GST/Tax (%) <Info size={12} className="text-slate-400" />
              </label>
              <input
                type="number"
                className="w-full border rounded-lg p-2.5 outline-none focus:border-blue-400"
                value={formData.taxAmount}
                onChange={(e) =>
                  setFormData({ ...formData, taxAmount: e.target.value })
                }
              />
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 pt-0">
            {/* Tax Calculation */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase italic flex items-center gap-1">
                Tax Calculation <Info size={12} className="text-slate-400" />
              </label>
              <select
                className="w-full border rounded-lg p-2.5 bg-white outline-none focus:border-blue-400"
                value={formData.taxCalculation}
                onChange={(e) =>
                  setFormData({ ...formData, taxCalculation: e.target.value })
                }
              >
                <option value="Include with product">
                  Tax included in price
                </option>
                <option value="Exclude from product">
                  Tax added extra at checkout
                </option>
              </select>
            </div>

            {/* Shipping Cost */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase italic flex items-center gap-1">
                Shipping Cost (₹) <Info size={12} className="text-slate-400" />
              </label>
              <input
                type="number"
                className="w-full border rounded-lg p-2.5 outline-none focus:border-blue-400"
                value={formData.shippingCost}
                onChange={(e) =>
                  setFormData({ ...formData, shippingCost: e.target.value })
                }
              />
            </div>
          </div>

          {/* SHIPPING MULTIPLY TOGGLE */}
          <div className="px-6 pb-4">
            <div className="flex items-center justify-between border rounded-lg p-4 bg-slate-50 max-w-md group hover:border-blue-200 transition-colors">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase italic">
                Shipping Cost Multiply With Quantity{" "}
                <Info size={14} className="text-slate-400" />
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={formData.multiplyQty}
                  onChange={(e) =>
                    setFormData({ ...formData, multiplyQty: e.target.checked })
                  }
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* PRODUCT TAGS TOGGLES */}
        <div className="bg-white rounded shadow-sm border p-6">
          <div className="flex items-center gap-2 font-bold uppercase text-xs mb-4 text-blue-900">
            <Info size={18} className="text-blue-500" /> Product Tags
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* New Arrival Toggle */}
            <div className="flex items-center justify-between border rounded-lg p-4 bg-green-50 max-w-md group hover:border-green-200 transition-colors">
              <div className="flex items-center gap-2 text-xs font-bold text-green-700 uppercase italic">
                Mark as New Arrival
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={formData.is_new_arrival}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      is_new_arrival: e.target.checked,
                    })
                  }
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>

            {/* Bestseller Toggle */}
            <div className="flex items-center justify-between border rounded-lg p-4 bg-amber-50 max-w-md group hover:border-amber-200 transition-colors">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase italic">
                Mark as Bestseller
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={formData.is_bestseller}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      is_bestseller: e.target.checked,
                    })
                  }
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* IMAGES */}
        {/* VARIANTS */}
        <div className="bg-white rounded shadow-sm border p-6 mb-6">
          <div className="flex items-center gap-2 font-bold uppercase text-xs mb-4 text-blue-900">
            <Info size={18} className="text-blue-500" /> Variants
          </div>
          <div className="space-y-3">
            {(formData.variants || []).map((v, idx) => (
              <div
                key={idx}
                className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs font-black text-slate-500 uppercase">
                    Variant #{idx + 1}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVariant(idx)}
                    className="px-3 py-2 bg-red-100 text-red-600 font-bold text-xs rounded-lg hover:bg-red-200 transition-all uppercase"
                  >
                    Delete
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase italic">
                      Title
                    </label>
                    <input
                      className="border rounded p-2 text-sm font-semibold"
                      placeholder="Variant title"
                      value={v.title || ""}
                      onChange={(e) => updateVariant(idx, "title", e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase italic">
                      Size
                    </label>
                    <input
                      className="border rounded p-2 text-sm font-semibold"
                      placeholder="e.g. 500 g"
                      value={v.size || ""}
                      onChange={(e) => updateVariant(idx, "size", e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase italic">
                      Weight
                    </label>
                    <input
                      className="border rounded p-2 text-sm font-semibold"
                      placeholder="e.g. 0.5kg"
                      value={v.weight || ""}
                      onChange={(e) => updateVariant(idx, "weight", e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase italic">
                      SKU
                    </label>
                    <input
                      className="border rounded p-2 text-sm"
                      placeholder="SKU"
                      value={v.sku || ""}
                      onChange={(e) => updateVariant(idx, "sku", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase italic">
                      Price (₹)
                    </label>
                    <input
                      className="border rounded p-2 text-sm font-bold"
                      type="number"
                      value={v.price || 0}
                      onChange={(e) =>
                        updateVariant(idx, "price", Number(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase italic">
                      MRP (₹)
                    </label>
                    <input
                      className="border rounded p-2 text-sm font-bold text-emerald-700"
                      type="number"
                      value={v.mrp || 0}
                      onChange={(e) =>
                        handleVariantPriceChange(idx, "mrp", e.target.value)
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase italic">
                      Selling (₹)
                    </label>
                    <input
                      className="border rounded p-2 text-sm font-bold text-blue-700"
                      type="number"
                      value={v.selling_price || 0}
                      onChange={(e) =>
                        handleVariantPriceChange(
                          idx,
                          "selling_price",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase italic">
                      Discount %
                    </label>
                    <input
                      className="border rounded p-2 text-sm font-bold"
                      type="number"
                      value={v.discountAmount || 0}
                      onChange={(e) =>
                        updateVariant(
                          idx,
                          "discountAmount",
                          Number(e.target.value) || 0,
                        )
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase italic">
                      Discount Type
                    </label>
                    <select
                      className="border rounded p-2 text-sm font-semibold"
                      value={v.discountType || "Percent"}
                      onChange={(e) =>
                        updateVariant(idx, "discountType", e.target.value)
                      }
                    >
                      <option value="Percent">Percent</option>
                      <option value="Flat">Flat</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase italic">
                      Stock
                    </label>
                    <input
                      className="border rounded p-2 text-sm font-bold"
                      type="number"
                      value={v.stockQty || 0}
                      onChange={(e) =>
                        updateVariant(idx, "stockQty", Number(e.target.value) || 0)
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border border-slate-200 rounded-lg p-3">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">
                      Variant Thumbnail
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-20 rounded border bg-slate-50 overflow-hidden flex items-center justify-center">
                        {v.thumbnailFile || v.thumbnail ? (
                          <img
                            src={
                              v.thumbnailFile
                                ? URL.createObjectURL(v.thumbnailFile)
                                : v.thumbnail
                            }
                            alt="variant thumbnail"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon size={18} className="text-slate-300" />
                        )}
                      </div>
                      <div className="flex gap-2">
                        <label className="px-3 py-2 bg-slate-100 rounded text-xs font-bold cursor-pointer hover:bg-slate-200">
                          Upload
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) =>
                              handleVariantThumbnail(idx, e.target.files?.[0])
                            }
                          />
                        </label>
                        {(v.thumbnailFile || v.thumbnail) && (
                          <button
                            type="button"
                            onClick={() => clearVariantThumbnail(idx)}
                            className="px-3 py-2 bg-red-100 text-red-600 rounded text-xs font-bold"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-lg p-3">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">
                      Variant Gallery Images
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(v.images || []).map((img, imageIdx) => (
                        <div
                          key={`old-${imageIdx}`}
                          className="w-16 h-16 border rounded relative"
                        >
                          <img
                            src={img}
                            alt="variant gallery"
                            className="w-full h-full object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              removeVariantGalleryImage(idx, imageIdx, "existing")
                            }
                            className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-red-500 text-white rounded-full p-1 shadow"
                          >
                            <Trash size={9} />
                          </button>
                        </div>
                      ))}
                      {(v.imageFiles || []).map((img, imageIdx) => (
                        <div
                          key={`new-${imageIdx}`}
                          className="w-16 h-16 border rounded relative"
                        >
                          <img
                            src={URL.createObjectURL(img)}
                            alt="variant gallery"
                            className="w-full h-full object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              removeVariantGalleryImage(idx, imageIdx, "new")
                            }
                            className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-red-500 text-white rounded-full p-1 shadow"
                          >
                            <Trash size={9} />
                          </button>
                        </div>
                      ))}
                      <label className="w-16 h-16 border-2 border-dashed rounded flex items-center justify-center cursor-pointer bg-slate-50 hover:bg-slate-100">
                        <Plus size={14} />
                        <input
                          type="file"
                          multiple
                          className="hidden"
                          onChange={(e) =>
                            handleVariantImages(idx, e.target.files)
                          }
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div>
              <button
                type="button"
                onClick={addVariant}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Add Variant
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded border shadow-sm">
            <label className="block font-bold mb-4 uppercase text-xs italic text-blue-600">
              Main Thumbnail (1:1)
            </label>
            <div className="border-2 border-dashed rounded p-4 text-center relative cursor-pointer bg-slate-50 min-h-[150px] flex items-center justify-center">
              {thumbnail ? (
                <img
                  src={URL.createObjectURL(thumbnail)}
                  className="h-32 object-contain"
                />
              ) : (
                <ImageIcon size={40} className="text-slate-300" />
              )}
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => setThumbnail(e.target.files[0])}
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded border shadow-sm">
            <label className="block font-bold mb-4 uppercase text-xs italic text-blue-600">
              Gallery Images (Multiple)
            </label>
            <div className="flex flex-wrap gap-2">
              {additionalImages.map((img, i) => (
                <div
                  key={i}
                  className="w-20 h-20 border rounded relative group shadow-sm bg-white p-1"
                >
                  <img
                    src={URL.createObjectURL(img)}
                    className="w-full h-full object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setAdditionalImages(
                        additionalImages.filter((_, idx) => idx !== i),
                      )
                    }
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-700 shadow-md"
                  >
                    <Trash size={10} />
                  </button>
                </div>
              ))}
              <div className="w-20 h-20 border-2 border-dashed rounded flex flex-col items-center justify-center relative cursor-pointer bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition-all">
                <Plus className="text-slate-400" />
                <span className="text-[8px] font-bold text-slate-400">ADD</span>
                <input
                  type="file"
                  multiple
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleAdditionalImages}
                />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded border shadow-sm">
            <label className="block font-bold mb-4 uppercase text-xs italic text-blue-600">
              Feature Images (Description)
            </label>
            <div className="flex flex-wrap gap-2">
              {featureImagesFiles.map((img, i) => (
                <div
                  key={i}
                  className="w-28 h-28 border rounded relative group shadow-sm bg-white p-1"
                >
                  <img
                    src={URL.createObjectURL(img)}
                    className="w-full h-full object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFeatureImagesFiles(
                        featureImagesFiles.filter((_, idx) => idx !== i),
                      )
                    }
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-700 shadow-md"
                  >
                    <Trash size={10} />
                  </button>
                </div>
              ))}
              <div className="w-28 h-28 border-2 border-dashed rounded flex flex-col items-center justify-center relative cursor-pointer bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition-all">
                <Plus className="text-slate-400" />
                <span className="text-[8px] font-bold text-slate-400">ADD</span>
                <input
                  type="file"
                  multiple
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleFeatureImages}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pb-10">
          <button
            type="reset"
            onClick={() => {
              setAdditionalImages([]);
              setThumbnail(null);
              setFeatureImagesFiles([]);
            }}
            className="px-10 py-3 bg-slate-400 text-white rounded font-bold hover:bg-slate-500 shadow-md transition-all uppercase text-sm"
            disabled={loading}
          >
            Reset
          </button>
          <button
            type="submit"
            className="px-10 py-3 bg-[#0067FF] text-white rounded font-bold shadow-xl flex items-center gap-2 hover:bg-blue-700 transition-all uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            <Save size={18} /> {loading ? "Publishing..." : "Publish Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
