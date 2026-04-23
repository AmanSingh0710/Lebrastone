import React, { useState, useEffect } from "react";

import {
  UploadCloud,
  Search,
  Calendar,
  ChevronDown,
  Check,
  X,
} from "lucide-react";
import instance, { getImageUrl } from "../../web/api/AxiosConfig";

const AnantamBanner = () => {
  const [banners, setBanners] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    ctaText: "EXPLORE COLLECTION",
    seriesName: "THE ANANTAM SERIES",
    status: true,
    startDate: "",
    endDate: "",
    priority: 0,
    image: null,
  });
  const [imagePreview, setImagePreview] = useState("");

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      const response = await instance.get("/api/anantam/banners/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBanners(response.data.data);
    } catch (error) {
      console.error("Error fetching banners:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await instance.get("/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const toggleAnantamProduct = async (productId, currentStatus) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await instance.put(
        `/api/anantam/anantam/${productId}`,
        { is_anantam: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Update local state
      setProducts((prev) =>
        prev.map((product) =>
          product._id === productId
            ? { ...product, is_anantam: response.data.data.is_anantam }
            : product,
        ),
      );
    } catch (error) {
      alert("Error updating product status");
    }
  };

  useEffect(() => {
    fetchBanners();
    fetchProducts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key !== "image" && formData[key] !== "")
          formDataToSend.append(key, formData[key]);
      });
      if (formData.image) formDataToSend.append("image", formData.image);

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      };
      if (editingBanner) {
        await instance.put(
          `/api/anantam/banners/${editingBanner._id}`,
          formDataToSend,
          config,
        );
      } else {
        await instance.post("/api/anantam/banners", formDataToSend, config);
      }
      resetForm();
      fetchBanners();
    } catch (error) {
      alert("Error saving banner");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle,
      description: banner.description || "",
      ctaText: banner.ctaText || "EXPLORE COLLECTION",
      seriesName: banner.seriesName || "THE ANANTAM SERIES",
      status: banner.status,
      startDate: banner.startDate
        ? new Date(banner.startDate).toISOString().split("T")[0]
        : "",
      endDate: banner.endDate
        ? new Date(banner.endDate).toISOString().split("T")[0]
        : "",
      priority: banner.priority || 0,
      image: null,
    });
    // Fix: Show existing image in preview using getImageUrl
    setImagePreview(getImageUrl(banner.imageUrl || banner.image));
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;

    try {
      const token = localStorage.getItem("adminToken");
      await instance.delete(`/api/anantam/banners/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBanners();
    } catch (error) {
      alert("Error deleting banner");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      description: "",
      ctaText: "EXPLORE COLLECTION",
      seriesName: "THE ANANTAM SERIES",
      status: true,
      startDate: "",
      endDate: "",
      priority: 0,
      image: null,
    });
    setImagePreview("");
    setEditingBanner(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h1 className="text-4xl font-black text-[#1E293B] mb-10 tracking-tight">
          ANANTAM <span className="text-[#3B82F6]">MANAGER</span>
        </h1>

        {/* Banner Creation Form */}
        {showForm && (
          <div className="bg-white rounded-[40px] shadow-xl p-8 mb-12">
            <h2 className="text-2xl font-black text-[#1E293B] mb-6">
              {editingBanner ? "Edit Banner" : "Create New Banner"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-black text-[#64748B] mb-2">
                    TITLE *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full bg-[#F8FAFC] rounded-2xl py-3 px-6 font-bold text-[#1E293B] outline-none border border-transparent focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-black text-[#64748B] mb-2">
                    SUBTITLE *
                  </label>
                  <input
                    type="text"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleInputChange}
                    className="w-full bg-[#F8FAFC] rounded-2xl py-3 px-6 font-bold text-[#1E293B] outline-none border border-transparent focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-black text-[#64748B] mb-2">
                    SERIES NAME
                  </label>
                  <input
                    type="text"
                    name="seriesName"
                    value={formData.seriesName}
                    onChange={handleInputChange}
                    className="w-full bg-[#F8FAFC] rounded-2xl py-3 px-6 font-bold text-[#1E293B] outline-none border border-transparent focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-black text-[#64748B] mb-2">
                    PRIORITY
                  </label>
                  <input
                    type="number"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full bg-[#F8FAFC] rounded-2xl py-3 px-6 font-bold text-[#1E293B] outline-none border border-transparent focus:border-blue-500"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-black text-[#64748B] mb-2">
                  DESCRIPTION
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full bg-[#F8FAFC] rounded-2xl py-3 px-6 font-bold text-[#1E293B] outline-none border border-transparent focus:border-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="status"
                  checked={formData.status}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-[#3B82F6] rounded focus:ring-[#3B82F6]"
                />
                <label className="ml-3 text-sm font-black text-[#64748B]">
                  ACTIVE
                </label>
              </div>

              <div>
                <label className="block text-sm font-black text-[#64748B] mb-2">
                  BANNER IMAGE *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full bg-[#F8FAFC] rounded-2xl py-3 px-6 font-bold text-[#1E293B] outline-none border border-transparent focus:border-blue-500"
                />
                {imagePreview && (
                  <div className="mt-4">
                    <img
                      src={getImageUrl(imagePreview)}
                      className="max-w-xs rounded-xl shadow-lg"
                      alt="Preview"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#22C55E] text-white px-8 py-3 rounded-2xl font-black hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {loading
                    ? "SAVING..."
                    : editingBanner
                      ? "UPDATE BANNER"
                      : "CREATE BANNER"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-[#94A3B8] text-white px-8 py-3 rounded-2xl font-black hover:bg-gray-600 transition-colors"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        )}

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#3B82F6] text-white px-8 py-4 rounded-2xl font-black mb-12 hover:bg-blue-700 transition-colors"
          >
            + CREATE NEW BANNER
          </button>
        )}

        {/* Banner Management Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-black text-[#1E293B] mb-6 tracking-tight">
            Banner Management
          </h2>
          <div className="bg-white rounded-[50px] shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-[#94A3B8] text-[10px] font-black uppercase tracking-widest">
                  <th className="text-left py-8 px-10">Banner Details</th>
                  <th className="text-center py-8 px-6">Series</th>
                  <th className="text-left py-8 px-6">Priority</th>
                  <th className="text-center py-8 px-10">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {banners.map((banner) => (
                  <tr
                    key={banner._id}
                    className="group hover:bg-gray-50/50 transition-all"
                  >
                    <td className="py-8 px-10">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
                          {/* Fixed Banner Image Path */}
                          <img
                            src={getImageUrl(banner.imageUrl || banner.image)}
                            className="w-full h-full object-cover"
                            alt={banner.title}
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/64";
                            }}
                          />
                        </div>
                        <span className="font-black text-[#1E293B] text-lg uppercase tracking-tight">
                          {banner.title}
                        </span>
                      </div>
                    </td>
                    <td className="py-8 px-6 text-center">
                      <span className="bg-[#F1F5F9] text-[#64748B] px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {banner.seriesName || "Standard"}
                      </span>
                    </td>
                    <td className="py-8 px-6 font-black text-[#1E293B] text-xl">
                      {banner.priority || 0}
                    </td>
                    <td className="py-8 px-10 text-center flex gap-3 justify-center">
                      <button
                        onClick={() => handleEdit(banner)}
                        className="bg-[#3B82F6] text-white px-4 py-2 rounded-xl font-black text-xs flex items-center justify-center gap-1 hover:bg-blue-700 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(banner._id)}
                        className="bg-[#EF4444] text-white px-4 py-2 rounded-xl font-black text-xs flex items-center justify-center gap-1 hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Product Collection Management */}
        <div>
          <h2 className="text-2xl font-black text-[#1E293B] mb-6 tracking-tight">
            Product Collection Management
          </h2>
          <div className="bg-white rounded-[50px] shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-[#94A3B8] text-[10px] font-black uppercase tracking-widest">
                  <th className="text-left py-8 px-10">Product Details</th>
                  <th className="text-center py-8 px-6">Badge</th>
                  <th className="text-left py-8 px-6">Price</th>
                  <th className="text-center py-8 px-10">Show in Collection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products && products.length > 0 ? (
                  products.map((product) => (
                    <tr
                      key={product._id}
                      className="group hover:bg-gray-50/50 transition-all"
                    >
                      <td className="py-8 px-10">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
                            {/* Fixed Product Image Path */}
                            <img
                              src={getImageUrl(
                                product.thumbnail || product.image,
                              )}
                              className="w-full h-full object-cover"
                              alt={product.name}
                              onError={(e) => {
                                e.target.src = "https://via.placeholder.com/64";
                              }}
                            />
                          </div>
                          <span className="font-black text-[#1E293B] text-lg uppercase tracking-tight">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-8 px-6 text-center">
                        <span className="bg-[#F1F5F9] text-[#64748B] px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                          {product.productTag || "Standard"}
                        </span>
                      </td>
                      <td className="py-8 px-6 font-black text-[#1E293B] text-xl">
                        ₹{product.unitPrice}
                      </td>
                      <td className="py-8 px-10 text-center">
                        <button
                          onClick={() =>
                            toggleAnantamProduct(
                              product._id,
                              product.is_anantam,
                            )
                          }
                          className={`px-6 py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 w-full max-w-[140px] mx-auto shadow-lg transition-transform ${
                            product.is_anantam
                              ? "bg-[#22C55E] text-white hover:scale-105 shadow-green-100"
                              : "bg-[#94A3B8] text-white hover:bg-gray-500"
                          }`}
                        >
                          {product.is_anantam ? (
                            <>
                              <Check className="w-4 h-4" /> ADDED
                            </>
                          ) : (
                            <>
                              <X className="w-4 h-4" /> ADD
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="py-10 text-center text-gray-400 font-bold"
                    >
                      No Products Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnantamBanner;
