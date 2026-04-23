import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, Search, X, Save } from 'lucide-react';
import instance, { getImageUrl } from '../../web/api/AxiosConfig';

const Offerbanner = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const productDropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    type: 'offerBanner',
    image: null,
    existingImage: '',
    productId: null,
    selectedProduct: null,
    status: true
  });

  useEffect(() => {
    fetchOfferContent();
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (productDropdownRef.current && !productDropdownRef.current.contains(event.target)) {
        setShowProductDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (productSearch.trim()) {
      const searchLower = productSearch.toLowerCase();
      const filtered = allProducts.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.category?.name?.toLowerCase().includes(searchLower)
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(allProducts.slice(0, 20));
    }
  }, [productSearch, allProducts]);

  const getAuthHeader = () => {
    const token = localStorage.getItem('adminToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchOfferContent = async () => {
    try {
      const res = await instance.get('/api/offer-content/type/offerBanner', { headers: getAuthHeader() });
      if (res.data.success && res.data.data) {
        const data = res.data.data;
        setFormData({
          ...formData,
          existingImage: data.image || '',
          productId: data.productId?._id || null,
          selectedProduct: data.productId || null,
          status: data.status !== false
        });
      }
    } catch (err) {
      console.error('Error fetching offer content:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProducts = async () => {
    if (allProducts.length > 0) return;
    setLoadingProducts(true);
    try {
      const res = await instance.get('/api/products', { headers: getAuthHeader() });
      if (res.data.success) {
        setAllProducts(res.data.data);
        setFilteredProducts(res.data.data.slice(0, 20));
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleProductSearch = (e) => {
    setProductSearch(e.target.value);
    setShowProductDropdown(true);
    fetchAllProducts();
  };

  const selectProduct = (product) => {
    setFormData({
      ...formData,
      productId: product._id,
      selectedProduct: product
    });
    setProductSearch('');
    setShowProductDropdown(false);
  };

  const removeProduct = () => {
    setFormData({
      ...formData,
      productId: null,
      selectedProduct: null
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = new FormData();
      data.append('type', 'offerBanner');
      data.append('status', formData.status);
      
      // Khali values bhejna zaroori hai agar backend titles expect kar raha ho
      data.append('title', ''); 
      data.append('description', '');
      data.append('ctaText', '');

      if (formData.productId) {
        data.append('productId', formData.productId);
      }
      if (formData.image) {
        data.append('image', formData.image);
      }

      const headers = { 
        ...getAuthHeader(),
        'Content-Type': 'multipart/form-data' 
      };

      const res = await instance.post('/api/offer-content', data, { headers });
      if (res.data.success) {
        alert('Offer Banner saved successfully!');
        fetchOfferContent();
      }
    } catch (err) {
      console.error('Error saving offer:', err);
      alert('Error saving offer content');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Offer Banner</h1>
        <p className="text-gray-500 text-sm mb-6">Upload banner image and link it to a product</p>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 shadow-sm">
          
          {/* Banner Image Selection */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Banner Image *</label>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-full md:w-80 h-40 border-2 border-dashed rounded-2xl flex items-center justify-center overflow-hidden bg-gray-50">
                {formData.image ? (
                  <img src={URL.createObjectURL(formData.image)} alt="Preview" className="w-full h-full object-cover" />
                ) : formData.existingImage ? (
                  <img src={getImageUrl(formData.existingImage)} alt="Existing" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <ImageIcon className="text-gray-400 mx-auto mb-2" size={40} />
                    <p className="text-xs text-gray-400">No image selected</p>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Recommended: 1200x400px</p>
              </div>
            </div>
          </div>

          {/* Product Linking */}
          <div className="mb-8" ref={productDropdownRef}>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Link to Product (Redirect on Click)</label>
            
            {formData.selectedProduct ? (
              <div className="flex items-center gap-4 p-4 border-2 border-blue-100 rounded-2xl bg-blue-50/30">
                <img
                  src={formData.selectedProduct.images?.[0] ? getImageUrl(formData.selectedProduct.images[0]) : '/placeholder.jpg'}
                  alt={formData.selectedProduct.name}
                  className="w-14 h-14 object-cover rounded-xl shadow-sm"
                />
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800 uppercase tracking-tight">{formData.selectedProduct.name}</p>
                  <p className="text-xs font-bold text-blue-600">₹{formData.selectedProduct.selling_price || formData.selectedProduct.unitPrice || 0}</p>
                </div>
                <button
                  type="button"
                  onClick={removeProduct}
                  className="p-2 bg-white rounded-full text-red-500 hover:bg-red-50 shadow-sm transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={productSearch}
                  onChange={handleProductSearch}
                  onFocus={() => {
                    setShowProductDropdown(true);
                    fetchAllProducts();
                  }}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                  placeholder="Search and select a product..."
                />
                
                {showProductDropdown && (
                  <div className="mt-2 border rounded-2xl max-h-64 overflow-y-auto bg-white shadow-xl absolute z-20 w-full animate-in fade-in slide-in-from-top-2">
                    {loadingProducts ? (
                      <div className="p-4 text-center text-gray-500 font-medium">Loading products...</div>
                    ) : filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => (
                        <div
                          key={product._id}
                          onClick={() => selectProduct(product)}
                          className="flex items-center gap-4 p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-b-0 transition-colors"
                        >
                          <img
                            src={product.images?.[0] ? getImageUrl(product.images[0]) : '/placeholder.jpg'}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-bold text-gray-700">{product.name}</p>
                            <p className="text-xs text-gray-500">₹{product.unitPrice || product.selling_price || 0}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">No products found</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Visibility Status */}
          <div className="mb-8 flex items-center gap-3 bg-gray-50 p-4 rounded-2xl w-fit">
            <input
              type="checkbox"
              id="status"
              checked={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
              className="w-5 h-5 text-blue-600 rounded-md cursor-pointer accent-blue-600"
            />
            <label htmlFor="status" className="text-sm font-bold text-gray-700 cursor-pointer uppercase tracking-wider">Banner Visible</label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white px-6 py-4 rounded-2xl hover:bg-black transition-all disabled:opacity-50 font-black text-xs uppercase tracking-widest shadow-lg shadow-slate-200"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Updating...
              </>
            ) : (
              <>
                <Save size={18} /> Update Offer Banner
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Offerbanner;