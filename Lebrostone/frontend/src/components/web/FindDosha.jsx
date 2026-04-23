import React, { useState, useEffect } from "react";
import { Sparkles, Droplets, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import instance, { getImageUrl } from "./api/AxiosConfig";
import { getProductPath } from "../../utils/productRoutes";

const FindDosha = () => {
  const navigate = useNavigate();
  const [findOffer, setFindOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const defaultImage = "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80";

  useEffect(() => {
    fetchFindOffer();
  }, []);

  const fetchFindOffer = async () => {
    try {
      const res = await instance.get("/api/offer-content/type/findOffer");
      if (res.data.success && res.data.data) {
        setFindOffer(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching find offer:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCtaClick = () => {
    if (findOffer?.productId) {
      navigate(getProductPath(findOffer.productId));
    }
  };

  if (loading) {
    return (
      <div className="py-16 bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A88B56]"></div>
      </div>
    );
  }

  const displayImage = findOffer?.image ? getImageUrl(findOffer.image) : defaultImage;
  const displayTitle = findOffer?.title || "Elevate Your Everyday Wellness";
  const displayDescription = findOffer?.description || "it is a daily commitment to balance, nourishment, and mindful living. By embracing the purity of nature and the power of thoughtful formulation, you create a foundation for lasting vitality.";
  const ctaText = findOffer?.ctaText || "Start Analysis";

  return (
    <div className="py-8 md:py-16 bg-white">
      <div className="container mx-auto px-4 md:px-12">
        <div className="flex flex-row lg:flex-row items-center gap-6 md:gap-16 lg:gap-24 max-w-7xl mx-auto">
          
          {/* LEFT: Image Section */}
          <div className="w-1/2 lg:w-1/2 relative">
            <div className="relative rounded-2xl md:rounded-[3rem] overflow-hidden shadow-2xl group">
              <img
                src={displayImage}
                alt="Wellness"
                className="w-full h-[200px] md:h-[500px] object-cover transition-transform duration-1000 group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-black/5"></div>

              {/* Floating Glass Icons */}
              <div className="absolute top-4 left-4 md:top-10 md:left-10 flex flex-col gap-3 md:gap-6">
                <div className="p-2 md:p-4 bg-white/90 backdrop-blur-md rounded-xl md:rounded-2xl shadow-xl animate-bounce">
                  <Sparkles size={16} className="text-[#A88B56] md:hidden" />
                  <Sparkles size={28} className="text-[#A88B56] hidden md:block" />
                </div>
                <div className="p-2 md:p-4 bg-white/90 backdrop-blur-md rounded-xl md:rounded-2xl shadow-xl animate-bounce delay-150">
                  <Droplets size={16} className="text-[#A88B56] md:hidden" />
                  <Droplets size={28} className="text-[#A88B56] hidden md:block" />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Text Content */}
          <div className="w-1/2 lg:w-1/2 text-left space-y-3 md:space-y-10">
            <h2 className="text-2xl md:text-7xl font-black text-slate-900 leading-[0.9] uppercase tracking-tighter italic">
              {displayTitle.split(' ').slice(0, -1).join(' ')} <br />
              <span className="text-[#A88B56]">{displayTitle.split(' ').slice(-1).join(' ')}</span>
            </h2>

            <p className="text-slate-500 text-xs md:text-xl font-medium leading-relaxed max-w-md">
              {expanded || displayDescription.length <= 100
                ? displayDescription
                : `${displayDescription.substring(0, 100)}...`}
              {displayDescription.length > 100 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-[#A88B56] font-bold ml-1 hover:underline"
                >
                  {expanded ? "Read Less" : "Read More"}
                </button>
              )}
            </p>

            <button
              onClick={handleCtaClick}
              className="bg-slate-900 text-white px-4 md:px-12 py-2 md:py-5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-[0.2em] md:tracking-[0.3em] hover:bg-[#A88B56] transition-all"
            >
              {ctaText} <ArrowRight size={14} className="inline ml-1 md:hidden" />
              <ArrowRight size={20} className="ml-2 hidden md:inline" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FindDosha;
