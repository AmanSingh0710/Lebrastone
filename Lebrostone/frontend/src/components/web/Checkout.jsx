import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Plus, Minus, Check, Loader2, ArrowLeft } from "lucide-react";
import instance, { getImageUrl } from "./api/AxiosConfig";

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const productId = searchParams.get("productId");
  const variantId = searchParams.get("variantId");
  const initialQty = parseInt(searchParams.get("quantity")) || 1;
  const isCombo = searchParams.get("isCombo") === "true";

  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(initialQty);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [discount, setDiscount] = useState(0);

  const user = JSON.parse(localStorage.getItem("user"));
  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    mobile: user?.phoneNumber || "",
    houseNo: user?.address?.houseNo || "",
    nearby: user?.address?.nearby || "",
    pincode: user?.address?.pincode || "",
    state: user?.address?.state || "",
    city: user?.address?.city || "",
    mode: "Cash on Delivery",
  });

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        if (isCombo) {
          const res = await instance.get(`/api/combos/${productId}`);
          if (res.data.success) {
            setProduct({
              ...res.data.combo,
              price: res.data.combo.comboPrice,
              image: res.data.combo.thumbnail,
              isCombo: true,
            });
          }
        } else if (productId) {
          const res = await instance.get(`/api/products/${productId}`);
          if (res.data.success) {
            const data = res.data.data;
            let price = data.unitPrice;
            let variantName = "";

            if (variantId && data.variants) {
              const v = data.variants.find((v) => v._id === variantId);
              if (v) {
                price = v.selling_price || v.price;
                variantName = v.size || v.title;
              }
            }

            setProduct({
              ...data,
              price: price,
              image: data.thumbnail,
              variantName: variantName,
            });
          }
        } else {
          // Logic for cart items if needed, but the request focuses on "Buy Now"
          navigate("/cart");
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [productId, variantId, isCombo]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const applyCoupon = async () => {
    if (!couponCode) return;
    try {
      const res = await instance.post("/api/coupons/validate", {
        code: couponCode,
      });
      if (res.data.success) {
        setCouponApplied(true);
        setCouponError("");
        // Calculation logic for discount
        const coupon = res.data.coupon;
        const total = product.price * quantity;
        let discAmount = 0;
        if (coupon.discountType === "Percent") {
          discAmount = (total * coupon.discountAmount) / 100;
        } else {
          discAmount = coupon.discountAmount;
        }
        setDiscount(discAmount);
      } else {
        setCouponError("Invalid Coupon");
        setCouponApplied(false);
        setDiscount(0);
      }
    } catch (err) {
      setCouponError("Invalid Coupon");
      setCouponApplied(false);
      setDiscount(0);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !formData.fullName ||
      !formData.mobile ||
      !formData.houseNo ||
      !formData.city ||
      !formData.state ||
      !formData.pincode
    ) {
      alert("Please fill all address fields!");
      return;
    }

    if (formData.mobile.length < 10) {
      alert("Please enter a valid mobile number!");
      return;
    }

    try {
      setPlacingOrder(true);
      const subTotal = product.price * quantity;
      const finalTotal = subTotal - discount;

      const orderData = {
        userId: user?._id || null,
        guestName: !user ? formData.fullName : "",
        guestPhone: !user ? formData.mobile : "",
        products: [
          {
            productId: product._id,
            variantId: variantId || "default",
            name: product.name,
            quantity: quantity,
            price: product.price,
            image: product.image,
          },
        ],
        subTotal: subTotal,
        discount: discount,
        finalTotal: finalTotal,
        address: {
          houseNo: formData.houseNo,
          nearby: formData.nearby,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
      };

      const res = await instance.post("/api/orders/place", orderData);
      if (res.data.success) {
        if (res.data.isNewUser) {
          alert(
            `Order placed successfully! 🎉\n\nYour account has been created. Use your phone number (${formData.mobile}) as your password to login later and track your order.`,
          );
        } else {
          alert("Order placed successfully! 🎉");
        }
        navigate(user ? "/profile" : "/login");
      }
    } catch (err) {
      console.error("Order error:", err);
      alert("Failed to place order. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <Loader2 className="animate-spin text-[#00a688]" size={48} />
      </div>
    );

  if (!product)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF9F6] p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Item not found!</h2>
        <button
          onClick={() => navigate("/")}
          className="text-[#00a688] underline"
        >
          Go back home
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-10 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header / Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-8 text-gray-600 hover:text-black transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium text-lg uppercase tracking-wider">
            Fast Checkout
          </span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* LEFT: FORM */}
          <div className="lg:col-span-7 bg-white/50 backdrop-blur-sm rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100">
            <form onSubmit={handlePlaceOrder} className="space-y-6">
              <h2 className="text-2xl font-black text-gray-800 mb-8 uppercase tracking-tight border-b pb-4">
                Shipping Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your name"
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-[#00a688] focus:ring-2 focus:ring-[#00a688]/10 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    required
                    placeholder="10-digit mobile"
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-[#00a688] focus:ring-2 focus:ring-[#00a688]/10 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                    Complete Address / House No
                  </label>
                  <input
                    type="text"
                    name="houseNo"
                    value={formData.houseNo}
                    onChange={handleInputChange}
                    required
                    placeholder="Building, street, house no."
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-[#00a688] focus:ring-2 focus:ring-[#00a688]/10 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    required
                    placeholder="6-digit PIN"
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-[#00a688] focus:ring-2 focus:ring-[#00a688]/10 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                    Landmark / Nearby (Optional)
                  </label>
                  <input
                    type="text"
                    name="nearby"
                    value={formData.nearby}
                    onChange={handleInputChange}
                    placeholder="Famous landmark"
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-[#00a688] focus:ring-2 focus:ring-[#00a688]/10 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    placeholder="City name"
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-[#00a688] focus:ring-2 focus:ring-[#00a688]/10 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    placeholder="State name"
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-[#00a688] focus:ring-2 focus:ring-[#00a688]/10 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-6">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 block mb-4">
                  Payment Mode
                </label>
                <div className="flex items-center gap-3 bg-[#00a688]/5 p-4 rounded-xl border border-[#00a688]/20 w-fit">
                  <input
                    type="radio"
                    checked
                    readOnly
                    className="w-5 h-5 accent-[#00a688]"
                  />
                  <span className="font-bold text-gray-700">
                    Cash on Delivery
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                  Coupon Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon"
                    className="flex-grow h-12 px-4 rounded-xl border border-gray-200 focus:border-[#00a688] focus:ring-2 focus:ring-[#00a688]/10 outline-none transition-all uppercase"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    className="w-12 h-12 bg-gray-800 text-white rounded-xl flex items-center justify-center hover:bg-black transition-colors"
                  >
                    <Check size={20} />
                  </button>
                </div>
                {couponError && (
                  <p className="text-red-500 text-[10px] font-bold mt-1 uppercase pl-1">
                    {couponError}
                  </p>
                )}
                {couponApplied && (
                  <p className="text-[#00a688] text-[10px] font-bold mt-1 uppercase pl-1">
                    Applied Successfully! Saved ₹{discount}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={placingOrder}
                className="w-full bg-[#00a688] hover:bg-[#008d74] text-white h-14 rounded-2xl font-black text-lg uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70"
              >
                {placingOrder ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  "COMPLETE ORDER"
                )}
              </button>
            </form>
          </div>

          {/* RIGHT: PRODUCT SUMMARY */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-black text-gray-800 mb-6 uppercase tracking-tight">
                Order Summary
              </h2>

              <div className="flex gap-4 mb-8">
                <div className="w-24 h-24 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0">
                  <img
                    src={getImageUrl(product.image) || product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-grow flex flex-col justify-center">
                  <h3 className="font-black text-lg text-gray-900 leading-tight uppercase line-clamp-2">
                    {product.name}
                  </h3>
                  {product.variantName && (
                    <p className="text-xs font-bold text-[#00a688] mt-1 bg-[#00a688]/5 px-2 py-0.5 rounded-md w-fit">
                      {product.variantName}
                    </p>
                  )}
                  {product.weight && (
                    <p className="text-xs text-gray-500 mt-1 font-medium">
                      Weight: {product.weight}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4 border-t pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-tighter">
                    Quantity
                  </span>
                  <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl h-[40px] overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 text-gray-400 hover:text-black transition-colors"
                    >
                      <Minus size={14} strokeWidth={3} />
                    </button>
                    <span className="px-3 font-black text-sm min-w-[30px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 text-gray-400 hover:text-black transition-colors"
                    >
                      <Plus size={14} strokeWidth={3} />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 font-bold uppercase tracking-tighter">
                    Subtotal
                  </span>
                  <span className="font-black text-gray-900">
                    ₹{product.price * quantity}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 font-bold uppercase tracking-tighter">
                    Shipping
                  </span>
                  <span className="font-black text-[#00a688]">FREE</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-red-400 font-bold uppercase tracking-tighter">
                      Discount
                    </span>
                    <span className="font-black text-red-500">
                      -₹{discount}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center border-t border-dashed pt-4 mt-2">
                  <span className="text-lg font-black text-gray-900 uppercase tracking-widest">
                    Total
                  </span>
                  <span className="text-3xl font-black text-[#00a688]">
                    ₹{product.price * quantity - discount}
                  </span>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/50 p-4 rounded-2xl flex items-center justify-center text-center flex-col shadow-sm">
                <p className="text-[10px] font-black uppercase text-gray-400">
                  Secure Payment
                </p>
                <p className="text-xs font-bold text-gray-600">
                  100% Protected
                </p>
              </div>
              <div className="bg-white/50 p-4 rounded-2xl flex items-center justify-center text-center flex-col shadow-sm">
                <p className="text-[10px] font-black uppercase text-gray-400">
                  Fast Delivery
                </p>
                <p className="text-xs font-bold text-gray-600">
                  3-5 Working Days
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
