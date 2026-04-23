import React, { useState, useEffect } from 'react';
import instance from '../../web/api/AxiosConfig';
import { Trash2, Ticket, Plus, Loader2, Clock, AlertCircle, Calendar, Package, Tag, ChevronDown, X } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';

const Coupon = () => {
    const { success, error } = useToast();
    const [coupons, setCoupons] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showProductDropdown, setShowProductDropdown] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'fixed',
        discountValue: '',
        applicableProducts: [],
        minOrderAmount: '',
        startDate: '', 
        expiryDate: '' 
    });

    useEffect(() => { 
        fetchCoupons(); 
        fetchProducts();
    }, []);

    const fetchCoupons = async () => {
        try {
            const res = await instance.get("/api/coupons/all");
            setCoupons(res.data);
        } catch (err) { console.error("Fetch Error:", err); }
    };

    const fetchProducts = async () => {
        try {
            const res = await instance.get("/api/products");
            setProducts(res.data.data);
        } catch (err) { console.error("Fetch Products Error:", err); }
    };

    const handleAddCoupon = async (e) => {
        e.preventDefault();
        
        // Date Validation
        if (new Date(formData.expiryDate) <= new Date(formData.startDate)) {
            return error("Expiry date must be after start date!");
        }

        setLoading(true);
        try {
            const res = await instance.post("/api/coupons/add", formData);
            if (res.data.success) {
                success("Coupon Created Successfully!");
                setFormData({ 
                    code: '', 
                    discountType: 'fixed',
                    discountValue: '',
                    applicableProducts: [],
                    minOrderAmount: '', 
                    startDate: '', 
                    expiryDate: '' 
                });
                fetchCoupons();
            }
        } catch (err) { 
            error(err.response?.data?.message || "Error adding coupon"); 
        } finally { setLoading(false); }
    };

    const deleteCoupon = async (id) => {
        if(window.confirm("Are you sure you want to delete this coupon?")) {
            try {
                await instance.delete(`/api/coupons/delete/${id}`);
                success("Coupon deleted successfully");
                fetchCoupons();
            } catch (err) { error("Delete failed"); }
        }
    };

    const toggleProductSelection = (productId) => {
        setFormData(prev => {
            const isSelected = prev.applicableProducts.includes(productId);
            if (isSelected) {
                return { ...prev, applicableProducts: prev.applicableProducts.filter(id => id !== productId) };
            } else {
                return { ...prev, applicableProducts: [...prev.applicableProducts, productId] };
            }
        });
    };

    const getSelectedProductNames = () => {
        return products.filter(p => formData.applicableProducts.includes(p._id)).map(p => p.name);
    };

    // Helper to format date and time separately
    const formatDateTime = (dateStr) => {
        const d = new Date(dateStr);
        return {
            date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen text-slate-800 font-sans">
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
                <Ticket className="text-blue-600" size={32} /> 
                Coupon <span className="text-blue-600">Engine</span>
            </h2>

            {/* --- CREATE FORM --- */}
            <form onSubmit={handleAddCoupon} className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 mb-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                    
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Code</label>
                        <input required type="text" placeholder="PROMO20" className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold uppercase ring-1 ring-slate-100 focus:ring-blue-500 outline-none transition-all" 
                        value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} />
                    </div>

                    {/* Discount Type */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Tag size={12}/> Discount Type</label>
                        <select 
                            value={formData.discountType} 
                            onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                            className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold ring-1 ring-slate-100 focus:ring-blue-500 outline-none cursor-pointer"
                        >
                            <option value="fixed">Fixed Amount (₹)</option>
                            <option value="percentage">Percentage (%)</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Discount {formData.discountType === 'percentage' ? '(%)' : '(₹)'}
                        </label>
                        <input 
                            required 
                            type="number" 
                            placeholder={formData.discountType === 'percentage' ? "10" : "500"} 
                            className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold ring-1 ring-slate-100 focus:ring-blue-500 outline-none" 
                            value={formData.discountValue} 
                            onChange={(e) => setFormData({...formData, discountValue: e.target.value})} 
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Min Order (₹)</label>
                        <input 
                            type="number" 
                            placeholder="0" 
                            className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold ring-1 ring-slate-100 focus:ring-blue-500 outline-none" 
                            value={formData.minOrderAmount} 
                            onChange={(e) => setFormData({...formData, minOrderAmount: e.target.value})} 
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Calendar size={12}/> Start Date & Time</label>
                        <input required type="datetime-local" className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-slate-600 ring-1 ring-slate-100 focus:ring-blue-500 outline-none cursor-pointer" 
                        value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Clock size={12}/> Expiry Date & Time</label>
                        <input required type="datetime-local" className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold text-slate-600 ring-1 ring-slate-100 focus:ring-blue-500 outline-none cursor-pointer" 
                        value={formData.expiryDate} onChange={(e) => setFormData({...formData, expiryDate: e.target.value})} />
                    </div>

                    {/* Product Selection */}
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Package size={12}/> Applicable Products</label>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowProductDropdown(!showProductDropdown)}
                                className="w-full bg-slate-50 border-none p-4 rounded-2xl font-bold ring-1 ring-slate-100 focus:ring-blue-500 outline-none cursor-pointer flex items-center justify-between"
                            >
                                <span className={formData.applicableProducts.length === 0 ? "text-slate-400 font-normal" : "text-slate-700"}>
                                    {formData.applicableProducts.length === 0 
                                        ? "All Products (Click to select specific)" 
                                        : `${formData.applicableProducts.length} product(s) selected`
                                    }
                                </span>
                                <ChevronDown size={18} className={`text-slate-400 transition-transform ${showProductDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {showProductDropdown && (
                                <div className="absolute z-50 mt-2 w-full bg-white rounded-2xl shadow-xl border border-slate-100 max-h-64 overflow-y-auto">
                                    <div className="p-3 border-b border-slate-100 bg-slate-50 sticky top-0">
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, applicableProducts: [] }))}
                                            className="text-[11px] font-bold text-blue-600 hover:text-blue-700"
                                        >
                                            Clear Selection (Apply to All)
                                        </button>
                                    </div>
                                    {products.map(product => (
                                        <label 
                                            key={product._id} 
                                            className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={formData.applicableProducts.includes(product._id)}
                                                onChange={() => toggleProductSelection(product._id)}
                                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <div className="flex items-center gap-2 flex-1">
                                                {product.images?.[0] && (
                                                    <img 
                                                        src={`${import.meta.env.VITE_API_URL || ''}${product.images[0]}`} 
                                                        alt={product.name}
                                                        className="w-8 h-8 rounded-lg object-cover"
                                                        onError={(e) => e.target.style.display = 'none'}
                                                    />
                                                )}
                                                <span className="text-sm font-medium text-slate-700 truncate">{product.name}</span>
                                            </div>
                                            <span className="text-xs font-bold text-emerald-600">₹{product.price}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        {/* Selected Products Tags */}
                        {formData.applicableProducts.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {getSelectedProductNames().slice(0, 3).map((name, idx) => (
                                    <span key={idx} className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded-lg text-[10px] font-bold">
                                        {name.length > 20 ? name.substring(0, 20) + '...' : name}
                                        <button 
                                            type="button"
                                            onClick={() => toggleProductSelection(formData.applicableProducts[idx])}
                                            className="hover:text-blue-800"
                                        >
                                            <X size={10} />
                                        </button>
                                    </span>
                                ))}
                                {formData.applicableProducts.length > 3 && (
                                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-lg text-[10px] font-bold">
                                        +{formData.applicableProducts.length - 3} more
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                    
                    <button disabled={loading} className="bg-slate-900 text-white h-[58px] rounded-2xl font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-blue-600 transition-all shadow-lg active:scale-95 disabled:opacity-50">
                        {loading ? <Loader2 className="animate-spin" /> : <Plus size={18} />} Create
                    </button>
                </div>
            </form>

            {/* --- LIST TABLE --- */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="p-6 text-[10px] font-black uppercase text-slate-400">Coupon</th>
                            <th className="p-6 text-[10px] font-black uppercase text-slate-400">Discount</th>
                            <th className="p-6 text-[10px] font-black uppercase text-slate-400">Products</th>
                            <th className="p-6 text-[10px] font-black uppercase text-slate-400 text-center">Duration (Time & Date)</th>
                            <th className="p-6 text-[10px] font-black uppercase text-slate-400 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {coupons.map((c) => {
                            const now = new Date();
                            const start = new Date(c.startDate);
                            const end = new Date(c.expiryDate);
                            const isExpired = end < now;
                            const isUpcoming = start > now;

                            const startFormatted = formatDateTime(c.startDate);
                            const endFormatted = formatDateTime(c.expiryDate);

                            return (
                                <tr key={c._id} className="group hover:bg-slate-50/50 transition-all">
                                    <td className="p-6">
                                        <span className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-black text-sm uppercase tracking-tight ring-1 ring-blue-100">
                                            {c.code}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        <div className="font-black text-emerald-600 text-xl italic">
                                            {c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}
                                        </div>
                                        {c.minOrderAmount > 0 && (
                                            <p className="text-[10px] text-slate-400 font-bold">Min: ₹{c.minOrderAmount}</p>
                                        )}
                                    </td>
                                    
                                    <td className="p-6">
                                        {c.applicableProducts && c.applicableProducts.length > 0 ? (
                                            <div>
                                                <span className="bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-[10px] font-black">
                                                    {c.applicableProducts.length} Product(s)
                                                </span>
                                                <div className="mt-2 space-y-1 max-w-[200px]">
                                                    {c.applicableProducts.slice(0, 2).map((p, idx) => (
                                                        <p key={idx} className="text-[10px] text-slate-500 truncate">
                                                            • {p.name || 'Product'}
                                                        </p>
                                                    ))}
                                                    {c.applicableProducts.length > 2 && (
                                                        <p className="text-[10px] text-slate-400">
                                                            +{c.applicableProducts.length - 2} more
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black">
                                                All Products
                                            </span>
                                        )}
                                    </td>
                                    
                                    <td className="p-6">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="flex items-center gap-3">
                                                {/* Start Box */}
                                                <div className="text-center bg-slate-50 p-2 rounded-xl border border-slate-100">
                                                    <p className="text-[9px] uppercase font-black text-slate-400">Start</p>
                                                    <p className="text-[11px] font-bold text-slate-700">{startFormatted.date}</p>
                                                    <p className="text-[10px] font-black text-blue-500">{startFormatted.time}</p>
                                                </div>
                                                <span className="text-slate-300 font-bold">→</span>
                                                {/* End Box */}
                                                <div className="text-center bg-slate-50 p-2 rounded-xl border border-slate-100">
                                                    <p className="text-[9px] uppercase font-black text-slate-400">Expiry</p>
                                                    <p className="text-[11px] font-bold text-slate-700">{endFormatted.date}</p>
                                                    <p className="text-[10px] font-black text-red-500">{endFormatted.time}</p>
                                                </div>
                                            </div>
                                            
                                            {/* Status Badge */}
                                            {isExpired ? (
                                                <span className="text-[9px] bg-red-50 text-red-500 px-3 py-1 rounded-full font-black tracking-widest uppercase italic border border-red-100">Expired</span>
                                            ) : isUpcoming ? (
                                                <span className="text-[9px] bg-blue-50 text-blue-500 px-3 py-1 rounded-full font-black tracking-widest uppercase italic border border-blue-100">Upcoming</span>
                                            ) : (
                                                <span className="text-[9px] bg-emerald-50 text-emerald-500 px-3 py-1 rounded-full font-black tracking-widest uppercase italic border border-emerald-100 flex items-center gap-1">
                                                   <span className="w-1 h-1 bg-emerald-500 rounded-full animate-ping"></span> Active Now
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    <td className="p-6 text-center">
                                        <button onClick={() => deleteCoupon(c._id)} className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-3 rounded-2xl transition-all">
                                            <Trash2 size={20} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {coupons.length === 0 && (
                    <div className="p-20 text-center flex flex-col items-center gap-2">
                        <AlertCircle className="text-slate-200" size={48} />
                        <p className="text-slate-300 font-black uppercase italic tracking-widest">No active coupons found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Coupon;