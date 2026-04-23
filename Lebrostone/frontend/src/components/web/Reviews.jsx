import React, { useEffect, useState, useRef } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import instance, { getImageUrl } from "./api/AxiosConfig";

// Swiper styles
import "swiper/css";
import "swiper/css/navigation";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const swiperRef = useRef(null);

  const getInitials = (name) => {
    if (!name) return "?";
    const nameParts = name.trim().split(" ");
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    return (
      nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)
    ).toUpperCase();
  };

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await instance.get("/api/reviews/all");
        const data = res.data;
        const activeReviews = data.filter((r) => r.status === true);
        setReviews(activeReviews);
      } catch (err) {
        console.error("Review fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  if (loading)
    return (
      <div className="py-20 text-center font-semibold text-[#A88B56] animate-pulse">
        Loading Reviews...
      </div>
    );

  if (!reviews.length) return null;

  return (
    <div className="py-10 md:py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-center mb-10">
          <div className="text-black  px-12 md:px-24  ">
            <h2 className="text-lg md:text-2xl font-bold uppercase tracking-[0.2em] text-center">
              Customer Reviews
            </h2>
          </div>
        </div>

        {/* Changed max-w-2xl to max-w-7xl to allow 3 columns to breathe */}
        <div className="relative max-w-7xl mx-auto group">
          <Swiper
            modules={[Autoplay, Navigation]}
            spaceBetween={20}
            // Responsive breakpoints
            breakpoints={{
              640: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 }, // Shows 3 reviews on desktop
            }}
            loop={true}
            autoplay={{
              delay: 3000, // 3 seconds auto-scroll
              disableOnInteraction: false, // Keeps autoplay running after manual swipe
            }}
            onSwiper={(swiper) => (swiperRef.current = swiper)}
            className="pb-12"
          >
            {reviews.map((review) => (
              <SwiperSlide key={review._id} className="h-full">
                <div className="bg-white h-full rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col items-center text-center transition-transform duration-300 hover:shadow-lg">
                  {/* Customer Image */}
                  <div className="w-16 h-16 mb-4 rounded-full overflow-hidden border-2 border-[#FAF6EA] shadow-sm flex items-center justify-center shrink-0">
                    {review.customerImage ? (
                      <img
                        src={getImageUrl(review.customerImage)}
                        alt={review.customerName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = "none";
                          if (e.target.nextSibling)
                            e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-full h-full bg-[#FAF6EA] text-[#A88B56] flex items-center justify-center font-bold text-xl uppercase ${review.customerImage ? "hidden" : ""}`}
                    >
                      {getInitials(review.customerName)}
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex justify-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        fill={i < review.rating ? "#fbbf24" : "none"}
                        className={
                          i < review.rating
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }
                      />
                    ))}
                  </div>

                  {/* Comment */}
                  <p className="text-sm md:text-base text-gray-600 italic leading-relaxed mb-6 flex-grow">
                    "{review.comment}"
                  </p>

                  {/* Name */}
                  <h3 className="text-xs md:text-sm font-bold text-black uppercase tracking-widest">
                    {review.customerName}
                  </h3>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation Buttons (Positioned outside the swiper container) */}
          <button
            onClick={() => swiperRef.current?.slidePrev()}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 lg:-translate-x-12 z-30 w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center text-gray-400 hover:text-black hover:scale-110 transition-all"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={() => swiperRef.current?.slideNext()}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 lg:translate-x-12 z-30 w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center text-gray-400 hover:text-black hover:scale-110 transition-all"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reviews;
