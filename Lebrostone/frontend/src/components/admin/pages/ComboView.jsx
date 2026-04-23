import React, { useState, useEffect } from "react";
import instance, { getImageUrl } from "../../web/api/AxiosConfig";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Tag,
  ShoppingBag,
  Star,
  Truck,
  CheckCircle,
  AlertCircle,
  Loader2,
  Share2,
  Edit,
  Heart,
  ShoppingCart,
} from "lucide-react";

const ComboView = ({ comboId }) => {
  const navigate = useNavigate();
  const [combo, setCombo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    if (comboId) {
      fetchCombo();
    }
  }, [comboId]);

  const fetchCombo = async () => {
    try {
      setLoading(true);
      const res = await instance.get(`/api/combos/${comboId}`);

      if (res.data.success && res.data.combo) {
        setCombo(res.data.combo);
      } else {
        throw new Error("Combo not found");
      }
    } catch (err) {
      console.error("Fetch combo error:", err);
      setError(err.response?.data?.message || "Failed to load combo details");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!combo || !combo.isInStock) return;

    // Validate quantity
    if (quantity < combo.minOrderQty) {
      alert(`Minimum order quantity is ${combo.minOrderQty}`);
      return;
    }

    if (quantity > combo.comboStock) {
      alert(`Only ${combo.comboStock} combos available in stock`);
      return;
    }

    setIsAddingToCart(true);
    try {
      const token = localStorage.getItem("userToken");

      await instance.post(
        "/api/cart",
        {
          comboId: combo._id,
          quantity: quantity,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      alert("✅ Combo added to cart successfully!");
    } catch (err) {
      console.error("Add to cart error:", err);
      alert(err.response?.data?.message || "Failed to add to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleShare = async () => {
    try {
      const shareData = {
        title: combo.name,
        text: `Check out this amazing combo: ${combo.name} - Save ₹${combo.discountAmount}!`,
        url: window.location.href,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert("📋 Link copied to clipboard!");
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Share error:", err);
      }
    }
  };

  const renderDescription = (html) => {
    return { __html: html || "" };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-purple-600 mx-auto" size={48} />
          <p className="mt-4 text-slate-600 font-bold">
            Loading combo details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !combo) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md text-center shadow-lg">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Oops!</h2>
          <p className="text-slate-600 mb-4">{error || "Combo not found"}</p>
          <button
            onClick={() => window.history.back()}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Calculate values
  const discountPercentage =
    combo.discountPercentage ||
    (
      ((combo.originalPrice - combo.comboPrice) / combo.originalPrice) *
      100
    ).toFixed(0);
  const savingsPerProduct = (
    combo.discountAmount / combo.products.length
  ).toFixed(2);

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => window.history.back()}
            className="text-white hover:bg-white/20 p-2 rounded-full transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>
          <div className="text-center flex-1">
            <h1 className="text-lg font-black uppercase tracking-tight">
              Special Combo Offer
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/admin/combos/edit/${comboId}`)}
              className="text-white hover:bg-white/20 p-2 rounded-full transition"
              title="Edit Combo"
            >
              <Edit size={22} />
            </button>
            <button
              onClick={handleShare}
              className="text-white hover:bg-white/20 p-2 rounded-full transition"
            >
              <Share2 size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Combo Thumbnail */}
      <div className="bg-white p-4">
        <div className="aspect-[16/9] rounded-xl overflow-hidden bg-slate-100 shadow-md">
          {combo.thumbnail ? (
            <img
              src={getImageUrl(combo.thumbnail)}
              alt={combo.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/800x450/6366f1/ffffff?text=Combo+Image";
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <ShoppingBag size={64} className="text-white opacity-80" />
            </div>
          )}
        </div>
      </div>

      {/* Discount Badge */}
      <div className="px-4 mt-4">
        <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-full py-2 px-6 text-center inline-block">
          <span className="text-white font-black text-lg">
            SAVE ₹{combo.discountAmount}
          </span>
          <span className="text-white/80 text-sm ml-2">
            ({discountPercentage}% OFF)
          </span>
        </div>
      </div>

      {/* Combo Info */}
      <div className="bg-white rounded-t-3xl -mt-6 pt-8 px-4 pb-6">
        <div className="max-w-7xl mx-auto">
          {/* Combo Name */}
          <h1 className="text-2xl font-black text-slate-800 mb-2">
            {combo.name}
          </h1>

          {/* Ratings (if available) */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={18}
                  fill="#FBBF24"
                  className="text-yellow-400"
                />
              ))}
            </div>
            <span className="text-sm text-slate-500">(4.8 • 156 reviews)</span>
          </div>

          {/* Price Section */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-6">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">
                  Special Combo Price
                </p>
                <p className="text-4xl font-black text-purple-600">
                  ₹{combo.comboPrice}
                </p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">
                  Original Price
                </p>
                <p className="text-2xl font-bold text-slate-400 line-through">
                  ₹{combo.originalPrice}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-purple-100">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">
                    You Save
                  </p>
                  <p className="text-lg font-black text-green-600">
                    ₹{combo.discountAmount}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">
                    Per Product
                  </p>
                  <p className="text-lg font-black text-purple-600">
                    ₹{savingsPerProduct}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">
                    Products
                  </p>
                  <p className="text-lg font-black text-blue-600">
                    {combo.products.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {combo.description && (
            <div className="mb-6">
              <h3 className="text-sm font-bold uppercase text-slate-500 mb-3 flex items-center gap-2">
                <Package size={16} /> Combo Description
              </h3>
              <div
                className="prose prose-sm text-slate-700"
                dangerouslySetInnerHTML={renderDescription(combo.description)}
              />
            </div>
          )}

          {/* Products Grid */}
          <div className="mb-6">
            <h3 className="text-sm font-bold uppercase text-slate-500 mb-4 flex items-center gap-2">
              <ShoppingBag size={16} /> Products Included (
              {combo.products.length})
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {combo.products.map((product, index) => (
                <div
                  key={product._id || index}
                  className="bg-slate-50 rounded-2xl p-3 text-center group hover:bg-purple-50 transition-all"
                >
                  <div className="aspect-square rounded-xl overflow-hidden mb-2 bg-white shadow-sm">
                    {product.thumbnail ? (
                      <img
                        src={getImageUrl(product.thumbnail)}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = getImageUrl(
                            "/uploads/products/product-1.jpg",
                          );
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                        <Package size={32} className="text-white" />
                      </div>
                    )}
                  </div>

                  <p className="text-xs font-bold text-slate-800 line-clamp-2 mb-1">
                    {product.name || "Product Name"}
                  </p>

                  <div className="flex items-center justify-center gap-1">
                    <span className="text-[10px] font-black text-purple-600">
                      ₹{product.unitPrice || 0}
                    </span>
                    <span className="text-[8px] text-slate-400">
                      /{product.unit || "pc"}
                    </span>
                  </div>

                  {product.category?.name && (
                    <span className="text-[8px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded mt-1 inline-block">
                      {product.category.name}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Stock & Order Info */}
          <div className="space-y-3 mb-6">
            {/* Stock Status */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-3">
                {combo.isInStock ? (
                  <CheckCircle className="text-green-500" size={24} />
                ) : (
                  <AlertCircle className="text-red-500" size={24} />
                )}
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">
                    Availability
                  </p>
                  <p
                    className={`text-sm font-black ${combo.isInStock ? "text-green-600" : "text-red-600"}`}
                  >
                    {combo.isInStock ? "In Stock" : "Out of Stock"}
                  </p>
                </div>
              </div>
              {combo.isInStock && (
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                  {combo.comboStock} Available
                </span>
              )}
            </div>

            {/* Min Order Qty */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <Tag className="text-purple-600" size={24} />
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">
                    Minimum Order
                  </p>
                  <p className="text-sm font-black text-slate-800">
                    {combo.minOrderQty} Combo(s)
                  </p>
                </div>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <Truck className="text-blue-600" size={24} />
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">
                    Shipping
                  </p>
                  <p className="text-sm font-black text-slate-800">
                    Free Shipping
                  </p>
                </div>
              </div>
              <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold">
                On orders above ₹500
              </span>
            </div>
          </div>

          {/* Quantity Selector */}
          {combo.isInStock && (
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                Quantity
              </label>
              <div className="flex items-center gap-3 max-w-xs">
                <button
                  onClick={() =>
                    setQuantity(Math.max(combo.minOrderQty, quantity - 1))
                  }
                  className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-300 transition"
                  disabled={quantity <= combo.minOrderQty}
                >
                  <span className="text-xl font-black">-</span>
                </button>

                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val) && val >= combo.minOrderQty) {
                      setQuantity(val);
                    }
                  }}
                  min={combo.minOrderQty}
                  max={combo.comboStock}
                  className="w-20 h-10 text-center border-2 border-slate-200 rounded-lg font-black text-lg outline-none focus:border-purple-500"
                />

                <button
                  onClick={() =>
                    setQuantity(Math.min(combo.comboStock, quantity + 1))
                  }
                  className="w-10 h-10 bg-purple-600 text-white rounded-lg flex items-center justify-center hover:bg-purple-700 transition"
                  disabled={quantity >= combo.comboStock}
                >
                  <span className="text-xl font-black">+</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Min: {combo.minOrderQty} • Max: {combo.comboStock}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="sticky bottom-0 bg-white py-4 px-4 shadow-lg border-t border-slate-200">
            <div className="max-w-7xl mx-auto flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!combo.isInStock || isAddingToCart}
                className={`flex-1 py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 transition-all ${
                  combo.isInStock
                    ? isAddingToCart
                      ? "bg-purple-400 cursor-wait"
                      : "bg-purple-600 hover:bg-purple-700"
                    : "bg-slate-300 cursor-not-allowed"
                } text-white shadow-lg`}
              >
                {isAddingToCart ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Adding...
                  </>
                ) : combo.isInStock ? (
                  <>
                    <ShoppingCart size={24} />
                    Add to Cart • ₹{combo.comboPrice}
                  </>
                ) : (
                  <>
                    <AlertCircle size={24} />
                    Out of Stock
                  </>
                )}
              </button>

              <button className="px-6 bg-white border-2 border-purple-600 text-purple-600 rounded-xl hover:bg-purple-50 transition font-bold">
                <Heart size={24} fill="none" />
              </button>
            </div>

            {combo.isInStock && (
              <p className="text-center text-[10px] text-slate-400 mt-2 font-bold">
                🎁 Limited time offer - Order now to save ₹
                {combo.discountAmount}!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComboView;
