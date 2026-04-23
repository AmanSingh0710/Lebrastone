import React from 'react';
import { CheckCircle } from 'lucide-react';

const Reviews = ({ reviews, overallRating, totalReviews }) => {
  
  // Data from your HTML snapshot for the Bar Chart
  const distribution = [
    { star: 5, count: 26, width: '72%' },
    { star: 4, count: 9, width: '25%' },
    { star: 3, count: 1, width: '3%' },
    { star: 2, count: 0, width: '0%' },
    { star: 1, count: 0, width: '0%' }
  ];

  // Specific Avatar Colors from Mamaearth design
  const avatarColors = [
    'rgb(0, 122, 214)', // Blue
    'rgb(255, 179, 0)', // Yellow
    'rgb(0, 214, 150)', // Green
    'rgb(243, 68, 68)'  // Red
  ];

  return (
    <div className="font-sans text-[#222]">
      
      {/* Header: Title and Button */}
      <div className="flex justify-between items-center mb-6">
         <div className="flex items-center gap-3">
            <h3 className="text-[18px] font-bold text-gray-800">Ratings & Reviews</h3>
            {/* Verified Badge Icon */}
            <div className="flex items-center gap-1">
               <div className="w-4 h-4 border border-green-600 rounded flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-600 rounded-[1px]"></div>
               </div>
               <span className="text-[12px] text-gray-600">Only verified users</span>
            </div>
         </div>
         <button className="hidden md:block border border-gray-200 text-gray-600 font-bold text-[12px] px-4 py-2 rounded shadow-sm hover:bg-gray-50 tracking-wide">
            RATE PRODUCT
         </button>
      </div>

      {/* Summary Section (Big 5.0 and Bars) */}
      <div className="flex flex-col md:flex-row items-center mb-6 gap-6 md:gap-12">
         
         {/* Left: Big Score */}
         <div className="flex items-center gap-2">
            <div className="flex items-center border-r border-gray-200 pr-4">
               <span className="text-[26px] font-semibold text-[#1d1d1d] mr-1">5.0</span>
               <span className="text-[#ffc300] text-[24px]">★</span>
            </div>
            <div className="text-[14px] text-[#1d1d1d]">
               Based on 36 Reviews
            </div>
         </div>

         {/* Right: Progress Bars */}
         <div className="flex-1 w-full max-w-[300px]">
            {distribution.map((d) => (
               <div key={d.star} className="flex items-center gap-2 mb-1">
                  <div className="w-8 text-right font-medium text-[#222] text-[13px] flex justify-end items-center">
                     {d.star} <span className="text-[10px] ml-1 text-[#292929]">★</span>
                  </div>
                  <div className="flex-1 h-[4px] bg-[#d7d7d7] rounded-full overflow-hidden">
                     <div className="h-full bg-[#292929] rounded-full" style={{ width: d.width }}></div>
                  </div>
                  <div className="w-6 text-[12px] font-semibold text-[#292929] text-left">
                     ({d.count})
                  </div>
               </div>
            ))}
         </div>
      </div>

      <div className="h-[1px] bg-[#e0e0e0] w-full mb-6"></div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review, index) => {
          // Get initials (e.g., Shikha -> S, Pooja Nathwani -> PN)
          const initials = review.name.match(/\b(\w)/g).join('').substring(0,2).toUpperCase();
          const bgCol = avatarColors[index % avatarColors.length];

          return (
            <div key={index} className="border-b border-gray-100 pb-6 last:border-0">
               {/* Review Header */}
               <div className="flex items-center gap-3 mb-2">
                  <div 
                     className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm"
                     style={{ backgroundColor: bgCol }}
                  >
                     {initials}
                  </div>
                  <div>
                     <div className="flex items-baseline gap-2">
                        <span className="font-bold text-[14px] text-[#222]">{review.name}</span>
                        <span className="text-[12px] text-[#a8a7a7]">{review.date}</span>
                     </div>
                     <div className="text-[12px] text-[#59a30e] font-bold">Verified User</div>
                  </div>
               </div>

               {/* Stars (Gold Color) */}
               <div className="flex gap-[2px] mb-2 text-[18px]">
                  {[...Array(review.rating)].map((_, i) => (
                     <span key={i} style={{ color: 'rgb(255, 192, 34)' }}>★</span>
                  ))}
               </div>

               {/* Comment */}
               <p className="text-[14px] text-[#222] leading-relaxed">
                  {review.comment}
               </p>
            </div>
          );
        })}
      </div>

      {/* View All Button */}
      <div className="flex justify-center mt-6">
         <button className="text-[#00AFEF] font-bold text-sm uppercase hover:underline">
            View all reviews
         </button>
      </div>

    </div>
  );
};

export default Reviews;