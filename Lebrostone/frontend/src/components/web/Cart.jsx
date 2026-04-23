import React, { useState, useEffect } from "react";
import {
  Minus,
  Plus,
  Trash2,
  ShieldCheck,
  MapPin,
  Ticket,
  X,
  Loader2,
} from "lucide-react";
import instance, { getImageUrl } from "./api/AxiosConfig";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";

const Cart = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [userData, setUserData] = useState(null); // Store full user object for address

  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  // Get initial user from local storage
  const user = JSON.parse(localStorage.getItem("user"));

  // 1. Fetch Cart from your specific API structure
  useEffect(() => {
    const fetchCart = async () => {
      const userId = user?._id || user?.id;
      if (!userId) {
        navigate("/login");
        return;
      }
      try {
        const res = await instance.get(`/api/user/${userId}`);
        if (res.data && res.data.data) {
          setUserData(res.data.data);
          setCartItems(res.data.data.cart || []);
        }
      } catch (err) {
        error(err.message || "Failed to load cart");
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [navigate, user?._id, user?.id]);

  // 2. Sync Cart with DB
  const syncCartWithDB = async (updatedCart) => {
    const userId = user?._id || user?.id;
    try {
      await instance.put(`/api/user/update-cart/${userId}`, { cart: updatedCart });
    } catch (err) {
      error(err.message || "Failed to update cart");
    }
  };

  // --- INCREASE / DECREASE FUNCTIONALITY ---
  const updateQuantity = (productId, type) => {
    const updatedCart = cartItems.map(item => {
      if (item.productId === productId) {
        const newQty = type === 'plus' ? item.quantity + 1 : item.quantity - 1;
        // Logic: Cannot go below 1
        return { ...item, quantity: Math.max(1, newQty) };
      }
      return item;
    });
    setCartItems(updatedCart);
    syncCartWithDB(updatedCart);
  };

  // --- REMOVE FUNCTIONALITY ---
  const removeItem = async (productId) => {
    if (window.confirm("Remove this item from cart?")) {
      const updatedCart = cartItems.filter(item => item.productId !== productId);
      setCartItems(updatedCart);
      syncCartWithDB(updatedCart);
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      error("Please enter a coupon code");
      return;
    }

    setCouponError("");
    setCouponLoading(true);
    
    try {
      const cartItemsForCoupon = cartItems.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }));
      
      const res = await instance.post("/api/coupons/apply", {
        code: couponCode,
        cartItems: cartItemsForCoupon
      });

      if (res.data.success) {
        setAppliedCoupon(res.data.data);
        setShowCouponInput(false);
        success(res.data.data.discountMessage || "Coupon applied successfully!");
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to apply coupon";
      setCouponError(errorMsg);
      error(errorMsg);
    } finally {
      setCouponLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    const userId = user?._id || user?.id;
    
    if (!userData?.phoneNumber || userData.phoneNumber.trim() === "") {
      error("Please add your mobile number in your profile before placing an order!");
      navigate("/profile");
      return;
    }
    
    if (!userData?.address?.city) {
      error("Please add an address first!");
      return;
    }

    setOrderLoading(true);
    try {
      const orderData = {
        userId: userId,
        products: cartItems,
        subTotal,
        discount,
        finalTotal,
        address: userData.address,
        coupon: appliedCoupon ? {
          code: appliedCoupon.coupon.code,
          discountType: appliedCoupon.coupon.discountType,
          discountValue: appliedCoupon.coupon.discountValue,
          totalDiscount: appliedCoupon.totalDiscount
        } : null
      };

      const res = await instance.post("/api/orders/place", orderData);
      if (res.data.success) {
        success("Order placed successfully!");
        setCartItems([]);
        setAppliedCoupon(null);
        setTimeout(() => {
          navigate("/profile");
        }, 1500);
      }
    } catch (err) {
      error(err.message || "Failed to place order. Please try again.");
    } finally {
      setOrderLoading(false);
    }
  };

  const subTotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const discount = appliedCoupon ? appliedCoupon.totalDiscount : 0;
  const finalTotal = Math.max(0, subTotal - discount);

  if (loading)
    return (
      <div className="h-screen flex justify-center items-center font-bold">
        🛒 Loading Cart...
      </div>
    );

  return (
    <div className="bg-[#f1f3f6] min-h-screen py-6 px-2 sm:px-4 md:px-10 text-black">
      <div className="container mx-auto flex flex-col lg:flex-row gap-4">
        {/* MAIN CONTENT SECTION */}
        <div className="w-full lg:flex-[2.5] space-y-4">
          {/* Address Section */}
          <div className="bg-white p-4 shadow-sm rounded-sm border">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <h2 className="text-gray-500 font-bold text-sm flex items-center gap-2">
                <MapPin size={18} className="text-blue-600" /> Delivery Address
              </h2>
              <button
                className="text-blue-600 font-bold text-sm border px-4 py-1 rounded-sm self-start sm:self-auto"
                onClick={() => navigate("/profile")}
              >
                {userData?.address?.city ? "CHANGE" : "ADD ADDRESS"}
              </button>
            </div>
            {userData?.address?.city ? (
              <div className="mt-2 text-sm">
                <span className="font-bold">{userData.name}</span>
                <p className="text-gray-600 text-xs sm:text-sm">
                  {userData.address.houseNo}, {userData.address.city},{" "}
                  {userData.address.state} - {userData.address.pincode}
                </p>
              </div>
            ) : (
              <p className="text-red-400 text-xs mt-2 italic font-bold">
                No address found. Please update your profile.
              </p>
            )}
          </div>

          {/* Cart Items List */}
          <div className="bg-white shadow-sm rounded-sm overflow-hidden">
            <div className="p-4 border-b bg-slate-50/50">
              <h1 className="text-lg font-bold">
                My Cart ({cartItems.length})
              </h1>
            </div>

            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <div
                  key={item.productId}
                  className="p-3 sm:p-4 border-b flex flex-col gap-4 hover:bg-gray-50 transition-colors"
                >
                  {/* Image and Quantity Control Row */}
                  <div className="flex gap-3 sm:gap-6">
                    <div className="flex flex-col items-center gap-2">
                      <img
                        src={getImageUrl(item.image) || item.image}
                        alt={item.name}
                        className="w-20 h-20 sm:w-24 sm:h-24 object-contain border p-1 bg-white"
                      />

                      {/* QUANTITY CONTROL */}
                      <div className="flex items-center gap-2 border rounded-md px-2 py-1 bg-white shadow-sm">
                        <button
                          onClick={() => updateQuantity(item.productId, "minus")}
                          className="text-gray-500 hover:text-blue-600 disabled:opacity-30 p-1"
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={14} strokeWidth={3} />
                        </button>
                        <span className="font-bold text-sm w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, "plus")}
                          className="text-gray-500 hover:text-blue-600 p-1"
                        >
                          <Plus size={14} strokeWidth={3} />
                        </button>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-800 text-sm sm:text-lg line-clamp-2">
                        {item.name}
                      </h3>
                      <div className="flex items-baseline gap-2 mt-2 flex-wrap">
                        <p className="text-xl sm:text-2xl font-black">
                          ₹{item.price * item.quantity}
                        </p>
                        <p className="text-xs text-gray-400 font-medium">
                          (₹{item.price} per unit)
                        </p>
                      </div>

                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-red-500 text-xs font-bold mt-3 flex items-center gap-1 uppercase hover:text-red-700"
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 sm:p-16 text-center">
                <div className="text-4xl mb-4">🛒</div>
                <p className="text-gray-500 font-bold">Your cart is empty!</p>
                <button
                  onClick={() => navigate("/")}
                  className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-sm text-sm font-bold"
                >
                  SHOP NOW
                </button>
              </div>
            )}
          </div>
        </div>

        {/* PRICE SUMMARY SECTION */}
        <div className="w-full lg:flex-1 lg:self-start lg:sticky lg:top-24">
          <div className="bg-white shadow-lg p-4 sm:p-5 space-y-4 rounded-xl border border-slate-100">
            {/* Coupon Code Input */}
            {!appliedCoupon ? (
              <div className="border-b pb-4">
                <button
                  onClick={() => setShowCouponInput(!showCouponInput)}
                  className="flex items-center gap-2 text-blue-600 font-bold text-sm hover:text-blue-800"
                >
                  <Ticket size={18} /> Apply Promo Code
                </button>

                {showCouponInput && (
                  <div className="mt-3 flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="Enter Code"
                      className={`flex-1 border p-2 rounded outline-none uppercase font-bold text-sm ${couponError ? "border-red-500" : "focus:border-blue-500"}`}
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={couponLoading}
                    />
                    <button
                      onClick={applyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="bg-blue-600 text-white px-4 py-2 rounded font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {couponLoading ? "..." : "APPLY"}
                    </button>
                  </div>
                )}
                {couponError && (
                  <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">
                    {couponError}
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="text-emerald-700 font-bold text-xs">
                      Applied: {appliedCoupon.coupon.code}
                    </p>
                    <p className="text-emerald-600 text-[10px]">
                      {appliedCoupon.discountMessage}
                    </p>
                  </div>
                  <button
                    onClick={() => setAppliedCoupon(null)}
                    className="text-red-400 hover:text-red-600 flex-shrink-0"
                  >
                    <X size={18} />
                  </button>
                </div>
                {/* Show applicable items */}
                {appliedCoupon.applicableItems && appliedCoupon.applicableItems.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-emerald-100">
                    <p className="text-[10px] text-emerald-600 font-bold uppercase">
                      Applied to {appliedCoupon.applicableItems.length} item(s):
                    </p>
                    <div className="mt-1 space-y-1">
                      {appliedCoupon.applicableItems.slice(0, 2).map((item, idx) => (
                        <p key={idx} className="text-[10px] text-emerald-700 truncate">
                          • {item.name} (₹{item.discount.toFixed(0)} off)
                        </p>
                      ))}
                      {appliedCoupon.applicableItems.length > 2 && (
                        <p className="text-[10px] text-emerald-600">
                          +{appliedCoupon.applicableItems.length - 2} more items
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <h3 className="text-gray-400 font-black uppercase text-xs tracking-widest">
              Price Summary
            </h3>
            <div className="flex justify-between font-medium text-sm">
              <span>Subtotal ({cartItems.length} items)</span>
              <span>₹{subTotal}</span>
            </div>

            {appliedCoupon && (
              <div className="flex justify-between text-emerald-600 font-bold text-sm">
                <span>Coupon Discount</span>
                <span>- ₹{appliedCoupon.discountAmount}</span>
              </div>
            )}

            <div className="flex justify-between text-emerald-600 font-bold italic text-sm">
              <span>Delivery Charges</span>
              <span>FREE</span>
            </div>

            <div className="flex justify-between text-xl sm:text-2xl font-black border-t border-dashed pt-5 text-slate-900">
              <span>Total</span>
              <span>₹{finalTotal}</span>
            </div>

            <button
              disabled={
                !userData?.address?.city ||
                !userData?.phoneNumber ||
                cartItems.length === 0 ||
                orderLoading
              }
              className={`w-full py-3 sm:py-4 rounded-xl font-black uppercase text-white shadow-xl flex items-center justify-center gap-2 transition-all text-sm sm:text-base ${userData?.address?.city && userData?.phoneNumber && cartItems.length > 0 ? "bg-[#fb641b] hover:bg-[#e65a17]" : "bg-gray-300 cursor-not-allowed"}`}
              onClick={handlePlaceOrder}
            >
              {orderLoading ? (
                <Loader2 className="animate-spin text-white" size={20} />
              ) : (
                "Checkout Now"
              )}
            </button>

            {cartItems.length > 0 && !userData?.phoneNumber && (
              <p className="text-red-500 text-[10px] text-center font-bold">
                PLEASE ADD MOBILE NUMBER IN PROFILE TO PROCEED
              </p>
            )}

            {cartItems.length > 0 && userData?.phoneNumber && !userData?.address?.city && (
              <p className="text-red-500 text-[10px] text-center font-bold">
                PLEASE ADD ADDRESS TO PROCEED
              </p>
            )}
          </div>

          <div className="mt-4 flex items-center gap-3 text-gray-400 p-3 bg-white rounded-xl border text-xs sm:text-sm">
            <ShieldCheck size={20} className="text-emerald-500 flex-shrink-0" />
            <span className="text-[10px] uppercase font-bold tracking-tight">
              Secured by Lebrostone SSL
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
