import React, { useState, useEffect } from "react";
import instance, { getImageUrl } from "../../web/api/AxiosConfig";
import { useParams, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import {
  Save,
  ArrowLeft,
  Image as ImageIcon,
  Info,
  Cpu,
  Plus,
  Trash,
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

const Editprodoct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Dependency states
  const [additionalImages, setAdditionalImages] = useState([]); // For New Files
  const [existingImages, setExistingImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [subSubCategories, setSubSubCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Full FormData State (Matching AddProduct)
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
    minOrderQty: 1,
    currentStockQty: 0,
    discountType: "Flat",
    discountAmount: 0,
    taxAmount: 0,
    taxCalculation: "Include with product",
    shippingCost: 0,
    multiplyQty: false,
    status: true,
    quantity: { value: 0, unit: "g", type: "weight" },
    variants: [],
    images: [],
    featureImages: [],
  });

  const [thumbnail, setThumbnail] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(null);
  const [featureImagesFiles, setFeatureImagesFiles] = useState([]);
  const [existingFeatureImages, setExistingFeatureImages] = useState([]);

  // Variants helpers (same as AddProduct)
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
  };
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

  useEffect(() => {
    fetchDependencies();
    fetchProductDetails();
  }, [id]);

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
      console.error("Fetch dependencies error", err);
    }
  };

  const fetchProductDetails = async () => {
    try {
      const res = await instance.get(`/api/products/${id}`);
      const p = res.data.data;

      setFormData({
        name: p.name || "",
        description: p.description || "",
        category: p.category?._id || p.category || "",
        subCategory: p.subCategory?._id || p.subCategory || "",
        subSubCategory: p.subSubCategory?._id || p.subSubCategory || "",
        brand: p.brand?._id || p.brand || "",
        productType: p.productType || "Physical",
        sku: p.sku || "",
        unit: p.unit || "kg",
        unitPrice: p.unitPrice || 0,
        mrp: p.mrp || 0,
        selling_price: p.selling_price || 0,
        minOrderQty: p.minOrderQty || 1,
        currentStockQty: p.currentStockQty || 0,
        discountType: p.discountType || "Flat",
        discountAmount: p.discountAmount || 0,
        taxAmount: p.taxAmount || 0,
        taxCalculation: p.taxCalculation || "Include with product",
        shippingCost: p.shippingCost || 0,
        multiplyQty: p.multiplyQty || false,
        status: p.status ?? true,
        quantity: p.quantity || { value: 0, unit: "g", type: "weight" },
        variants: (p.variants || [])
          .map((variant) => ({
            ...createEmptyVariant(),
            ...variant,
            images: Array.isArray(variant.images) ? variant.images : [],
            thumbnail: variant.thumbnail || "",
            thumbnailFile: null,
            imageFiles: [],
          }))
          .filter(isMeaningfulVariant),
      });

      setThumbPreview(p.thumbnail);
      setExistingImages(p.images || []);
      setExistingFeatureImages(p.featureImages || []);
      // sync arrays with formData so update sends them
      setFormData((prev) => ({
        ...prev,
        images: p.images || [],
        featureImages: p.featureImages || [],
      }));
      setLoading(false);
    } catch (err) {
      alert("Product details fetch error!");
      navigate("/admin/productadminlist");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const variantValidationError = validateVariants(formData.variants || []);
    if (variantValidationError) {
      alert(variantValidationError);
      return;
    }

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
    Object.keys(formData).forEach((key) => {
      if (key === "variants" || key === "quantity") return;
      data.append(key, formData[key]);
    });
    data.append("variants", JSON.stringify(sanitizedVariants));
    data.append("quantity", JSON.stringify(formData.quantity || {}));

    if (thumbnail) data.append("thumbnail", thumbnail);

    // Nayi gallery images add karne ke liye
    // append retained existing images and features lists
    data.append("existingImages", JSON.stringify(existingImages));
    data.append("existingFeatureImages", JSON.stringify(existingFeatureImages));
    if (additionalImages.length > 0) {
      additionalImages.forEach((file) => data.append("images", file));
    }
    if (featureImagesFiles.length > 0) {
      featureImagesFiles.forEach((file) => data.append("featureImages", file));
    }
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
      await instance.put(`/api/products/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      alert("Product Updated ✅");
      navigate("/admin/productadminlist");
    } catch (err) {
      alert("Update failed: " + err.message);
    }
  };

  if (loading)
    return <div className="p-10 text-center font-bold">Loading Data...</div>;

  return (
    <div className="p-6 bg-[#f3f4f7] min-h-screen font-sans text-[#334257]">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-white rounded shadow-sm hover:bg-gray-50"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold italic underline uppercase text-blue-900">
          Edit Product
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 max-w-[1400px] mx-auto"
      >
        {/* BASIC INFO */}
        <div className="bg-white rounded shadow-sm border p-6">
          <label className="block text-xs font-bold mb-2 uppercase text-slate-500 italic">
            Product Name
          </label>
          <input
            type="text"
            name="name"
            className="w-full border rounded p-2.5 mb-4 font-semibold text-lg"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <label className="block text-xs font-bold mb-2 uppercase text-slate-500 italic">
            Description
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
        {/* Feature Images for Description */}
        <div className="bg-white p-6 rounded border shadow-sm">
          <label className="block font-bold mb-4 uppercase text-xs italic text-blue-600">
            Feature Images (Description)
          </label>
          <div className="flex flex-wrap gap-2">
            {existingFeatureImages.map((fi, i) => (
              <div
                key={`f-old-${i}`}
                className="w-24 h-24 border rounded p-1 bg-blue-50 relative group"
              >
                <img
                  src={getImageUrl(fi.url || fi)}
                  className="w-full h-full object-cover rounded"
                  alt="feature"
                />
                <button
                  type="button"
                  onClick={() =>
                    setExistingFeatureImages(
                      existingFeatureImages.filter((_, idx) => idx !== i),
                    )
                  }
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:scale-110 transition-transform"
                >
                  <Trash size={10} />
                </button>
              </div>
            ))}
            {featureImagesFiles.map((img, i) => (
              <div
                key={`f-new-${i}`}
                className="w-24 h-24 border rounded relative group bg-white p-1 shadow-md"
              >
                <img
                  src={URL.createObjectURL(img)}
                  className="w-full h-full object-cover rounded"
                  alt="new"
                />
                <button
                  type="button"
                  onClick={() =>
                    setFeatureImagesFiles(
                      featureImagesFiles.filter((_, idx) => idx !== i),
                    )
                  }
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:scale-110 transition-transform"
                >
                  <Trash size={10} />
                </button>
              </div>
            ))}
            <div className="w-24 h-24 border-2 border-dashed rounded flex flex-col items-center justify-center relative cursor-pointer bg-slate-50 hover:bg-blue-50 transition-all">
              <Plus size={16} />
              <span className="text-[8px] font-bold">ADD</span>
              <input
                type="file"
                multiple
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) =>
                  setFeatureImagesFiles([
                    ...featureImagesFiles,
                    ...Array.from(e.target.files),
                  ])
                }
              />
            </div>
          </div>
        </div>

        {/* GENERAL SETUP */}
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
                name="category"
                className="w-full border rounded p-2.5 font-bold"
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
                name="subCategory"
                className="w-full border rounded p-2.5 font-bold"
                value={formData.subCategory}
                onChange={handleInputChange}
              >
                <option value="">Select Sub Category</option>
                {subCategories.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-2 uppercase italic text-slate-400">
                Brand
              </label>
              <select
                name="brand"
                className="w-full border rounded p-2.5 font-bold"
                value={formData.brand}
                onChange={handleInputChange}
              >
                <option value="">Select Brand</option>
                {brands.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-2 uppercase italic text-slate-400">
                SKU
              </label>
              <input
                type="text"
                name="sku"
                className="w-full border rounded p-2.5 font-bold"
                value={formData.sku}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        {/* PRICING & STOCK (All AddProduct fields added) */}
        <div className="bg-white rounded shadow-sm border">
          <div className="px-6 py-4 border-b bg-slate-50 flex items-center gap-2 font-bold uppercase text-xs text-blue-900">
            <Info size={18} className="text-blue-500" /> Pricing & others
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase italic">
                Base Price (₹)
              </label>
              <input
                type="number"
                name="unitPrice"
                className="w-full border rounded-lg p-2.5"
                value={formData.unitPrice}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="border-2 border-emerald-100 p-2 rounded-lg bg-emerald-50/20">
              <label className="text-xs font-bold text-emerald-600 uppercase italic">
                MRP (₹)
              </label>
              <input
                type="number"
                name="mrp"
                className="w-full border border-emerald-200 rounded-lg p-2.5 font-bold text-emerald-700"
                value={formData.mrp}
                onChange={handleInputChange}
              />
            </div>
            <div className="border-2 border-blue-100 p-2 rounded-lg bg-blue-50/20">
              <label className="text-xs font-bold text-blue-600 uppercase italic">
                Selling Price (₹)
              </label>
              <input
                type="number"
                name="selling_price"
                className="w-full border border-blue-200 rounded-lg p-2.5 font-bold text-blue-700"
                value={formData.selling_price}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setFormData({ ...formData, selling_price: val });
                  // Optional auto-calc for discount
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
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase italic">
                Discount Method
              </label>
              <select
                name="discountType"
                className="w-full border rounded-lg p-2.5 bg-white"
                value={formData.discountType}
                onChange={handleInputChange}
              >
                <option value="Flat">FLAT (₹ OFF)</option>
                <option value="Percent">PERCENTAGE (% OFF)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase italic">
                Discount Value
              </label>
              <input
                type="number"
                name="discountAmount"
                className="w-full border rounded-lg p-2.5"
                value={formData.discountAmount}
                onChange={handleInputChange}
                placeholder={
                  formData.discountType === "Flat" ? "₹ off" : "% off"
                }
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase italic">
                Stock Qty
              </label>
              <input
                type="number"
                name="currentStockQty"
                className="w-full border rounded-lg p-2.5"
                value={formData.currentStockQty}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase italic">
                Tax Amount (%)
              </label>
              <input
                type="number"
                name="taxAmount"
                className="w-full border rounded-lg p-2.5"
                value={formData.taxAmount}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase italic">
                Shipping Cost (₹)
              </label>
              <input
                type="number"
                name="shippingCost"
                className="w-full border rounded-lg p-2.5"
                value={formData.shippingCost}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex items-center gap-4 mt-6">
              <label className="text-xs font-bold text-slate-500 uppercase italic">
                Multiply Shipping
              </label>
              <input
                type="checkbox"
                name="multiplyQty"
                checked={formData.multiplyQty}
                onChange={handleInputChange}
                className="w-5 h-5 cursor-pointer"
              />
            </div>
          </div>
        </div>

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
                                : getImageUrl(v.thumbnail)
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
                            src={getImageUrl(img)}
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
        {/* IMAGES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Main Thumbnail */}
          <div className="bg-white p-6 rounded border shadow-sm">
            <label className="block font-bold mb-4 uppercase text-xs italic text-blue-600">
              Main Thumbnail
            </label>
            <div className="border-2 border-dashed rounded p-4 text-center relative bg-slate-50 flex flex-col items-center justify-center min-h-[150px]">
              <img
                src={
                  thumbnail
                    ? URL.createObjectURL(thumbnail)
                    : getImageUrl(thumbPreview)
                }
                className="h-32 object-contain"
                onError={(e) =>
                  (e.target.src = "https://via.placeholder.com/150")
                }
                alt="thumbnail"
              />
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => {
                  setThumbnail(e.target.files[0]);
                  setThumbPreview(URL.createObjectURL(e.target.files[0]));
                }}
              />
              <p className="text-[10px] mt-2 text-gray-400 font-bold">
                Click to Change
              </p>
            </div>
          </div>

          {/* Gallery Images (The Fix) */}
          <div className="bg-white p-6 rounded border shadow-sm">
            <label className="block font-bold mb-4 uppercase text-xs italic text-blue-600">
              Gallery Images (Old & New)
            </label>
            <div className="flex flex-wrap gap-2">
              {/* 1. Purani Images jo DB mein hain */}
              {existingImages.map((img, i) => (
                <div
                  key={`old-${i}`}
                  className="w-20 h-20 border rounded p-1 bg-blue-50 relative group"
                >
                  <img
                    src={getImageUrl(img)}
                    className="w-full h-full object-cover rounded"
                    alt="old"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setExistingImages(
                        existingImages.filter((_, idx) => idx !== i),
                      )
                    }
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:scale-110 transition-transform"
                  >
                    <Trash size={10} />
                  </button>
                </div>
              ))}

              {/* 2. Nayi Images jo abhi select ki hain */}
              {additionalImages.map((img, i) => (
                <div
                  key={`new-${i}`}
                  className="w-20 h-20 border rounded relative group bg-white p-1 shadow-md"
                >
                  <img
                    src={URL.createObjectURL(img)}
                    className="w-full h-full object-cover rounded"
                    alt="new"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setAdditionalImages(
                        additionalImages.filter((_, idx) => idx !== i),
                      )
                    }
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:scale-110 transition-transform"
                  >
                    <Trash size={10} />
                  </button>
                </div>
              ))}

              {/* Add Button */}
              <div className="w-20 h-20 border-2 border-dashed rounded flex flex-col items-center justify-center relative cursor-pointer bg-slate-50 hover:bg-blue-50 transition-all">
                <Plus size={16} />
                <span className="text-[8px] font-bold">ADD MORE</span>
                <input
                  type="file"
                  multiple
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) =>
                    setAdditionalImages([
                      ...additionalImages,
                      ...Array.from(e.target.files),
                    ])
                  }
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-4 pb-10">
          <button
            type="submit"
            className="px-10 py-3 bg-blue-600 text-white rounded font-bold shadow-xl flex items-center gap-2 hover:bg-blue-700 uppercase text-sm"
          >
            <Save size={18} /> Update Product
          </button>
        </div>
      </form>
    </div>
  );
};

export default Editprodoct;
