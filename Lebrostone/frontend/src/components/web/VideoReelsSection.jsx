import React, { useRef, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { FaStar, FaChevronLeft, FaChevronRight, FaPlay, FaTimes } from "react-icons/fa";
import "swiper/css";
import "swiper/css/navigation";
import instance, { IMAGE_BASE_URL } from "./api/AxiosConfig";

const VideoReelCard = ({ video, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    videoRef.current?.play();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div
      className="relative aspect-[9/16] rounded-2xl overflow-hidden group/card shadow-2xl cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onClick(video)}
    >
      {/* Video Element - Appending baseUrl to the videoUrl from API */}
      <video
        ref={videoRef}
        src={`${IMAGE_BASE_URL}${video.videoUrl?.startsWith("/") ? video.videoUrl : "/" + (video.videoUrl || "")}`}
        className="absolute inset-0 w-full h-full object-cover"
        loop
        muted
        playsInline
      />

      {!isHovered && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-300">
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
            <FaPlay className="text-black ml-1" size={24} />
          </div>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-5">
        <div className="flex items-center gap-1 mb-2">
          {/* Using rating from API */}
          {[...Array(5)].map((_, i) => (
            <FaStar
              key={i}
              className={i < video.rating ? "text-yellow-400" : "text-gray-400"}
              size={12}
            />
          ))}
        </div>

        {/* API keys: customerName and reviewText */}
        <h3 className="text-white font-bold text-sm mb-1">
          {video.customerName}
        </h3>
        <p className="text-white/90 text-xs leading-relaxed line-clamp-2">
          {video.reviewText}
        </p>
      </div>
    </div>
  );
};

const VideoReelsSection = () => {
  const swiperRef = useRef(null);
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReel, setSelectedReel] = useState(null);
  const modalVideoRef = useRef(null);

  useEffect(() => {
    instance
      .get("/api/reels/all")
      .then((res) => {
        // Based on your screenshot, res.data is the array
        setReels(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching reels:", err);
        setLoading(false);
      });
  }, []);

  // Handle opening modal
  const handleReelClick = (reel) => {
    setSelectedReel(reel);
    document.body.style.overflow = "hidden"; // Prevent background scrolling
  };

  // Handle closing modal
  const handleCloseModal = () => {
    if (modalVideoRef.current) {
      modalVideoRef.current.pause();
    }
    setSelectedReel(null);
    document.body.style.overflow = "auto"; // Restore scrolling
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        handleCloseModal();
      }
    };

    if (selectedReel) {
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [selectedReel]);

  if (loading) return <div className="py-20 text-center">Loading Reels...</div>;

  return (
    <section className="md:py-1 px-4 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center mb-6 md:mb-10">
          <div className="text-black py-3 px-12 md:px-24">
            <h2 className="text-lg md:text-2xl font-bold uppercase tracking-[0.2em] text-center">
              Customer Love
            </h2>
          </div>
        </div>

        <div className="relative group px-4 md:px-8">
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={20}
            slidesPerView={2}
            onSwiper={(swiper) => (swiperRef.current = swiper)}
            loop={reels.length > 5} // Only loop if we have enough slides
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            breakpoints={{
              640: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              1024: { slidesPerView: 4 },
              1280: { slidesPerView: 5 },
            }}
            className="pb-8"
          >
            {reels.map((video) => (
              <SwiperSlide key={video._id}>
                <VideoReelCard video={video} onClick={handleReelClick} />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation buttons... (keep your existing button code) */}
          <button
            onClick={() => swiperRef.current?.slidePrev()}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <FaChevronLeft />
          </button>
          <button
            onClick={() => swiperRef.current?.slideNext()}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>

      {/* Video Popup Modal */}
      {selectedReel && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm"
          onClick={handleCloseModal}
        >
          {/* Close Button */}
          <button
            onClick={handleCloseModal}
            className="absolute top-6 right-6 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
          >
            <FaTimes size={28} />
          </button>

          {/* Video Container */}
          <div 
            className="relative w-full max-w-sm aspect-[9/16] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              ref={modalVideoRef}
              src={`${IMAGE_BASE_URL}${selectedReel.videoUrl?.startsWith("/") ? selectedReel.videoUrl : "/" + (selectedReel.videoUrl || "")}`}
              className="w-full h-full object-cover rounded-2xl"
              controls
              autoPlay
              playsInline
            />

            {/* Reel Info Overlay */}
            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent rounded-b-2xl">
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={i < selectedReel.rating ? "text-yellow-400" : "text-gray-400"}
                    size={14}
                  />
                ))}
              </div>
              <h3 className="text-white font-bold text-lg mb-1">
                {selectedReel.customerName}
              </h3>
              <p className="text-white/90 text-sm leading-relaxed">
                "{selectedReel.reviewText}"
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default VideoReelsSection;
