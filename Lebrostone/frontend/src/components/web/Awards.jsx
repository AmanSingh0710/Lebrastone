import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Awards = () => {
  // 🟢 Apka Backend URL
  const BACKEND_URL = "http://localhost:5001"; 

  const awardProducts = [
    {
      id: 1,
      // ✅ Sahi hai (Backticks ` use kiye hain)
      image: `${BACKEND_URL}/uploads/awords/1.webp`, 
      badge: "https://cdn-icons-png.flaticon.com/512/10444/10444535.png",
      alt: "Cosmopolitan Beauty Awards 2019 Winner",
      title: "Best Hair Serum"
    },
    {
      id: 2,
      // 🔧 Fixed: Pehle yahan double quotes " the, ab backticks ` hain
      image: `${BACKEND_URL}/uploads/awords/2.jpg`,
      badge: "https://cdn-icons-png.flaticon.com/512/10444/10444535.png",
      alt: "Vogue Beauty Awards Winner",
      title: "Pure Rose Water"
    },
    {
      id: 3,
      // 🔧 Fixed
      image: `${BACKEND_URL}/uploads/awords/3.jpg`,
      badge: "https://cdn-icons-png.flaticon.com/512/10444/10444535.png",
      alt: "Harper's Bazaar Conscious Beauty",
      title: "Gold Saffron Gel"
    },
    {
      id: 4,
      // 🔧 Fixed
      image: `${BACKEND_URL}/uploads/awords/4.jpg`,
      badge: "https://cdn-icons-png.flaticon.com/512/10444/10444535.png",
      alt: "Elle Beauty Awards Winner",
      title: "Nourishing Hair Oil"
    },
    {
      id: 5,
      // ✅ Sahi hai
      image: `${BACKEND_URL}/uploads/awords/5.jpg`,
      badge: "https://cdn-icons-png.flaticon.com/512/10444/10444535.png",
      alt: "Clean Beauty Award",
      title: "Herbal Cleanser"
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsToShow, setItemsToShow] = useState(4);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsToShow(1);
      else if (window.innerWidth < 1024) setItemsToShow(2);
      else setItemsToShow(4);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = awardProducts.length - itemsToShow;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
  };

  return (
    <div className="py-20 bg-[#FEF9F1]"> 
      <div className="container mx-auto px-4">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-[0.3em] text-black">
            Awards & Accolades
          </h2>
          <p className="text-gray-500 mt-4 italic">Recognized for Purity and Excellence</p>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 md:px-12">
          
          {/* Previous Button */}
          <button 
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white border border-gray-100 text-gray-400 hover:bg-black hover:text-white transition-all shadow-lg active:scale-90"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Slider Window */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-700 cubic-bezier(0.4, 0, 0.2, 1)"
              style={{ transform: `translateX(-${currentIndex * (100 / itemsToShow)}%)` }}
            >
              {awardProducts.map((item) => (
                <div 
                  key={item.id} 
                  className="flex-shrink-0 px-3 md:px-5" 
                  style={{ width: `${100 / itemsToShow}%` }}
                >
                  <div className="relative bg-white rounded-3xl p-8 h-[450px] flex flex-col items-center justify-center shadow-sm hover:shadow-2xl transition-all duration-500 group border border-orange-50/50">
                    
                    {/* Badge */}
                    <div className="absolute top-6 right-6 w-20 md:w-24 z-10 transform group-hover:rotate-12 transition-transform duration-500">
                      <img src={item.badge} alt="Award Badge" className="w-full h-auto drop-shadow-xl"/>
                    </div>

                    {/* Product Image */}
                    <div className="h-64 w-full mb-6 relative">
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          className="h-full w-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700"
                          onError={(e) => {
                             e.target.src = "https://via.placeholder.com/400?text=Image+Not+Found";
                          }}
                        />
                    </div>

                    {/* Text Info */}
                    <div className="text-center">
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest">{item.title}</h3>
                        <p className="text-[10px] text-gray-400 mt-2 font-medium tracking-tighter">{item.alt}</p>
                    </div>
                    
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next Button */}
          <button 
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white border border-gray-100 text-gray-400 hover:bg-black hover:text-white transition-all shadow-lg active:scale-90"
          >
            <ChevronRight size={24} />
          </button>

        </div>
      </div>
    </div>
  );
};

export default Awards;