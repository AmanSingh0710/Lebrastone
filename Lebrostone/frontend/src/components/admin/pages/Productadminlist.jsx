import React, { useState, useEffect } from "react";
import instance, { getImageUrl } from "../../web/api/AxiosConfig";
import {
  Search,
  Download,
  Plus,
  Eye,
  Edit,
  Trash2,
  RotateCcw,
  Box,
  Filter,
  Loader2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { CSVLink } from "react-csv";

const Productadminlist = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Master Lists
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [subSubCategories, setSubSubCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Selection States
  const [selBrand, setSelBrand] = useState("");
  const [selCat, setSelCat] = useState("");
  const [selSubCat, setSelSubCat] = useState("");
  const [selSubSubCat, setSelSubSubCat] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // ✅ FIXED: csvHeaders define kiya gaya hai
  const csvHeaders = [
    { label: "SL", key: "sl" },
    { label: "Product Name", key: "name" },
    { label: "SKU", key: "sku" },
    { label: "Price (INR)", key: "unitPrice" },
    { label: "Stock Qty", key: "currentStockQty" },
    { label: "Status", key: "statusText" },
  ];

  useEffect(() => {
    fetchProducts();
    fetchFilters();
  }, []);

  const fetchFilters = async () => {
    try {
      const [catRes, subRes, subSubRes, brandRes] = await Promise.all([
        instance.get("/api/categories"),
        instance.get("/api/subcategories"),
        instance.get("/api/subsubcategories"),
        instance.get("/api/brands"),
      ]);
      setCategories(catRes.data.data || []);
      setSubCategories(subRes.data.data || []);
      setSubSubCategories(subSubRes.data.data || []);
      setBrands(brandRes.data.data || []);
    } catch (err) {
      console.error("Filter fetch error", err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await instance.get("/api/products");
      const data = res.data.data || [];
      setProducts(data);
      setFilteredProducts(data);
    } catch (err) {
      console.error("Fetch Error", err);
    } finally {
      setLoading(false);
    }
  };

  // Combined Filter Logic
  useEffect(() => {
    let results = products;

    if (searchTerm) {
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.sku?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    if (selBrand)
      results = results.filter((p) => (p.brand?._id || p.brand) === selBrand);
    if (selCat)
      results = results.filter(
        (p) => (p.category?._id || p.category) === selCat,
      );
    if (selSubCat)
      results = results.filter(
        (p) => (p.subCategory?._id || p.subCategory) === selSubCat,
      );
    if (selSubSubCat)
      results = results.filter(
        (p) => (p.subSubCategory?._id || p.subSubCategory) === selSubSubCat,
      );

    setFilteredProducts(results);
  }, [searchTerm, selBrand, selCat, selSubCat, selSubSubCat, products]);

  // CSV Data preparation
  const csvData = filteredProducts.map((p, index) => ({
    sl: index + 1,
    name: p.name,
    sku: p.sku || "N/A",
    unitPrice: p.unitPrice,
    currentStockQty: p.currentStockQty,
    statusText: p.status ? "Active" : "Inactive",
  }));

  const handleStatusToggle = async (id) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await instance.put(
        `/api/products/status/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.data.success) {
        setProducts(
          products.map((p) =>
            p._id === id ? { ...p, status: res.data.status } : p,
          ),
        );
      }
    } catch (err) {
      alert("Status update failed!");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this product?")) {
      try {
        await instance.delete(`/api/products/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        });
        fetchProducts();
      } catch (err) {
        alert("Delete error!");
      }
    }
  };

  const getDisplayImageUrl = (url) => {
    if (!url) return "https://via.placeholder.com/40";
    return getImageUrl(url) || "https://via.placeholder.com/40";
  };
  const updateProductTag = async (productId, newTag) => {
    try {
      setUpdatingId(productId);
      const adminToken = localStorage.getItem("adminToken");

      // Backend ko update bhejna
      await instance.put(
        `/api/products/${productId}`,
        { productTag: newTag },
        { headers: { Authorization: `Bearer ${adminToken}` } },
      );

      // Local state update bina refresh ke
      setProducts((prev) =>
        prev.map((p) =>
          p._id === productId ? { ...p, productTag: newTag } : p,
        ),
      );
    } catch (error) {
      console.error("Update Error", error);
      alert("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };
  const getTagStyle = (tag) => {
    switch (tag) {
      case "Best Seller":
        return "text-amber-600 border-amber-200 bg-amber-50";
      case "New Arrival":
        return "text-blue-600 border-blue-200 bg-blue-50";
      default:
        return "text-slate-500 border-slate-200 bg-slate-50";
    }
  };

  return (
    <div className="p-4 md:p-6 bg-[#F9FAFB] min-h-screen font-sans text-slate-700">
      {/* FILTER SECTION */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <h3 className="text-sm font-bold mb-4 text-slate-800 uppercase flex items-center gap-2">
          <Filter size={16} /> Filter Products
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Brand
            </label>
            <select
              className="w-full border rounded-lg p-2 text-sm font-bold outline-none"
              value={selBrand}
              onChange={(e) => setSelBrand(e.target.value)}
            >
              <option value="">All Brands</option>
              {brands.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Category
            </label>
            <select
              className="w-full border rounded-lg p-2 text-sm font-bold outline-none"
              value={selCat}
              onChange={(e) => {
                setSelCat(e.target.value);
                setSelSubCat("");
              }}
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
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Sub Category
            </label>
            <select
              className="w-full border rounded-lg p-2 text-sm font-bold outline-none"
              value={selSubCat}
              onChange={(e) => setSelSubCat(e.target.value)}
            >
              <option value="">Select Sub Category</option>
              {subCategories
                .filter(
                  (s) => (s.mainCategory?._id || s.mainCategory) === selCat,
                )
                .map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Sub Sub Category
            </label>
            <select
              className="w-full border rounded-lg p-2 text-sm font-bold outline-none"
              value={selSubSubCat}
              onChange={(e) => setSelSubSubCat(e.target.value)}
            >
              <option value="">Select Sub Sub Category</option>
              {subSubCategories
                .filter(
                  (ss) => (ss.subCategory?._id || ss.subCategory) === selSubCat,
                )
                .map((ss) => (
                  <option key={ss._id} value={ss._id}>
                    {ss.name}
                  </option>
                ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={() => {
              setSelBrand("");
              setSelCat("");
              setSelSubCat("");
              setSelSubSubCat("");
              setSearchTerm("");
            }}
            className="px-6 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold flex items-center gap-1 hover:bg-slate-200"
          >
            <RotateCcw size={16} /> Reset
          </button>
        </div>
      </div>

      {/* LIST HEADER */}
      <div className="flex items-center gap-2 mb-6">
        <Box className="text-slate-600" size={24} />
        <h1 className="text-lg font-bold text-slate-800">
          In House Product List
          <span className="ml-2 bg-slate-200 px-2 py-0.5 rounded-md text-xs">
            {filteredProducts.length}
          </span>
        </h1>
      </div>

      {/* ACTION BAR */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
        <div className="p-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex border rounded-lg overflow-hidden w-full md:w-96 shadow-sm">
            <div className="pl-3 flex items-center bg-white">
              <Search size={18} className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search product name or SKU..."
              className="p-2 w-full outline-none text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {/* ✅ FIXED: headers={csvHeaders} ab defined hai */}
            <CSVLink
              data={csvData}
              headers={csvHeaders}
              filename="product_report.csv"
              className="flex items-center gap-2 border border-slate-200 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-50"
            >
              <Download size={16} className="text-blue-500" /> Export
            </CSVLink>
            <Link
              to="/admin/addproduct"
              className="bg-[#0082CC] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 flex items-center gap-1"
            >
              <Plus size={18} /> Add product
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-[#F8FAFC] text-slate-600 font-bold border-y uppercase text-[11px]">
              <tr>
                <th className="px-6 py-4">SL</th>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4 text-center">Unit Price</th>
                <th className="px-6 py-4 text-center">Stock</th>
                <th className="px-6 py-4 text-center">Active Status</th>
                <th className="p-8 text-center">Display Status (Tag)</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-10">
                    Loading...
                  </td>
                </tr>
              ) : (
                filteredProducts.map((item, index) => (
                  <tr
                    key={item._id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 border rounded-lg overflow-hidden bg-white shrink-0 shadow-sm">
                          <img
                            src={getDisplayImageUrl(item.thumbnail)}
                            className="w-full h-full object-cover"
                            alt=""
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700 line-clamp-1">
                            {item.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">
                            SKU: {item.sku || "N/A"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-800">
                      ₹{item.unitPrice}
                    </td>
                    <td className="px-6 py-4 text-center font-medium">
                      {item.currentStockQty}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center">
                        <label className="relative inline-flex items-center cursor-pointer group">
                          {/* Hidden Checkbox */}
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={item.status}
                            onChange={() => handleStatusToggle(item._id)}
                          />

                          {/* Toggle Background */}
                          <div
                            className="w-14 h-7 bg-slate-200 rounded-full peer 
                peer-checked:after:translate-x-full 
                peer-checked:after:border-white 
                after:content-[''] 
                after:absolute 
                after:top-[4px] 
                after:left-[4px] 
                after:bg-white 
                after:border-gray-300 
                after:border 
                after:rounded-full 
                after:h-[20px] 
                after:w-[20px] 
                after:transition-all 
                after:shadow-sm
                peer-checked:bg-emerald-500 
                group-hover:ring-4 
                group-hover:ring-slate-100 
                peer-focus:outline-none"
                          ></div>

                          {/* Optional: Text Label (Visual clarity ke liye) */}
                          <span
                            className={`ml-3 text-[10px] font-black uppercase tracking-widest ${item.status ? "text-emerald-600" : "text-slate-400"}`}
                          >
                            {item.status ? "On" : "Off"}
                          </span>
                        </label>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {/* ✅ DROPDOWN SELECT FOR TAGS */}
                      <div className="flex justify-center min-w-[120px]">
                        {updatingId === item._id ? (
                          <Loader2
                            className="animate-spin text-blue-500"
                            size={18}
                          />
                        ) : (
                          <select
                            value={item.productTag || "Simple"}
                            onChange={(e) =>
                              updateProductTag(item._id, e.target.value)
                            }
                            className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-wider outline-none cursor-pointer appearance-none text-center transition-all ${getTagStyle(item.productTag)}`}
                          >
                            <option value="Simple">Simple</option>
                            <option value="Best Seller">Best Seller</option>
                            <option value="New Arrival">New Arrival</option>
                          </select>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() =>
                            navigate(`/admin/product/view/${item._id}`)
                          }
                          className="p-1.5 border border-blue-100 text-blue-500 rounded hover:bg-blue-50"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/admin/product/edit/${item._id}`)
                          }
                          className="p-1.5 border border-green-100 text-green-500 rounded hover:bg-green-50"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-1.5 border border-red-100 text-red-500 rounded hover:bg-red-50"
                        >
                          <Trash2 size={14} />
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
  );
};

export default Productadminlist;
