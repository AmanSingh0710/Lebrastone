import React, { useState, useEffect } from 'react';
import instance from '../../web/api/AxiosConfig';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Image as ImageIcon, Info, Package, Plus, Trash, Layers, Tag, ShoppingBag, X, Search } from 'lucide-react';

const Season = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    comboPrice: 0,
    originalPrice: 0,
    discountAmount: 0,
    discountType: 'Flat',
    minOrderQty: 1,
    comboStock: 0,
    status: true
  });
const API_BASE ='https://lebrostonebackend4.lifeinfotechinstitute.com';

  const [comboProducts, setComboProducts] = useState([]);
  const [existingThumbnail, setExistingThumbnail] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [thumbnail, setThumbnail] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
    if (isEditMode) {
      fetchComboForEdit();
    }
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await instance.get("/api/products", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllProducts(res.data.data || res.data || []);
    } catch (err) { 
      console.error("Fetch products error", err); 
    }
  };

  const fetchComboForEdit = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await instance.get(`/api/combos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const combo = res.data?.combo;
      if (!combo) return;

      setFormData({
        name: combo.name || '',
        description: combo.description || '',
        comboPrice: Number(combo.comboPrice) || 0,
        originalPrice: Number(combo.originalPrice) || 0,
        discountAmount: Number(combo.discountAmount) || 0,
        discountType: combo.discountType || 'Flat',
        minOrderQty: Number(combo.minOrderQty) || 1,
        comboStock: Number(combo.comboStock) || 0,
        status: combo.status !== false,
      });
      setComboProducts(Array.isArray(combo.products) ? combo.products : []);
      setExistingThumbnail(combo.thumbnail || '');
      setThumbnail(null);
    } catch (err) {
      console.error("Fetch combo for edit error", err);
      alert(err.response?.data?.message || "Failed to load combo for editing");
    }
  };

  // Calculate original price from selected products
  useEffect(() => {
    const total = comboProducts.reduce((sum, p) => sum + (Number(p.unitPrice) || 0), 0);
    setFormData(prev => ({
      ...prev,
      originalPrice: total,
      discountAmount: Math.max(total - Number(prev.comboPrice || 0), 0),
    }));
  }, [comboProducts]);

  const handleAddProduct = (product) => {
    if (!comboProducts.some(p => p._id === product._id)) {
      setComboProducts([...comboProducts, product]);
    }
  };

  const handleRemoveProduct = (productId) => {
    setComboProducts(comboProducts.filter(p => p._id !== productId));
  };

  const handleComboPriceChange = (e) => {
    const price = Number(e.target.value);
    setFormData({
      ...formData,
      comboPrice: price,
      discountAmount: formData.originalPrice - price
    });
  };

 const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (comboProducts.length < 2) return alert("⚠️ Combo mein kam se kam 2 products rakhein!");
    if (formData.comboPrice <= 0) return alert("⚠️ Valid combo price set karein!");

    setLoading(true);
    const data = new FormData();
    
    // ✅ Data Append
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('comboPrice', Number(formData.comboPrice));
    data.append('originalPrice', Number(formData.originalPrice));
    data.append('discountAmount', Number(formData.discountAmount));
    data.append('discountType', formData.discountType);
    data.append('minOrderQty', Number(formData.minOrderQty));
    data.append('comboStock', Number(formData.comboStock));
    data.append('status', formData.status);
    
    // ✅ Fixed: Products ID Array ko Stringify karke bhejein
    const productIds = comboProducts.map(p => p._id);
    data.append('products', JSON.stringify(productIds)); 
    
    if (thumbnail) data.append('thumbnail', thumbnail);

    try {
      const token = localStorage.getItem("adminToken");
      const endpoint = isEditMode ? `/api/combos/${id}` : "/api/combos";
      const method = isEditMode ? "put" : "post";
      await instance[method](endpoint, data, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert(isEditMode ? "✅ Combo Updated Successfully!" : "✅ Combo Created Successfully!");
      if (isEditMode) {
        navigate("/admin/comboslist");
      } else {
        resetForm();
      }
    } catch (err) { 
      console.error(err);
      alert("❌ Error: " + (err.response?.data?.message || "Server Internal Error")); 
    } finally {
      setLoading(false);
    }
  };
  // Filter products
  const filteredProducts = allProducts.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !comboProducts.some(cp => cp._id === product._id)
  );

  const resetForm = () => {
  setFormData({
    name: '',
    description: '',
    comboPrice: 0,
    originalPrice: 0,
    discountAmount: 0,
    discountType: 'Flat',
    minOrderQty: 1,
    comboStock: 0,
    status: true
  });
  setComboProducts([]);
  setThumbnail(null);
  setExistingThumbnail('');
  // Agar file input use kar rahe ho toh use bhi reset karein
  const fileInput = document.querySelector('input[type="file"]');
  if (fileInput) fileInput.value = "";
};

  return (
    <div className="p-4 md:p-6 bg-[#f8fafc] min-h-screen text-slate-700 font-sans">
      
      {/* --- Heading --- */}
      <h1 className="text-xl font-bold mb-6 flex items-center gap-2">
        <ShoppingBag size={20} className="text-purple-600" />
        {isEditMode ? "Edit Combo Offer" : "Create New Combo Offer"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-[1400px] mx-auto">
        
        {/* BASIC INFO */}
        <div className="bg-white rounded shadow-sm border p-6">
          <label className="block text-xs font-bold mb-2 uppercase text-slate-500 italic">Combo Name</label>
          <input 
            type="text" 
            placeholder="Ex: Summer Special Combo, Family Pack"
            className="w-full border rounded p-2.5 mb-4 font-semibold text-lg" 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
            required 
          />
          
          <label className="block text-xs font-bold mb-2 uppercase text-slate-500 italic">Combo Description</label>
          <div className="h-64 mb-4">
            <ReactQuill 
              theme="snow" 
              className="h-48 bg-white" 
              value={formData.description} 
              onChange={val => setFormData({...formData, description: val})} 
            />
          </div>
        </div>

        {/* COMBO PRODUCTS SECTION */}
        <div className="bg-white rounded shadow-sm border">
          <div className="px-6 py-4 border-b bg-slate-50 flex items-center gap-2 font-bold uppercase text-xs">
            <Package size={18} className="text-purple-600" /> Combo Products
          </div>
          
          <div className="p-6">
            {/* Selected Products */}
            <div className="mb-6">
              <label className="block text-xs font-bold mb-3 uppercase italic text-slate-500">
                Selected Products ({comboProducts.length})
                <span className="text-red-500 ml-1">*</span>
              </label>
              
              {comboProducts.length === 0 ? (
                <div className="border-2 border-dashed rounded-lg p-12 text-center bg-slate-50">
                  <Package size={60} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm font-bold">Add products to create combo</p>
                  <p className="text-xs text-slate-500 mt-1">Minimum 2 products required</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {comboProducts.map((product) => (
                    <div 
                      key={product._id} 
                      className="border rounded-lg p-4 bg-purple-50 relative group hover:shadow-md transition-all"
                    >
                      <button 
                        type="button"
                        onClick={() => handleRemoveProduct(product._id)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-700 shadow-md z-10"
                      >
                        <X size={16} />
                      </button>
                      
                      <div className="flex items-start gap-3">
                        {product.thumbnail ? (
                          <img 
                            src={`${API_BASE}${product.thumbnail}`} 
                            alt={product.name} 
                            className="w-16 h-16 object-cover rounded border"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-slate-200 rounded border flex items-center justify-center">
                            <Package size={24} className="text-slate-400" />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-slate-800 line-clamp-1">
                            {product.name}
                          </h4>
                          <p className="text-xs text-slate-600 mt-1 font-bold">
                            ₹{product.unitPrice} <span className="text-[10px] text-slate-400">/ {product.unit}</span>
                          </p>
                          {product.category?.name && (
                            <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded mt-1 inline-block">
                              {product.category.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Products Button */}
            <button
              type="button"
              onClick={() => setShowProductModal(true)}
              disabled={comboProducts.length >= 10}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-purple-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={18} /> 
              {comboProducts.length === 0 ? 'Add Products to Combo' : 'Add More Products'}
              {comboProducts.length >= 10 && <span className="text-xs">(Max 10 products)</span>}
            </button>

            {/* Combo Stats */}
            {comboProducts.length >= 2 && (
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">Total Products</p>
                    <p className="text-2xl font-black text-purple-600">{comboProducts.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">Original Price</p>
                    <p className="text-lg font-bold text-slate-600 line-through">₹{formData.originalPrice}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">Total Savings</p>
                    <p className="text-lg font-black text-green-600">₹{formData.discountAmount}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* COMBO PRICING */}
        <div className="bg-white rounded shadow-sm border">
          <div className="px-6 py-4 border-b bg-slate-50 flex items-center gap-2 font-bold uppercase text-xs">
            <Tag size={18} className="text-purple-600" /> Combo Pricing
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Original Price (Auto-calculated) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase italic flex items-center gap-1">
                Original Price (Auto)
              </label>
              <input 
                type="number" 
                className="w-full border rounded-lg p-2.5 bg-slate-100 cursor-not-allowed font-bold text-slate-600" 
                value={formData.originalPrice} 
                readOnly
              />
              <p className="text-[10px] text-slate-400 mt-1">Sum of all product prices</p>
            </div>

            {/* Combo Price */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase italic flex items-center gap-1">
                Combo Price (Special) <span className="text-red-500">*</span>
              </label>
              <input 
                type="number" 
                className="w-full border rounded-lg p-2.5 outline-none focus:border-purple-400 font-bold text-purple-600" 
                value={formData.comboPrice} 
                onChange={handleComboPriceChange}
                required
                min="1"
              />
              <p className="text-[10px] text-slate-400 mt-1">Special discounted price</p>
            </div>

            {/* Savings Display */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase italic">
                Total Savings
              </label>
              <div className="w-full border rounded-lg p-2.5 bg-green-50 font-black text-green-700 text-lg">
                ₹{formData.discountAmount}
              </div>
              {formData.originalPrice > 0 && (
                <p className="text-[10px] text-green-600 font-bold mt-1">
                  {(((formData.discountAmount / formData.originalPrice) * 100) || 0).toFixed(1)}% OFF
                </p>
              )}
            </div>

            {/* Minimum Order Quantity */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase italic">
                Min Order Qty
              </label>
              <input 
                type="number" 
                className="w-full border rounded-lg p-2.5 outline-none focus:border-purple-400" 
                value={formData.minOrderQty} 
                onChange={e => setFormData({...formData, minOrderQty: e.target.value})}
                min="1"
              />
            </div>

            {/* Combo Stock */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase italic">
                Combo Stock Qty
              </label>
              <input 
                type="number" 
                className="w-full border rounded-lg p-2.5 outline-none focus:border-purple-400" 
                value={formData.comboStock} 
                onChange={e => setFormData({...formData, comboStock: e.target.value})}
                min="0"
              />
              <p className="text-[10px] text-slate-400 mt-1">Available combo packs</p>
            </div>

            {/* Discount Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase italic">
                Discount Type
              </label>
              <select 
                className="w-full border rounded-lg p-2.5 bg-white outline-none focus:border-purple-400" 
                value={formData.discountType} 
                onChange={e => setFormData({...formData, discountType: e.target.value})}
              >
                <option value="Flat">Flat Discount</option>
                <option value="Percent">Percentage</option>
              </select>
            </div>
          </div>
        </div>

        {/* THUMBNAIL */}
        <div className="bg-white rounded shadow-sm border">
          <div className="px-6 py-4 border-b bg-slate-50 flex items-center gap-2 font-bold uppercase text-xs">
            <ImageIcon size={18} className="text-purple-600" /> Combo Thumbnail
          </div>
          
          <div className="p-6">
            <label className="block text-xs font-bold mb-4 uppercase text-slate-500 italic">
              Combo Image (16:9 Recommended)
            </label>
            <div className="border-2 border-dashed rounded-lg p-8 text-center relative cursor-pointer bg-slate-50 min-h-[200px] flex items-center justify-center">
              {thumbnail || existingThumbnail ? (
                <img 
                  src={thumbnail ? URL.createObjectURL(thumbnail) : `${API_BASE}${existingThumbnail}`}
                  alt="Combo thumbnail" 
                  className="max-h-48 object-contain" 
                />
              ) : (
                <>
                  <ShoppingBag size={48} className="text-slate-300 mb-2" />
                  <p className="text-slate-400 text-sm">Upload combo promotional image</p>
                </>
              )}
              <input 
                type="file" 
                accept="image/*" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={e => setThumbnail(e.target.files[0])} 
              />
            </div>
          </div>
        </div>

        {/* STATUS */}
        <div className="bg-white rounded shadow-sm border p-6">
          <div className="flex items-center justify-between max-w-md">
            <div className="flex items-center gap-2">
              <Info size={16} className="text-slate-400" />
              <span className="text-xs font-bold uppercase text-slate-500 italic">
                Combo Status
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={formData.status} 
                onChange={e => setFormData({ ...formData, status: e.target.checked })} 
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>

        {/* SUBMIT BUTTONS */}
        <div className="flex justify-end gap-4 pb-10">
          <button 
            type="button"
            onClick={() => {
              if (isEditMode) {
                navigate("/admin/comboslist");
                return;
              }
              setFormData({
                name: '', description: '', comboPrice: 0, originalPrice: 0,
                discountAmount: 0, discountType: 'Flat', minOrderQty: 1,
                comboStock: 0, status: true
              });
              setComboProducts([]);
              setThumbnail(null);
              setExistingThumbnail('');
            }}
            className="px-10 py-3 bg-slate-400 text-white rounded font-bold hover:bg-slate-500 shadow-md transition-all uppercase text-sm"
          >
            {isEditMode ? "Back" : "Reset"}
          </button>
          <button 
            type="submit" 
            disabled={comboProducts.length < 2 || !formData.comboPrice}
            className="px-10 py-3 bg-purple-600 text-white rounded font-bold shadow-xl flex items-center gap-2 hover:bg-purple-700 transition-all uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} /> {isEditMode ? "Update Combo Offer" : "Create Combo Offer"}
          </button>
        </div>
      </form>

      {/* --- PRODUCT SELECTION MODAL --- */}
      {showProductModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Package size={20} className="text-purple-600" />
                Select Products for Combo
              </h2>
              <button 
                onClick={() => setShowProductModal(false)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X size={24} className="text-slate-500" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="px-6 py-4 border-b bg-white">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search products by name..."
                  className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Product Grid */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <Package size={48} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">
                    {searchQuery ? 'No products found' : 'Sabhi products select ho gaye hain!'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredProducts.map((product) => (
                    <div 
                      key={product._id} 
                      className="border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer hover:border-purple-400 group relative"
                      onClick={() => handleAddProduct(product)}
                    >
                      <div className="flex items-start gap-3">
                        {product.thumbnail ? (
                          <img 
                            src={`${API_BASE}${product.thumbnail}`} 
                            alt={product.name} 
                            className="w-16 h-16 object-cover rounded border"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-slate-200 rounded border flex items-center justify-center">
                            <Package size={24} className="text-slate-400" />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-slate-800 line-clamp-1">
                            {product.name}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                            {product.description 
                              ? product.description.replace(/<[^>]*>/g, '').substring(0, 60) + '...' 
                              : 'No description'}
                          </p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-sm font-bold text-purple-600">
                              ₹{product.unitPrice}
                            </span>
                            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded">
                              {product.unit}
                            </span>
                          </div>
                          {product.category?.name && (
                            <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded mt-1 inline-block">
                              {product.category.name}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-purple-600 text-white rounded-full p-2 shadow-lg">
                          <Plus size={16} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t bg-slate-50 flex justify-between items-center">
              <p className="text-sm text-slate-600 font-bold">
                Selected: <span className="text-purple-600">{comboProducts.length}</span> | 
                Available: <span className="text-slate-500">{filteredProducts.length}</span>
              </p>
              <button
                onClick={() => setShowProductModal(false)}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Season;
