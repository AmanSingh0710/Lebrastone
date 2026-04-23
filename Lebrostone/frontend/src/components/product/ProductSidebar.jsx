import React, { useState, useEffect, useMemo } from "react";
import { ShoppingCart, Star, Minus, Plus, Tag, Loader2 } from "lucide-react";
import instance from "../web/api/AxiosConfig";
import { useNavigate } from "react-router-dom";

const ProductSidebar = ({
  product,
  selectedVariant,
  quantity,
  setQuantity,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // --- SAFE CHECK ---
  if (!product || !selectedVariant) return null;

  // ✅ STEP 1: Get User from LocalStorage
  const user = JSON.parse(localStorage.getItem("user"));

  // =================================================================
  // ✅ STEP 2: PRICE CALCULATION (Strict Priority Logic)
  // =================================================================
  const { finalSP, finalMRP } = useMemo(() => {
    // 1. Initial Values from Selected Variant (Jo ProductDetail se aa raha hai)
    let sp =
      Number(selectedVariant.selling_price) ||
      Number(selectedVariant.price) ||
      0;
    let mrp = Number(selectedVariant.mrp) || 0;

    // 2. Root Price Check from Database
    const rootSP = Number(product.selling_price);

    // ⚠️ CRITICAL CHECK:
    // Agar Root Selling Price (e.g. 500) set hai, to hum calculation logic
    // run NAHI karenge. Hum Maan lenge ki variant me sahi price hai.
    if (rootSP > 0) {
      // Calculation SKIP karo. Jo price variant me hai (500), wahi final hai.
      return { finalSP: sp, finalMRP: mrp };
    }

    // PRIORITY 2: Agar Root Price 0 hai AUR Product Combo hai -> Tabhi Items ka Total Karo
    if (product.is_combo && rootSP === 0) {
      if (product.included_products?.length > 0) {
        let comboSP = 0;
        let comboMRP = 0;
        let validCalculation = false;

        product.included_products.forEach((item) => {
          if (typeof item === "object" && item !== null) {
            const itemSP =
              Number(item.selling_price) ||
              Number(item.variants?.[0]?.selling_price) ||
              0;
            const itemMRP =
              Number(item.mrp) || Number(item.variants?.[0]?.mrp) || 0;

            comboSP += itemSP;
            comboMRP += itemMRP || itemSP;
            validCalculation = true;
          }
        });

        // Override ONLY if calculation happened AND root price was 0
        if (validCalculation && comboSP > 0) {
          sp = comboSP;
          mrp = comboMRP;
        }
      }
    }

    return { finalSP: sp, finalMRP: mrp };
  }, [product, selectedVariant]);

  // Totals based on Quantity
  const totalPrice = finalSP * quantity;
  const totalMrp = finalMRP * quantity;

  const discountPercentage =
    finalMRP > finalSP
      ? Math.round(((finalMRP - finalSP) / finalMRP) * 100)
      : 0;
  const normalizedProductName = String(product?.name || "").trim().toLowerCase();
  const variantLabel = [selectedVariant?.size, selectedVariant?.weight, selectedVariant?.title]
    .map((value) => String(value || "").trim())
    .filter(Boolean)
    .filter((value) => value.toLowerCase() !== normalizedProductName)
    .filter((value, index, arr) => arr.indexOf(value) === index)
    .join(" • ");
  const packLabel = variantLabel || "Standard Pack";
  // =================================================================

  // --- SLIDER OFFER LOGIC ---
  const [currentOffer, setCurrentOffer] = useState(0);
  const offers = [
    {
      title: "Get Flat 30% OFF",
      code: "STEAL30",
      desc: "Save flat 30% on orders above ₹599",
    },
    {
      title: "Buy 1 Get 1 FREE",
      code: "BOGO",
      desc: "Buy any 2 products & get lowest free",
    },
    {
      title: "Get 2 Mini Products FREE",
      code: "FREE2",
      desc: "On orders above ₹899",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentOffer((prev) => (prev === offers.length - 1 ? 0 : prev + 1));
    }, 2000);
    return () => clearInterval(timer);
  }, [offers.length]);

  // ✅ STEP 3: Handle Add to Cart Function
  const handleAddToCart = async () => {
    if (!user || !user._id) {
      navigate("/login");
      return;
    }

    if (finalSP <= 0) {
      alert("Error: Price update nahi hai.");
      return;
    }

    try {
      setLoading(true);

      const cartData = {
        userId: user._id,
        productId: product._id,
        variantId: selectedVariant._id,
        quantity: quantity,
        price: finalSP, // ✅ Sending Final Price
        name: product.name,
        image: product.images?.[0] || "",
      };

      const response = await instance.post("/api/cart/add", cartData);

      if (response.data.success) {
        alert(`${product.name} Added to Cart! ✅`);
      }
    } catch (error) {
      console.error("Cart Error:", error);
      alert(error.response?.data?.message || "Cart update error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ STEP 4: Handle Buy Now Function (Add to Cart + Navigate to Checkout)
  const handleBuyNow = async () => {
    if (!user || !user._id) {
      // Redirect to checkout with product info for guest checkout
      navigate(
        `/checkout?productId=${product._id}&variantId=${selectedVariant._id}&quantity=${quantity}`,
      );
      return;
    }

    if (finalSP <= 0) {
      alert("Error: Price update nahi hai.");
      return;
    }

    try {
      setLoading(true);

      // Step 1: Add to cart
      const cartData = {
        userId: user._id,
        productId: product._id,
        variantId: selectedVariant._id,
        quantity: quantity,
        price: finalSP,
        name: product.name,
        image: product.images?.[0] || "",
      };

      const cartResponse = await instance.post("/api/cart/add", cartData);

      if (cartResponse.data.success) {
        // Step 2: Fetch user data to check address and phone
        const userRes = await instance.get(`/api/user/${user._id}`);
        const userData = userRes.data.data;

        if (!userData?.phoneNumber || userData.phoneNumber.trim() === "") {
          alert(
            "Please add your mobile number in your profile before placing an order!",
          );
          navigate("/profile");
          setLoading(false);
          return;
        }

        if (!userData?.address?.city) {
          alert("Please add an address first!");
          navigate("/profile");
          setLoading(false);
          return;
        }

        // Step 3: Place order
        const cartItems = [cartData];
        const subTotal = cartData.price * cartData.quantity;
        const finalTotal = subTotal;

        const orderData = {
          userId: user._id,
          products: cartItems,
          subTotal: subTotal,
          discount: 0,
          finalTotal: finalTotal,
          address: userData.address,
          coupon: null,
        };

        const orderRes = await instance.post("/api/orders/place", orderData);

        if (orderRes.data.success) {
          alert("Order placed successfully!");
          setTimeout(() => {
            navigate("/profile");
          }, 1500);
        }
      }
    } catch (error) {
      console.error("Buy Now Error:", error);
      alert(error.response?.data?.message || "Error processing your request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans lg:sticky lg:top-24 lg:self-start">
      {/* --- MOBILE: Quantity + Subtotal + Buttons --- */}
      <div className="md:hidden space-y-4 border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
          <span className="text-[14px] font-bold text-gray-600 uppercase tracking-tighter">
            Quantity
          </span>
          <div className="flex items-center bg-white border border-gray-300 rounded-md h-[36px] overflow-hidden shadow-sm">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-3 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
            >
              <Minus size={14} strokeWidth={3} />
            </button>
            <span className="px-3 font-black text-sm min-w-[30px] text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="px-3 text-gray-500 hover:bg-emerald-50 hover:text-emerald-500 transition-colors"
            >
              <Plus size={14} strokeWidth={3} />
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center px-1 text-[13px] font-bold">
          <span className="text-gray-500 uppercase tracking-tighter">
            Subtotal
          </span>
          <span className="text-gray-900">₹{totalPrice}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleAddToCart}
            disabled={loading}
            className="bg-white border-2 border-[#00AFEF] hover:bg-blue-50 text-[#00AFEF] font-black h-[48px] rounded-lg flex justify-center items-center gap-2 text-[13px] uppercase tracking-widest transition-all duration-300 shadow-md active:scale-95 disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <ShoppingCart size={18} /> Add Cart
              </>
            )}
          </button>

          <button
            onClick={handleBuyNow}
            disabled={loading}
            className="bg-[#00AFEF] hover:bg-black text-white font-black h-[48px] rounded-lg flex justify-center items-center gap-2 text-[13px] uppercase tracking-widest transition-all duration-300 shadow-md active:scale-95 disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              "Buy Now"
            )}
          </button>
        </div>
      </div>

      {/* --- DESKTOP: FULL PRICE SUMMARY BOX --- */}
      <div className="hidden md:block border border-gray-200 rounded-lg p-4 bg-white shadow-sm transition-all duration-300">
        <div className="mb-4 border-b border-gray-50 pb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-[28px] font-black text-gray-900">
              ₹{totalPrice}
            </span>
            {discountPercentage > 0 && (
              <span className="text-[#ff5a5a] font-black text-[16px]">
                {discountPercentage}% OFF
              </span>
            )}
          </div>
          <div className="text-[13px] text-gray-400 font-medium">
            MRP <span className="line-through">₹{totalMrp}</span>
          </div>
          <div className="text-[11px] text-gray-400 italic mt-1">
            Inclusive of all Taxes
          </div>
          <div className="flex items-center gap-1 mt-2">
            <span className="font-bold text-[12px] text-gray-900">
              {product.rating || 4.5}
            </span>
            <Star className="w-3 h-3 text-[#ffc300] fill-current" />
            <span className="text-[#00AFEF] text-[12px] font-bold hover:underline cursor-pointer">
              {product.reviewsCount || 120} Reviews
            </span>
          </div>
        </div>

        <div className="text-[12px] font-black text-gray-500 mb-4 uppercase tracking-widest bg-gray-50 p-2 rounded border border-dashed text-center">
          {product.is_combo ? "Combo Bundle" : `Pack: ${packLabel}`}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="text-[14px] font-bold text-gray-600 uppercase tracking-tighter">
              Quantity
            </span>
            <div className="flex items-center bg-white border border-gray-300 rounded-md h-[36px] overflow-hidden shadow-sm">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <Minus size={14} strokeWidth={3} />
              </button>
              <span className="px-3 font-black text-sm min-w-[30px] text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 text-gray-500 hover:bg-emerald-50 hover:text-emerald-500 transition-colors"
              >
                <Plus size={14} strokeWidth={3} />
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center px-1 text-[13px] font-bold">
            <span className="text-gray-500 uppercase tracking-tighter">
              Subtotal
            </span>
            <span className="text-gray-900">₹{totalPrice}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 md:flex md:flex-col md:gap-4">
            <button
              onClick={handleAddToCart}
              disabled={loading}
              className="bg-white border-2 border-[#00AFEF] hover:bg-blue-50 text-[#00AFEF] font-black h-[48px] md:h-[54px] rounded-lg flex justify-center items-center gap-2 text-[13px] md:text-[15px] uppercase tracking-widest transition-all duration-300 shadow-md active:scale-95 disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <ShoppingCart size={18} /> Add Cart
                </>
              )}
            </button>

            <button
              onClick={handleBuyNow}
              disabled={loading}
              className="bg-[#00AFEF] hover:bg-black text-white font-black h-[48px] md:h-[54px] rounded-lg flex justify-center items-center gap-2 text-[13px] md:text-[15px] uppercase tracking-widest transition-all duration-300 shadow-md active:scale-95 disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                "Buy Now"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSidebar;
