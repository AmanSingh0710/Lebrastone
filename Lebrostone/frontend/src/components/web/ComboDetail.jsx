import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import instance, { getImageUrl } from "./api/AxiosConfig";
import {
  Plus,
  Minus,
  Loader2,
  ShoppingCart,
  ArrowLeft,
  Package,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Footer from "./comman/Footer";
import { getProductPath } from "../../utils/productRoutes";
import SeoMeta from "../common/SeoMeta";
import "swiper/css";
import "swiper/css/navigation";

const ComboDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [combo, setCombo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const swiperRef = useRef(null);

  const getCleanUrl = (img) => {
    if (!img) return "https://via.placeholder.com/600?text=Combo";
    return getImageUrl(img);
  };

  useEffect(() => {
    const fetchComboDetails = async () => {
      try {
        setLoading(true);
        const res = await instance.get(`/api/combos/${id}`);

        if (res.data.success && res.data.combo) {
          setCombo(res.data.combo);
          // Set initial quantity to minOrderQty if exists
          if (res.data.combo.minOrderQty) {
            setQuantity(res.data.combo.minOrderQty);
          }
          // Fetch suggested products
          fetchSuggestedProducts(res.data.combo._id);
        } else {
          throw new Error("Combo not found");
        }
      } catch (err) {
        console.error("Error fetching combo:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchSuggestedProducts = async (currentComboId) => {
      try {
        const res = await instance.get("/api/products");
        let products = res.data.data || [];
        // Filter out products already in combo and take 8
        const comboProductIds = combo?.products?.map((p) => p._id) || [];
        products = products
          .filter((p) => !comboProductIds.includes(p._id))
          .slice(0, 8);
        setSuggestedProducts(products);
      } catch (err) {
        console.error("Error fetching suggested products:", err);
      }
    };

    if (id) {
      fetchComboDetails();
    }
    window.scrollTo(0, 0);
  }, [id]);

  const handleQuantityChange = (delta) => {
    const newQty = quantity + delta;
    if (
      combo &&
      newQty >= (combo.minOrderQty || 1) &&
      newQty <= (combo.comboStock || 100)
    ) {
      setQuantity(newQty);
    }
  };

  const handleAddToCart = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      navigate("/login");
      return;
    }

    setAddingToCart(true);
    try {
      const res = await instance.post("/api/cart/add", {
        userId: user._id || user.id,
        productId: combo._id,
        variantId: "combo-default",
        quantity: quantity,
        price: combo.comboPrice,
        name: combo.name,
        image: combo.thumbnail,
        isCombo: true,
      });

      if (res.data.success) {
        alert("Combo added to cart!");
      }
    } catch (err) {
      console.error("Add to cart error:", err);
      alert("Failed to add combo to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      // Direct guest to checkout with combo info
      navigate(
        `/checkout?productId=${combo._id}&isCombo=true&quantity=${quantity}`,
      );
      return;
    }

    setAddingToCart(true); // Reuse loading state
    try {
      // 1. Add combo to cart first (as per existing login buy now logic in sidebar)
      const cartRes = await instance.post("/api/cart/add", {
        userId: user._id || user.id,
        productId: combo._id,
        variantId: "combo-default",
        quantity: quantity,
        price: combo.comboPrice,
        name: combo.name,
        image: combo.thumbnail,
        isCombo: true,
      });

      if (cartRes.data.success) {
        // 2. Fetch user address
        const userRes = await instance.get(`/api/user/${user._id || user.id}`);
        const userData = userRes.data.data;

        if (!userData?.address?.city || !userData?.phoneNumber) {
          alert("Please complete your profile details first!");
          navigate("/profile");
          return;
        }

        // 3. Place order immediately
        const orderRes = await instance.post("/api/orders/place", {
          userId: user._id || user.id,
          products: [
            {
              productId: combo._id,
              variantId: "combo-default",
              name: combo.name,
              quantity: quantity,
              price: combo.comboPrice,
              image: combo.thumbnail,
              isCombo: true,
            },
          ],
          subTotal: combo.comboPrice * quantity,
          discount: 0,
          finalTotal: combo.comboPrice * quantity,
          address: userData.address,
        });

        if (orderRes.data.success) {
          alert("Order placed successfully! 🎉");
          navigate("/profile");
        }
      }
    } catch (err) {
      console.error("Buy now error:", err);
      alert("Failed to process your order");
    } finally {
      setAddingToCart(false);
    }
  };

  const calculateDiscount = () => {
    if (!combo) return 0;
    if (combo.discountType === "Percent") {
      return `${combo.discountAmount}%`;
    }
    return `₹${combo.discountAmount}`;
  };

  const createMarkup = (html) => {
    if (!html) return { __html: "" };
    return { __html: html };
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="animate-spin text-[#00a688]" size={48} />
        </div>
        <Footer />
      </div>
    );
  }

  if (!combo) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Combo Not Found</h2>
            <button
              onClick={() => navigate("/")}
              className="bg-[#00a688] text-white px-6 py-2 rounded-lg"
            >
              Back to Home
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const comboDescription = String(combo.description || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
  const comboImage = getCleanUrl(combo.thumbnail) || "/banner-ls.jpg";

  return (
    <>
      <SeoMeta
        title={`${combo.name} | Combo Offer | LEBROSTONE`}
        description={comboDescription || "Explore this special combo offer from LEBROSTONE."}
        image={comboImage}
        type="product"
        keywords={`${combo.name}, combo offer, LEBROSTONE`}
      />
      <div className="flex flex-col min-h-screen bg-white">
        <main className="flex-grow">
        {/* Breadcrumbs */}
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-600 hover:text-[#00a688] transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Back to Home</span>
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left - Image */}
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden shadow-lg bg-gray-50">
                <img
                  src={getCleanUrl(combo.thumbnail)}
                  alt={combo.name}
                  className="w-full h-auto max-h-[500px] object-cover"
                />
              </div>

              {/* Combo Badge */}
              <div className="flex items-center gap-2 bg-[#00a688]/10 text-[#00a688] px-4 py-2 rounded-full w-fit">
                <Package size={18} />
                <span className="font-semibold">
                  Combo Pack - {combo.products?.length || 0} Products
                </span>
              </div>
            </div>

            {/* Right - Details */}
            <div className="space-y-6">
              {/* Title */}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {combo.name}
                </h1>
                <p className="text-gray-500">Premium Combo Offer</p>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <span className="text-gray-500">(4.9)</span>
              </div>

              {/* Price Section */}
              <div className="bg-gray-50 rounded-xl p-6 space-y-3">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-[#00a688]">
                    ₹{combo.comboPrice}
                  </span>
                  <span className="text-xl text-gray-400 line-through">
                    ₹{combo.originalPrice}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
                    Save {calculateDiscount()}
                  </span>
                  <span className="text-gray-500 text-sm">
                    ({combo.discountType} Discount)
                  </span>
                </div>
              </div>

              {/* Stock Info */}
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-600">
                  <span className="font-semibold">Stock:</span>{" "}
                  {combo.comboStock} available
                </span>
                <span className="text-gray-600">
                  <span className="font-semibold">Min Order:</span>{" "}
                  {combo.minOrderQty} qty
                </span>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <span className="font-semibold text-gray-700">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="p-3 hover:bg-gray-100 transition-colors"
                    disabled={quantity <= (combo.minOrderQty || 1)}
                  >
                    <Minus size={18} />
                  </button>
                  <span className="px-6 py-2 font-semibold min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="p-3 hover:bg-gray-100 transition-colors"
                    disabled={quantity >= combo.comboStock}
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || combo.comboStock <= 0}
                  className="bg-white border-2 border-[#00a688] hover:bg-[#00a688]/5 text-[#00a688] font-black h-[54px] rounded-xl flex justify-center items-center gap-2 text-[14px] uppercase tracking-widest transition-all duration-300 shadow-md active:scale-95 disabled:opacity-70"
                >
                  {addingToCart ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      <ShoppingCart size={18} /> Add Cart
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={addingToCart || combo.comboStock <= 0}
                  className="bg-[#00a688] hover:bg-black text-white font-black h-[54px] rounded-xl flex justify-center items-center gap-2 text-[14px] uppercase tracking-widest transition-all duration-300 shadow-lg active:scale-95 disabled:opacity-70"
                >
                  {addingToCart ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    "Buy Now"
                  )}
                </button>
              </div>

              {/* Description */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-bold mb-3">Description</h3>
                <div
                  className="text-gray-600 leading-relaxed prose"
                  dangerouslySetInnerHTML={createMarkup(combo.description)}
                />
              </div>
            </div>
          </div>

          {/* Products in Combo Section */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-8 text-center">
              Products Included in This Combo
            </h2>

            {combo.products && combo.products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {combo.products.map((product) => (
                  <div
                    key={product._id}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all cursor-pointer border border-gray-100"
                    onClick={() => navigate(getProductPath(product))}
                  >
                    <div className="aspect-square overflow-hidden bg-gray-50">
                      <img
                        src={getCleanUrl(
                          product.thumbnail ||
                            (product.images && product.images[0]),
                        )}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2 line-clamp-2 text-gray-900">
                        {product.name}
                      </h3>
                      <p className="text-gray-500 text-sm mb-2">
                        {product.category?.name ||
                          product.brand?.name ||
                          "Product"}
                      </p>

                      {/* Short Description */}
                      {product.shortDescription && (
                        <p className="text-gray-400 text-xs mb-3 line-clamp-2">
                          {product.shortDescription}
                        </p>
                      )}

                      {/* Show description if no shortDescription */}
                      {!product.shortDescription && product.description && (
                        <p className="text-gray-400 text-xs mb-3 line-clamp-2">
                          {product.description
                            .replace(/<[^>]*>/g, "")
                            .substring(0, 80)}
                          ...
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <span className="text-[#00a688] font-bold text-lg">
                          ₹{product.unitPrice}
                        </span>
                        <span className="text-xs text-gray-400">
                          {product.unit || "unit"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">
                No products in this combo
              </p>
            )}
          </div>

          {/* Savings Summary */}
          <div className="mt-12 bg-gradient-to-r from-[#00a688] to-[#008d74] rounded-2xl p-8 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">Great Savings!</h3>
                <p className="text-white/90">
                  You save{" "}
                  <span className="font-bold text-xl">
                    ₹{combo.originalPrice - combo.comboPrice}
                  </span>{" "}
                  with this combo
                </p>
              </div>
              <div className="text-center md:text-right">
                <div className="text-4xl font-bold">{calculateDiscount()}</div>
                <div className="text-white/80">OFF</div>
              </div>
            </div>
          </div>

          {/* Suggested Products Section */}
          {suggestedProducts.length > 0 && (
            <div className="mt-16 border-t border-gray-200 pt-12">
              <h2 className="text-2xl font-bold mb-8 text-center uppercase tracking-wider">
                You May Also Like
              </h2>

              <div className="relative px-4 md:px-12">
                {/* Navigation Buttons */}
                <button
                  onClick={() => swiperRef.current?.slidePrev()}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <FaChevronLeft className="text-gray-600" />
                </button>
                <button
                  onClick={() => swiperRef.current?.slideNext()}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <FaChevronRight className="text-gray-600" />
                </button>

                <Swiper
                  modules={[Navigation]}
                  spaceBetween={24}
                  slidesPerView={2}
                  onSwiper={(swiper) => (swiperRef.current = swiper)}
                  breakpoints={{
                    640: { slidesPerView: 2 },
                    768: { slidesPerView: 3 },
                    1024: { slidesPerView: 4 },
                  }}
                  className="pb-4"
                >
                  {suggestedProducts.map((item) => (
                    <SwiperSlide key={item._id}>
                      <div
                        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all cursor-pointer border border-gray-100 group"
                        onClick={() => navigate(getProductPath(item))}
                      >
                        <div className="aspect-square overflow-hidden bg-gray-50">
                          <img
                            src={getCleanUrl(
                              item.thumbnail || (item.images && item.images[0]),
                            )}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-sm mb-2 line-clamp-2 text-gray-900">
                            {item.name}
                          </h3>
                          <p className="text-gray-500 text-xs mb-2">
                            {item.category?.name ||
                              item.brand?.name ||
                              "Product"}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-[#00a688] font-bold">
                              ₹{item.unitPrice}
                            </span>
                            {item.discountAmount > 0 && (
                              <span className="text-xs text-gray-400 line-through">
                                ₹{item.unitPrice + item.discountAmount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
          )}
        </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ComboDetail;
