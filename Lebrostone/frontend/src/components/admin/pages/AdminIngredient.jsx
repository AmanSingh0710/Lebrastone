import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Edit, ToggleLeft, ToggleRight, Plus, X, Search, Image as ImageIcon } from 'lucide-react';
import instance, { getImageUrl } from '../../web/api/AxiosConfig';

const AdminIngredient = () => {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Product selection state
  const [allProducts, setAllProducts] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const productDropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    image: null,
    existingImage: '',
    products: [],
    status: true,
    order: 0
  });

  useEffect(() => {
    fetchIngredients();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (productDropdownRef.current && !productDropdownRef.current.contains(event.target)) {
        setShowProductDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter products when search changes
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

  const fetchIngredients = async () => {
    try {
      const res = await instance.get('/api/ingredients/all', { headers: getAuthHeader() });
      if (res.data.success) {
        setIngredients(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching ingredients:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProducts = async () => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('status', formData.status);
      data.append('order', formData.order || 0);
      data.append('products', JSON.stringify(formData.products.map(p => p._id || p)));
      
      if (formData.image) {
        data.append('image', formData.image);
      }

      const headers = { 
        ...getAuthHeader(),
        'Content-Type': 'multipart/form-data' 
      };

      if (editingId) {
        const res = await instance.put(`/api/ingredients/${editingId}`, data, { headers });
        if (res.data.success) {
          alert('Ingredient updated successfully!');
          resetForm();
          fetchIngredients();
        }
      } else {
        const res = await instance.post('/api/ingredients', data, { headers });
        if (res.data.success) {
          alert('Ingredient created successfully!');
          resetForm();
          fetchIngredients();
        }
      }
    } catch (err) {
      console.error('Error saving ingredient:', err);
      alert('Error saving ingredient');
    }
  };

  const handleEdit = async (ingredient) => {
    setEditingId(ingredient._id);
    setFormData({
      title: ingredient.title,
      image: null,
      existingImage: ingredient.image || '',
      products: ingredient.products || [],
      status: ingredient.status,
      order: ingredient.order || 0
    });
    setShowForm(true);
    await fetchAllProducts();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this ingredient?')) return;
    try {
      const res = await instance.delete(`/api/ingredients/${id}`, { headers: getAuthHeader() });
      if (res.data.success) {
        alert('Ingredient deleted successfully!');
        fetchIngredients();
      }
    } catch (err) {
      console.error('Error deleting ingredient:', err);
      alert('Error deleting ingredient');
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await instance.put(`/api/ingredients/${id}/toggle`, {}, { headers: getAuthHeader() });
      if (res.data.success) {
        fetchIngredients();
      }
    } catch (err) {
      console.error('Error toggling ingredient:', err);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      title: '',
      image: null,
      existingImage: '',
      products: [],
      status: true,
      order: 0
    });
    setProductSearch('');
    setFilteredProducts([]);
    setAllProducts([]);
    setShowProductDropdown(false);
  };

  const openCreateForm = async () => {
    resetForm();
    setShowForm(true);
    await fetchAllProducts();
  };

  const addProduct = (product) => {
    if (formData.products.find(p => p._id === product._id)) return;
    setFormData({
      ...formData,
      products: [...formData.products, product]
    });
    setProductSearch('');
    setShowProductDropdown(false);
  };

  const removeProduct = (index) => {
    const newProducts = [...formData.products];
    newProducts.splice(index, 1);
    setFormData({ ...formData, products: newProducts });
  };

  const filteredIngredients = ingredients.filter(i =>
    i.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Shop By Ingredients</h1>
          <p className="text-gray-500 text-sm">Manage ingredients and their products</p>
        </div>
        <button
          onClick={openCreateForm}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} /> Add Ingredient
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Form Modal with Split View */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 w-full max-w-6xl m-4 max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center mb-4 border-b pb-4">
              <h2 className="text-xl font-bold">{editingId ? 'Edit Ingredient' : 'Add New Ingredient'}</h2>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-6 max-h-[calc(90vh-120px)]">
              {/* Left Side - Form Fields */}
              <div className="w-1/2 overflow-y-auto pr-2">
                {/* Title */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ingredient Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Rice Water, Charcoal, Vitamin C"
                    required
                  />
                </div>

                {/* Image */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
                      {formData.image ? (
                        <img src={URL.createObjectURL(formData.image)} alt="Preview" className="w-full h-full object-cover" />
                      ) : formData.existingImage ? (
                        <img src={getImageUrl(formData.existingImage)} alt="Existing" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="text-gray-400" />
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                      className="text-sm text-gray-500"
                    />
                  </div>
                </div>

                {/* Order */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>

                {/* Status */}
                <div className="mb-4 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="status"
                    checked={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <label htmlFor="status" className="text-sm font-medium text-gray-700">Active</label>
                </div>

                {/* Product Search */}
                <div className="mb-4" ref={productDropdownRef}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Products</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => {
                        setProductSearch(e.target.value);
                        setShowProductDropdown(true);
                      }}
                      onFocus={() => setShowProductDropdown(true)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Search products by name or category..."
                    />
                  </div>
                  
                  {/* Search Results Dropdown */}
                  {showProductDropdown && (
                    <div className="mt-2 border rounded-lg max-h-64 overflow-y-auto bg-white shadow-lg">
                      {loadingProducts ? (
                        <div className="p-4 text-center text-gray-500">Loading products...</div>
                      ) : filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                          <div
                            key={product._id}
                            onClick={() => addProduct(product)}
                            className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                          >
                            <img
                              src={product.images?.[0] ? getImageUrl(product.images[0]) : '/placeholder.jpg'}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{product.name}</p>
                              <p className="text-xs text-gray-500">{product.category?.name || 'Uncategorized'} • ₹{product.unitPrice || product.selling_price || 0}</p>
                            </div>
                            <Plus size={18} className="text-blue-600" />
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500">No products found</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Products */}
                {formData.products.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Selected Products ({formData.products.length})
                    </label>
                    <div className="border rounded-lg max-h-48 overflow-y-auto">
                      {formData.products.map((product, index) => (
                        <div
                          key={product._id || index}
                          className="flex items-center gap-3 p-2 border-b last:border-b-0"
                        >
                          <img
                            src={product.images?.[0] ? getImageUrl(product.images[0]) : '/placeholder.jpg'}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{product.name}</p>
                            <p className="text-xs text-gray-500">₹{product.selling_price || product.unitPrice || 0}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeProduct(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4 sticky bottom-0 bg-white pb-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingId ? ' Update Ingredient' : ' Create Ingredient'}
                  </button>
                </div>
              </div>

              {/* Right Side - All Products List */}
              <div className="w-1/2 border-l pl-6 overflow-hidden flex flex-col">
                <h3 className="text-lg font-semibold mb-3">All Products</h3>
                
                {/* Products Filter */}
                <div className="mb-3">
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      setShowProductDropdown(true);
                    }}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Search to filter products..."
                  />
                </div>

                {/* Products Grid */}
                <div className="flex-1 overflow-y-auto">
                  {loadingProducts ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {filteredProducts.map((product) => {
                        const isSelected = formData.products.some(p => p._id === product._id);
                        return (
                          <div
                            key={product._id}
                            onClick={() => !isSelected && addProduct(product)}
                            className={`border rounded-lg p-2 cursor-pointer transition-all ${
                              isSelected 
                                ? 'bg-green-50 border-green-300 opacity-60' 
                                : 'hover:border-blue-300 hover:shadow-sm'
                            }`}
                          >
                            <img
                              src={product.images?.[0] ? getImageUrl(product.images[0]) : '/placeholder.jpg'}
                              alt={product.name}
                              className="w-full h-20 object-cover rounded mb-2"
                            />
                            <p className="text-xs font-medium truncate">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.category?.name || 'No category'}</p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs font-bold text-green-600">₹{product.unitPrice || product.selling_price || 0}</span>
                              {isSelected && (
                                <span className="text-xs text-green-600 font-medium">Added</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {!loadingProducts && filteredProducts.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No products found
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ingredients List */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Products</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredIngredients.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                  No ingredients found. Create one to get started!
                </td>
              </tr>
            ) : (
              filteredIngredients.map((ingredient) => (
                <tr key={ingredient._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {ingredient.image ? (
                      <img
                        src={getImageUrl(ingredient.image)}
                        alt={ingredient.title}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <ImageIcon className="text-gray-400" size={20} />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium">{ingredient.title}</td>
                  <td className="px-4 py-3">
                    <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {ingredient.products?.length || 0} products
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggle(ingredient._id)}
                      className={`flex items-center gap-1 ${ingredient.status ? 'text-green-600' : 'text-gray-400'}`}
                    >
                      {ingredient.status ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                      <span className="text-sm">{ingredient.status ? 'Active' : 'Inactive'}</span>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{ingredient.order || 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(ingredient)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(ingredient._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
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
  );
};

export default AdminIngredient;
