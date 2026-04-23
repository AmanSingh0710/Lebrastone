import React, { useEffect, useState } from "react";
import instance, { getImageUrl } from "./api/AxiosConfig";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FaShippingFast } from "react-icons/fa";
import { IoBagCheckOutline } from "react-icons/io5";
import { FaUserDoctor } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { getProductPath } from "../../utils/productRoutes";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const HeroSlider = () => {
  const navigate = useNavigate();
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const items = [
    { icon: <FaShippingFast />, title: "Free Shipping" },
    { icon: <IoBagCheckOutline />, title: "Secure Checkout" },
  ];

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const res = await instance.get("/api/admin/sliders");

        if (res.data.success && Array.isArray(res.data.sliders)) {
          // Filter by device type and only active sliders
          const deviceType = isMobile ? "mobile" : "desktop";
          const filteredSliders = res.data.sliders.filter(
            (s) => s.status === true && (s.type === deviceType || !s.type)
          );
          setSlides(filteredSliders);
        }
      } catch (err) {
        console.error("Slider error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSliders();
  }, [isMobile]);

  if (loading)
    return (
      <div className="h-[220px] md:h-[500px] flex items-center justify-center bg-gray-100 font-bold">
        Loading Banners...
      </div>
    );

  if (slides.length === 0) return null;

  return (
    <div className="w-full h-[220px] sm:h-[280px] md:h-[400px] lg:h-auto">
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        loop={true}
        navigation={{
          nextEl: ".custom-next",
          prevEl: ".custom-prev",
        }}
        pagination={{ clickable: true }}
        className="w-full h-full "
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide._id}>
            <div
              onClick={() =>
                slide.productID &&
                navigate(
                  getProductPath({
                    _id: slide.productID,
                    name: slide.productName || slide.title || "product",
                  }),
                )
              }
              className={`w-full h-full ${slide.productID ? "cursor-pointer" : ""}`}
            >
              <img
                data-priority="high"
                src={getImageUrl(slide.image) || slide.image}
                alt={slide.title || "Banner"}
                className="w-full h-full object-fill"
              />
            </div>
          </SwiperSlide>
        ))}

        {/* Custom Navigation Buttons */}
      </Swiper>

      {/* ================= TRUST BAR ================= */}
      <div className="bg-white px-2 w-full py-3 md:py-0 md:h-10 flex items-center">
        <div className="container mx-auto flex flex-row md:text-sm text-xs justify-center items-center gap-3 md:gap-6 px-2 md:px-4">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 text-black group">
              <span className="text-xl md:text-2xl transition-transform duration-300 group-hover:scale-110">
                {item.icon}
              </span>
              <p className="text-xs md:text-xs font-thin uppercase tracking-wider">
                {item.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSlider;
