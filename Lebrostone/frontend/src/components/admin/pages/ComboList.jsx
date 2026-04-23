import React, { useState, useEffect } from 'react';
import instance from '../../web/api/AxiosConfig';
import { 
  Package, 
  Tag, 
  ShoppingBag, 
  Star, 
  Filter, 
  Search, 
  Loader2,
  AlertCircle,
  ArrowUpDown,
  Eye,
  Trash2,
  Edit,
  Plus
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const ComboList = () => {
  const navigate = useNavigate();
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [deletingId, setDeletingId] = useState(null);
  const API_BASE = `https://lebrostonebackend4.lifeinfotechinstitute.com`;
  useEffect(() => {
    fetchCombos();
  }, [sortBy, sortOrder, filterStatus]);

  const fetchCombos = async () => {
    try {
      setLoading(true);
      const res = await instance.get("/api/combos");
      
      if (res.data.success && res.data.data) {
        setCombos(res.data.data);
      } else if (Array.isArray(res.data)) {
        setCombos(res.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Fetch combos error:', err);
      setError(err.response?.data?.message || 'Failed to load combos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm('⚠️ Are you sure you want to delete this combo? This action cannot be undone.')) {
      return;
    }

    setDeletingId(id);
    try {
      const token = localStorage.getItem('adminToken');
      
      await instance.delete(`/api/combos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Optimistic UI update
      setCombos(prev => prev.filter(combo => combo._id !== id));
      alert('✅ Combo deleted successfully!');
    } catch (err) {
      console.error('Delete combo error:', err);
      alert(err.response?.data?.message || 'Failed to delete combo. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/admin/combos/edit/${id}`);
  };

  // Filter combos by search query
  const filteredCombos = combos.filter(combo => {
    const matchesSearch = combo.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          combo.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && combo.status) ||
                         (filterStatus === 'inactive' && !combo.status);
    
    return matchesSearch && matchesStatus;
  });

  // Sort combos
  const sortedCombos = [...filteredCombos].sort((a, b) => {
    if (sortBy === 'comboPrice') {
      return sortOrder === 'asc' 
        ? a.comboPrice - b.comboPrice 
        : b.comboPrice - a.comboPrice;
    } else if (sortBy === 'discountAmount') {
      return sortOrder === 'asc' 
        ? a.discountAmount - b.discountAmount 
        : b.discountAmount - a.discountAmount;
    } else if (sortBy === 'productCount') {
      return sortOrder === 'asc' 
        ? (a.products?.length || 0) - (b.products?.length || 0) 
        : (b.products?.length || 0) - (a.products?.length || 0);
    } else {
      return sortOrder === 'asc' 
        ? new Date(a.createdAt) - new Date(b.createdAt) 
        : new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCombos = sortedCombos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedCombos.length / itemsPerPage);

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const calculateDiscountPercentage = (combo) => {
    if (combo.originalPrice > 0) {
      return Math.round(((combo.discountAmount / combo.originalPrice) * 100));
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-purple-600 mx-auto" size={48} />
          <p className="mt-4 text-slate-600 font-bold">Loading combos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md text-center shadow-lg">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Error</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button 
            onClick={fetchCombos}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                <ShoppingBag size={32} />
                Combo Offers
              </h1>
              <p className="text-white/80 mt-1">Amazing deals with huge savings!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search combos..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Dropdown */}
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-slate-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Combos</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <ArrowUpDown size={20} className="text-slate-500" />
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="createdAt">Newest First</option>
                <option value="comboPrice">Price: Low to High</option>
                <option value="comboPrice-desc">Price: High to Low</option>
                <option value="discountAmount">Biggest Discount</option>
                <option value="productCount">Most Products</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="max-w-7xl mx-auto px-4 mt-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold">Total Combos</p>
              <p className="text-2xl font-black text-purple-600">{combos.length}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold">Active</p>
              <p className="text-2xl font-black text-green-600">
                {combos.filter(c => c.status).length}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold">Avg Discount</p>
              <p className="text-2xl font-black text-orange-600">
                {combos.length > 0 
                  ? Math.round(
                      combos.reduce((sum, c) => sum + calculateDiscountPercentage(c), 0) / combos.length
                    ) + '%'
                  : '0%'
                }
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold">Total Savings</p>
              <p className="text-2xl font-black text-red-600">
                ₹{combos.reduce((sum, c) => sum + c.discountAmount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Combos Grid */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        {filteredCombos.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
            <Package className="text-slate-300 mx-auto mb-4" size={64} />
            <h2 className="text-xl font-bold text-slate-800 mb-2">No Combos Found</h2>
            <p className="text-slate-600 mb-6">
              {searchQuery ? 'Try different search terms' : 'No combos match your filters'}
            </p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('all');
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentCombos.map((combo) => {
              const discountPercent = calculateDiscountPercentage(combo);
              const isDeleting = deletingId === combo._id;
              
              return (
                <Link 
                  key={combo._id} 
                  to={`/admin/combo/view/${combo._id}`}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all group relative"
                >
                  {/* Action Buttons (Edit & Delete) */}
                  <div className="absolute top-3 left-3 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleEdit(combo._id, e)}
                      className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-all shadow-md"
                      title="Edit Combo"
                    >
                      <Edit size={14} />
                    </button>

                    <button
                      onClick={(e) => handleDelete(combo._id, e)}
                      disabled={isDeleting}
                      className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-red-600 hover:bg-red-100 transition-all shadow-md disabled:opacity-50"
                      title="Delete Combo"
                    >
                      {isDeleting ? (
                        <Loader2 className="animate-spin" size={14} />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>

                  {/* Combo Image */}
                  <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                    {combo.thumbnail ? (
                      <img 
                        src={`${API_BASE}${combo.thumbnail}`} 
                        alt={combo.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/400x300/6366f1/ffffff?text=Combo";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                        <ShoppingBag size={48} className="text-white opacity-80" />
                      </div>
                    )}
                    
                    {/* Discount Badge */}
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-black text-sm px-3 py-1 rounded-full shadow-lg">
                      {discountPercent}% OFF
                    </div>
                  </div>

                  {/* Combo Info */}
                  <div className="p-4">
                    {/* Status Badge */}
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                        combo.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {combo.status ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                      <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-1 rounded font-bold">
                        {combo.products?.length || 0} Products
                      </span>
                    </div>

                    {/* Combo Name */}
                    <h3 className="font-black text-lg text-slate-800 line-clamp-2 mb-2 group-hover:text-purple-600 transition-colors">
                      {combo.name}
                    </h3>

                    {/* Description Preview */}
                    {combo.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                        {combo.description.replace(/<[^>]*>/g, '').substring(0, 80)}...
                      </p>
                    )}

                    {/* Price Section */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 mb-3">
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Combo Price</p>
                          <p className="text-2xl font-black text-purple-600">₹{combo.comboPrice}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Was</p>
                          <p className="text-lg font-bold text-slate-400 line-through">
                            ₹{combo.originalPrice}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-2 pt-2 border-t border-purple-100">
                        <p className="text-xs text-green-600 font-black flex items-center justify-center gap-1">
                          <Tag size={14} />
                          SAVE ₹{combo.discountAmount}
                        </p>
                      </div>
                    </div>

                    {/* Products Preview */}
                    {combo.products && combo.products.length > 0 && (
                      <div className="mb-3">
                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-2 flex items-center gap-1">
                          <Package size={12} />
                          Products Included
                        </p>
                        <div className="flex -space-x-2">
                          {combo.products.slice(0, 4).map((product, idx) => (
                            <div 
                              key={idx} 
                              className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden"
                              title={product.name}
                            >
                              {product.thumbnail ? (
                                <img 
                                  src={`${API_BASE}${product.thumbnail}`} 
                                  alt={product.name} 
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.src = "https://via.placeholder.com/32/6366f1/ffffff?text=P";
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                                  <Package size={16} className="text-white" />
                                </div>
                              )}
                            </div>
                          ))}
                          {combo.products.length > 4 && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                              +{combo.products.length - 4}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Stock Info */}
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-3">
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Min: {combo.minOrderQty}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75m-6-12H4.862a2.25 2.25 0 00-2.11 1.388L2.25 18.75a2.25 2.25 0 002.11 1.388l12.863-1.118a2.25 2.25 0 001.977-1.586V12m-6-12H4.862a2.25 2.25 0 00-2.11 1.388L2.25 12.75a2.25 2.25 0 002.11 1.388l12.863-1.118a2.25 2.25 0 001.977-1.586V4.862a2.25 2.25 0 00-2.11-1.388z" />
                        </svg>
                        Stock: {combo.comboStock}
                      </span>
                    </div>

                    {/* View Button - Removed, Link wrapper handles navigation */}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              Previous
            </button>
            
            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx + 1)}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === idx + 1
                    ? 'bg-purple-600 text-white'
                    : 'bg-white border hover:bg-slate-50'
                }`}
              >
                {idx + 1}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              Next
            </button>
          </div>
        )}

        {/* Empty State Message */}
        {combos.length === 0 && !loading && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg mt-8">
            <Package className="text-slate-300 mx-auto mb-4" size={64} />
            <h2 className="text-xl font-bold text-slate-800 mb-2">No Combos Yet</h2>
            <p className="text-slate-600 mb-6">Create your first combo offer to get started!</p>
            <Link 
              to="/admin/combos/add"
              className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-700 transition inline-block"
            >
              Create Combo
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComboList;
