import React, { useState, useRef, useEffect } from "react";
import { FaStar, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import instance, { getImageUrl } from "./api/AxiosConfig";
import { useNavigate } from "react-router-dom";
import { getProductPath } from "../../utils/productRoutes";

import "swiper/css";
import "swiper/css/navigation";

const TopPicks = () => {
  const [activeTab, setActiveTab] = useState("BESTSELLERS");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const swiperRef = useRef(null);

  const categories = ["BESTSELLERS", "NEW ARRIVAL", "COMBO"];

  useEffect(() => {
    const fetchTopPicks = async () => {
      try {
        setLoading(true);

        if (activeTab === "COMBO") {
          // Fetch combos from combo API
          const res = await instance.get("/api/combos/active/list");
          // Map combo data to match product structure
          const comboData = (res.data.data || []).map((combo) => ({
            _id: combo._id,
            name: combo.name,
            thumbnail: combo.thumbnail,
            unitPrice: combo.comboPrice,
            originalPrice: combo.originalPrice,
            discountAmount: combo.discountAmount,
            discountType: combo.discountType,
            description: combo.description,
            isCombo: true, // Flag to identify combo items
            products: combo.products,
            comboStock: combo.comboStock,
            minOrderQty: combo.minOrderQty,
          }));
          setProducts(comboData);
        } else {
          // For BESTSELLERS and NEW ARRIVAL, fetch all products
          // since tag filtering might return empty results
          const res = await instance.get("/api/products");
          let productData = res.data.data || [];

          if (activeTab === "BESTSELLERS") {
            // Filter products marked as bestseller
            productData = productData
              .filter((p) => p.is_bestseller === true)
              .slice(0, 10);
          } else if (activeTab === "NEW ARRIVAL") {
            // Filter products marked as new arrival
            productData = productData
              .filter((p) => p.is_new_arrival === true)
              .slice(0, 10);
          }

          setProducts(productData);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching top picks:", err);
        setLoading(false);
      }
    };

    fetchTopPicks();
  }, [activeTab]);

  const getCleanUrl = (img) => {
    if (!img) return "https://via.placeholder.com/300?text=Product";
    return getImageUrl(img) || "https://via.placeholder.com/300?text=Product";
  };

  return (
    <section className="py-8 md:pt-16 bg-white ">
      <div className="max-w-7xl mx-auto px-4">
        {/* TITLE */}
        <div className="flex justify-center mb-1 sm:mb-6 md:mb-10">
          <div className="text-black py-3 px-12 md:px-24">
            <h2 className="text-md md:text-2xl font-bold uppercase tracking-[0.2em] text-center">
              Top Picks This Season
            </h2>
          </div>
        </div>

        <div className="flex justify-center mb-8 md:mb-16">
          <div className="flex bg-[#D2B48C] rounded-full p-1 shadow-sm">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveTab(category)}
                className={`px-3 sm:px-6 py-2 rounded-full text-[10px] sm:text-xs font-semibold tracking-wider transition ${
                  activeTab === category
                    ? "bg-[#FAF6EA] text-black shadow"
                    : "text-black hover:bg-white/30"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* SLIDER */}
        <div className="relative">
          {/* NAV BUTTONS */}
          <button
            onClick={() => swiperRef.current?.slidePrev()}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white w-10 h-10 rounded-full shadow items-center justify-center -ml-2 hidden md:flex"
          >
            <FaChevronLeft />
          </button>

          <button
            onClick={() => swiperRef.current?.slideNext()}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white w-10 h-10 rounded-full shadow items-center justify-center -mr-2 hidden md:flex"
          >
            <FaChevronRight />
          </button>

          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={24}
            slidesPerView={1}
            loop={products.length > 3}
            autoplay={{ delay: 2500 }}
            breakpoints={{
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            onSwiper={(swiper) => (swiperRef.current = swiper)}
          >
            {products.map((product) => (
              <SwiperSlide key={product._id} className="py-10 px-4">
                {/* CARD */}
                <div
                  className="bg-white rounded-2xl shadow-lg p-4 md:p-10 relative h-[240px] md:h-[260px] cursor-pointer"
                  onClick={() =>
                    navigate(
                      product.isCombo
                        ? `/combo/${product._id}`
                        : getProductPath(product),
                    )
                  }
                >
                  {/* FLOATING IMAGE */}
                  <div className="absolute -top-10 left-4 md:left-6 w-24 h-24 md:w-28 md:h-28 bg-white rounded-xl shadow overflow-hidden">
                    <img
                      src={getCleanUrl(
                        product.thumbnail ||
                          (product.images && product.images[0]),
                      )}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* CONTENT */}
                  <div className="pl-28 md:pl-32 flex flex-col gap-2 h-full">
                    <span className="bg-[#00a758] text-white text-[10px] px-3 py-1 rounded-full w-fit uppercase font-bold">
                      {product.isCombo
                        ? "COMBO"
                        : product.productTag || "LEBROSTONE"}
                    </span>
                    <h3 className="font-bold text-lg leading-tight line-clamp-1 uppercase">
                      {(product.name || "").replace(/&nbsp;/g, " ")}
                    </h3>
                    {/* SHORT DESCRIPTION */}
                    <p className="text-gray-500 text-xs line-clamp-1 leading-snug">
                      {" "}
                      {(
                        product.shortDescription ||
                        product.description ||
                        "Premium quality product"
                      )
                        .replace(/&nbsp;/g, " ")
                        .replace(/<[^>]*>/g, "")}
                    </p>

                    {/* RATING */}
                    <div className="flex items-center gap-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} size={14} />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">(4.9)</span>
                    </div>

                    {/* PRICE */}
                    <div className="flex items-center gap-3">
                      {product.unitPrice > 0 && (
                        <>
                         
                          <span className="text-2xl font-bold">
                            ₹{product.unitPrice}
                          </span>
                        </>
                      )}
                    </div>

                    {/* BUTTON */}
                    <button
                      className="bg-[#00a758] hover:bg-[#008d4a] text-white
                      py-1 px-4 md:py-2 md:px-6
                      rounded-full font-semibold
                      text-[11px] md:text-xs
                      tracking-widest uppercase transition-colors
                      w-fit md:w-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        const path = product.isCombo
                          ? `/combo/${product._id}`
                          : getProductPath(product);
                        window.location.href = path;
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default TopPicks;
