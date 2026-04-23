import React, { useState, useEffect } from "react";
import instance, { getImageUrl } from "../../web/api/AxiosConfig";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Search,
  X,
  Loader2,
  Image as ImageIcon,
  Trash2,
  Edit3,
  Plus,
} from "lucide-react";

const Slider = () => {
  const navigate = useNavigate();

  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Product Selection States
  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const initialForm = { title: "", image: null, status: true, productId: "", type: "desktop" };
  const [formData, setFormData] = useState(initialForm);

  const getAuthHeader = (isMultipart = false) => {
    const token = localStorage.getItem("adminToken");
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        ...(isMultipart ? { "Content-Type": "multipart/form-data" } : {}),
      },
    };
  };

  useEffect(() => {
    fetchSliders();
  }, [currentPage, searchTerm]);

  const fetchSliders = async () => {
    try {
      setLoading(true);
      const res = await instance.get(
        `/api/admin/sliders?search=${searchTerm}&page=${currentPage}`,
        getAuthHeader(),
      );
      setSliders(res.data.sliders || []);
    } catch (err) {
      if (err.response?.status === 401) navigate("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await instance.get("/api/products");
      setProducts(res.data.success ? res.data.data : []);
    } catch (err) {
      console.error("Error fetching products", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleSelectProduct = (product) => {
    const productImage = product.images?.[0] || product.thumbnail || "";

    // Logic updated to preserve edit mode if necessary
    setFormData((prev) => ({
      ...prev,
      title: product.name,
      productId: product._id,
      // Only auto-update image if the admin hasn't manually uploaded one yet
      image:
        prev.image && typeof prev.image !== "string"
          ? prev.image
          : productImage,
    }));

    setImagePreview(getImageUrl(productImage));
    setShowProductPicker(false);
    setShowModal(true); // Re-open or keep open the main form
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      const file = files[0];
      setFormData({ ...formData, [name]: file });
      setImagePreview(URL.createObjectURL(file));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null) data.append(key, formData[key]);
    });

    try {
      if (isEditMode) {
        await instance.put(
          `/api/admin/sliders/${selectedId}`,
          data,
          getAuthHeader(true),
        );
      } else {
        await instance.post("/api/admin/sliders", data, getAuthHeader(true));
      }
      closeModal();
      fetchSliders();
    } catch (err) {
      console.error("Error saving slider:", err);
      alert("Error saving slider");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditMode(false);
    setFormData(initialForm);
    setImagePreview(null);
  };

  const confirmDelete = async () => {
    try {
      await instance.delete(
        `/api/admin/sliders/${selectedId}`,
        getAuthHeader(),
      );
      setShowDeleteModal(false);
      fetchSliders();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed");
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()),
  );

  return (
    <div className="p-6 bg-[#f8fafc] min-h-screen text-slate-800 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
              <ImageIcon className="text-blue-600" /> Slider Management
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Manage homepage banners and links
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => {
                setIsEditMode(false); // Ensure we are not in edit mode for new
                fetchProducts();
                setShowProductPicker(true);
              }}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
            >
              <Plus size={18} /> Add Slider
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white uppercase text-[10px] tracking-widest font-bold">
                  <th className="p-5">Banner Preview</th>
                  <th className="p-5">Title / Linked ID</th>
                  <th className="p-5 text-center">Type</th>
                  <th className="p-5 text-center">Status</th>
                  <th className="p-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-10 text-center">
                      <Loader2 className="animate-spin mx-auto text-blue-600" />
                    </td>
                  </tr>
                ) : (
                  sliders.map((slider) => (
                    <tr
                      key={slider._id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="p-4">
                        <img
                          src={getImageUrl(slider.image) || slider.image}
                          className="w-40 h-20 rounded-2xl object-cover border border-slate-100 shadow-sm"
                          alt=""
                        />
                      </td>
                      <td className="p-4">
                        <p className="font-black text-slate-900 uppercase text-sm">
                          {slider.title}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold">
                          PID: {slider.productId || "N/A"}
                        </p>
                      </td>
                      <td className="p-4 text-center">
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-purple-50 text-purple-600 border border-purple-100">
                          {slider.type || "desktop"}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${
                            slider.status
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              : "bg-red-50 text-red-600 border border-red-100"
                          }`}
                        >
                          {slider.status ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => {
                              setFormData({
                                title: slider.title,
                                image: slider.image,
                                status: slider.status,
                                productId: slider.productId,
                                type: slider.type || "desktop",
                              });
                              setImagePreview(slider.image);
                              setSelectedId(slider._id);
                              setIsEditMode(true);
                              setShowModal(true);
                            }}
                            className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedId(slider._id);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* STEP 1: PRODUCT PICKER POPUP - (Remains same) */}
      {showProductPicker && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-white sticky top-0">
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                  Select Product
                </h2>
                <p className="text-xs text-slate-500 font-bold uppercase">
                  Choose a product to link this slider
                </p>
              </div>
              <button
                onClick={() => setShowProductPicker(false)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-4 bg-slate-50">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setProductSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {loadingProducts ? (
                <div className="flex justify-center p-10">
                  <Loader2 className="animate-spin text-blue-600" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center p-10 text-gray-500">
                  No products found
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <div
                    key={product._id}
                    onClick={() => handleSelectProduct(product)}
                    className="flex items-center gap-4 p-3 border border-slate-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50/30 cursor-pointer transition-all group"
                  >
                    <img
                      src={getImageUrl(product.images?.[0])}
                      className="w-16 h-16 object-contain rounded-xl bg-white border"
                      alt=""
                    />
                    <div className="flex-1">
                      <p className="font-bold text-slate-800 text-sm group-hover:text-blue-600">
                        {product.name}
                      </p>
                      <p className="text-xs font-black text-slate-400 uppercase">
                        Price: ₹
                        {product.unitPrice || product.selling_price || 0}
                      </p>
                    </div>
                    <button className="text-[10px] font-black uppercase bg-slate-900 text-white px-4 py-2 rounded-xl group-hover:bg-blue-600">
                      Select
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: SLIDER FORM MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                {isEditMode ? "Edit Slider" : "Finalize Slider"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-1 block">
                  Banner Title
                </label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter Slider Title"
                  className="w-full bg-slate-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-1 block">
                  Linked Product ID
                </label>
                <div className="flex gap-2">
                  <input
                    name="productId"
                    value={formData.productId}
                    className="flex-1 bg-slate-100 border-none p-4 rounded-2xl text-slate-500 font-mono text-xs cursor-not-allowed"
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={() => {
                      fetchProducts();
                      setShowProductPicker(true);
                    }}
                    className="bg-blue-50 text-blue-600 px-4 rounded-2xl text-[10px] font-black uppercase border border-blue-100 hover:bg-blue-100 transition-colors"
                  >
                    Change
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-1 block">
                  Slider Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                >
                  <option value="desktop">Desktop</option>
                  <option value="mobile">Mobile</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4 items-center">
                <div className="relative group cursor-pointer">
                  <div className="h-32 w-full border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center bg-slate-50 group-hover:bg-slate-100 transition-colors">
                    <ImageIcon className="text-slate-300 mb-2" />
                    <span className="text-[10px] font-black text-slate-400 uppercase">
                      Upload Image
                    </span>
                  </div>
                  <input
                    type="file"
                    name="image"
                    onChange={handleChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                {imagePreview && (
                  <img
                    src={getImageUrl(imagePreview)}
                    className="w-full h-32 object-cover rounded-2xl border"
                    alt="preview"
                  />
                )}
              </div>

              <button className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200">
                {isEditMode ? "Update Slider" : "Publish Slider"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL - (Remains same) */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-[2rem] text-center max-w-sm w-full shadow-2xl">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h2 className="text-xl font-black text-slate-900 uppercase mb-2">
              Are you sure?
            </h2>
            <p className="text-sm text-slate-500 font-medium mb-6">
              This slider will be permanently removed from the homepage.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-slate-100 py-4 rounded-2xl font-black uppercase text-xs"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-500 text-white py-4 rounded-2xl font-black uppercase text-xs shadow-lg shadow-red-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Slider;
