import React, { useRef, useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "swiper/css";
import "swiper/css/navigation";
import { useNavigate } from "react-router-dom";
import instance, { getImageUrl } from "./api/AxiosConfig";

const Category = () => {
  const navigate = useNavigate();
  const swiperRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const getCategoryImageUrl = (url) => {
    if (!url) return "https://via.placeholder.com/400x400?text=Category";
    return getImageUrl(url) || "https://via.placeholder.com/400x400?text=Category";
  };

  useEffect(() => {
    const fetchCats = async () => {
      try {
        setLoading(true);
        const res = await instance.get(`/api/categories`);
        setCategories(res.data.data);
      } catch (err) {
        console.error("Frontend Category Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCats();
  }, []);

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <section className="py-10 md:py-16 bg-white font-sans">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex justify-center mb-10">
          <div className="text-black py-3 px-12 md:px-24">
            <h2 className="text-lg md:text-2xl font-bold uppercase tracking-[0.2em] text-center">
              Shop By Category
            </h2>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <button
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-gray-100 text-gray-800 w-12 h-12 rounded-full shadow-lg items-center justify-center transition-all duration-300 -ml-6 hidden md:flex"
            onClick={() => swiperRef.current?.slidePrev()}
          >
            <FaChevronLeft className="text-xl" />
          </button>

          <button
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-gray-100 text-gray-800 w-12 h-12 rounded-full shadow-lg items-center justify-center transition-all duration-300 -mr-6 hidden md:flex"
            onClick={() => swiperRef.current?.slideNext()}
          >
            <FaChevronRight className="text-xl" />
          </button>

          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={24}
            slidesPerView={2}
            breakpoints={{
              640: { slidesPerView: 3 },
              768: { slidesPerView: 4 },
              1024: { slidesPerView: 6 },
            }}
            autoplay={{
              delay: 2000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            speed={800}
            loop={categories.length > 6}
            onBeforeInit={(swiper) => {
              swiperRef.current = swiper;
            }}
            className="px-4"
          >
            {categories.map((item) => (
              <SwiperSlide key={item._id}>
                <div
                  className="flex flex-col items-center group cursor-pointer"
                  onClick={() => navigate(`/shop/category/${item._id}`)}
                >
                  <div className="relative w-full aspect-square mb-4 overflow-hidden rounded-3xl shadow-md transition-transform duration-300 group-hover:scale-105">
                    <img
                      src={getCategoryImageUrl(item.image_url)}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <h3 className="text-sm md:text-base font-semibold text-gray-800 text-center tracking-wide uppercase">
                    {item.name}
                  </h3>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default Category;
