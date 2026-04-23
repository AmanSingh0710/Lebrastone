import React, { useState, useEffect } from 'react';
import instance, { getImageUrl } from '../../web/api/AxiosConfig';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, Star, ShoppingBag, MessageSquare, Edit, Package, Tag, Layers, Info } from 'lucide-react';

const ProductDetailView = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await instance.get(`/api/products/${productId}`);
        setProduct(res.data.data || res.data); 
        setLoading(false);
      } catch (err) {
        console.error(err);
        alert("Product load karne mein error!");
      }
    };
    fetchProduct();
  }, [productId]);

  if (loading) return <div className="p-10 text-center font-bold">Loading Product Details...</div>;
  if (!product) return <div className="p-10 text-center">Product not found!</div>;

  const getDisplayImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/400';
    return getImageUrl(url) || 'https://via.placeholder.com/400';
  };

  return (
    <div className="p-4 md:p-6 bg-[#F9FAFB] min-h-screen font-sans text-slate-700">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ShoppingBag className="text-slate-600" size={24} />
          <h1 className="text-lg font-bold text-slate-800">Product Details</h1>
        </div>
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm font-semibold shadow-sm hover:bg-gray-50">
          <ArrowLeft size={18} /> Back to List
        </button>
      </div>

      {/* TOP SECTION: IMAGE AND DESCRIPTION */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* LEFT: IMAGE & LIVE VIEW */}
          <div className="w-full lg:w-1/3 flex flex-col items-center">
            <div className="w-full aspect-square border rounded-xl overflow-hidden bg-white flex items-center justify-center p-4 mb-4 relative">
              <img src={getDisplayImageUrl(product.thumbnail)} alt={product.name} className="max-w-full max-h-full object-contain" />
            </div>
            <button className="w-full py-2 border-2 border-blue-100 text-blue-600 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors">
              <Globe size={18} /> View live
            </button>
          </div>

          {/* RIGHT: TABS, TITLE, DESCRIPTION */}
          <div className="w-full lg:w-2/3">
            <div className="border-b mb-4">
              <button className="px-6 py-2 border-b-2 border-blue-600 text-blue-600 font-bold text-xs uppercase">English(EN)</button>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {product.images?.map((img, i) => (
                <div key={i} className="w-14 h-14 border rounded-lg overflow-hidden bg-white hover:border-blue-500 cursor-pointer">
                  <img src={getDisplayImageUrl(img)} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-2xl font-bold text-slate-800">{product.name}</h2>
              <button onClick={() => navigate(`/admin/product/edit/${product._id}`)} className="p-1 text-blue-500 border rounded hover:bg-blue-50"><Edit size={14} /></button>
            </div>

            <div className="mb-4">
               <h4 className="text-sm font-bold text-slate-800 mb-2">Description :</h4>
               <div className="text-slate-600 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: product.description }} />
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: ANALYTICS, INFO & TABLE (As per Image 4) */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* LEFT: SOLD STATS CARD */}
        <div className="w-full lg:w-1/4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full">
            <div className="mb-6">
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">Total Sold :</p>
              <h3 className="text-3xl font-bold text-blue-600">0</h3>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">Total Sold Amount :</p>
              <h3 className="text-3xl font-bold text-blue-600">₹0.00</h3>
            </div>
          </div>
        </div>

        {/* RIGHT: INFO GRID */}
        <div className="w-full lg:w-3/4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              
              {/* General Info */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-800 border-b pb-2">General Information</h4>
                <div className="text-xs flex flex-col gap-2">
                  <p className="flex justify-between"><span className="text-slate-400">Brand</span> <span className="font-bold">: {product.brand?.name || product.brand || 'N/A'}</span></p>
                  <p className="flex justify-between"><span className="text-slate-400">Category</span> <span className="font-bold">: {product.category?.name || product.category || 'N/A'}</span></p>
                  <p className="flex justify-between"><span className="text-slate-400">Product Type</span> <span className="font-bold">: {product.productType}</span></p>
                  <p className="flex justify-between"><span className="text-slate-400">Product Unit</span> <span className="font-bold">: {product.unit}</span></p>
                  <p className="flex justify-between"><span className="text-slate-400">Current Stock</span> <span className="font-bold">: {product.currentStockQty}</span></p>
                  <p className="flex justify-between"><span className="text-slate-400">Product SKU</span> <span className="font-bold">: {product.sku}</span></p>
                </div>
              </div>

              {/* Price Info */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-800 border-b pb-2">Price Information</h4>
                <div className="text-xs flex flex-col gap-2">
                  <p className="flex justify-between"><span className="text-slate-400">Unit Price</span> <span className="font-bold">: ₹{product.unitPrice}</span></p>
                  <p className="flex justify-between"><span className="text-slate-400">Tax</span> <span className="font-bold">: {product.taxAmount}% ({product.taxCalculation})</span></p>
                  <p className="flex justify-between"><span className="text-slate-400">Shipping Cost</span> <span className="font-bold">: ₹{product.shippingCost}</span></p>
                  <p className="flex justify-between"><span className="text-slate-400">Discount</span> <span className="font-bold">: ₹{product.discountAmount}</span></p>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-800 border-b pb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-bold">{product.name}</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* VARIATION TABLE (As per Image 4 bottom) */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F8FAFC] text-slate-600 font-bold border-b">
            <tr>
              <th className="px-6 py-4 text-center">SKU</th>
              <th className="px-6 py-4 text-center">Variation Wise Price</th>
              <th className="px-6 py-4 text-center">Stock</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b last:border-0">
              <td className="px-6 py-4 text-center font-medium text-slate-500">{product.sku}</td>
              <td className="px-6 py-4 text-center font-bold text-slate-800">₹{product.unitPrice}</td>
              <td className="px-6 py-4 text-center font-medium text-slate-500">{product.currentStockQty}</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default ProductDetailView;