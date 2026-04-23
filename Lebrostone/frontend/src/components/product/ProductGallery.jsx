import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Maximize } from "lucide-react";

const ProductGallery = ({ images = [], loading = false }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const safeImages = images.length > 0 ? images : ["https://via.placeholder.com/600"];

  useEffect(() => {
    setActiveIndex(0);
  }, [images]);

  // Next Image Function
  const nextImage = () => {
    setActiveIndex((prev) => (prev === safeImages.length - 1 ? 0 : prev + 1));
  };

  // Previous Image Function
  const prevImage = () => {
    setActiveIndex((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1));
  };

  return (
    <div className="flex flex-col gap-4 sticky top-24 self-start">
      
      {/* --- MAIN IMAGE CONTAINER --- */}
      <div className="relative w-full aspect-square bg-white border border-gray-200 rounded-xl overflow-hidden flex items-center justify-center group">
        
        {/* Main Image */}
        <img 
          src={safeImages[activeIndex]} 
          alt="Product" 
          className="w-full h-full object-contain p-4 transition-transform duration-500 hover:scale-105 cursor-zoom-in"
          onError={(e) => {
            e.currentTarget.src = "/favicon.png";
          }}
        />
        {loading && (
          <div className="absolute inset-0 bg-white/70 z-20 flex items-center justify-center">
            <Loader2 className="animate-spin text-[#00AFEF]" size={26} />
          </div>
        )}

        {/* Left Arrow (Visible on Hover) */}
        <button 
          onClick={(e) => { e.stopPropagation(); prevImage(); }}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 transition-opacity opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Right Arrow (Visible on Hover) */}
        <button 
          onClick={(e) => { e.stopPropagation(); nextImage(); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 transition-opacity opacity-0 group-hover:opacity-100"
        >
          <ChevronRight size={20} />
        </button>

        {/* Zoom/Expand Icon (Bottom Right) */}
        <div className="absolute bottom-3 right-3 p-1.5 bg-white/90 rounded-md shadow-sm text-gray-500 cursor-pointer hover:text-[#00AFEF]">
           <Maximize size={18} />
        </div>

      </div>

      {/* --- THUMBNAILS ROW --- */}
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        {safeImages.map((img, idx) => (
          <div 
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg border-2 cursor-pointer overflow-hidden p-1 ${
              activeIndex === idx 
                ? 'border-[#00AFEF]'  // Active Blue Border
                : 'border-transparent hover:border-gray-300'
            }`}
          >
            <img 
              src={img} 
              alt={`thumbnail-${idx}`} 
              className="w-full h-full object-contain rounded-md"
              onError={(e) => {
                e.currentTarget.src = "/favicon.png";
              }}
            />
          </div>
        ))}
      </div>

    </div>
  );
};

export default ProductGallery;
