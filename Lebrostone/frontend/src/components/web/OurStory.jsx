import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import instance, { getImageUrl } from "./api/AxiosConfig";

const OurStory = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  // Use local placeholder
  const PLACEHOLDER =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5Y2EzYWYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+";

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const response = await instance.get("/api/stories/active");
      setStories(response.data?.data || []);
    } catch (err) {
      console.error("Error fetching stories:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="py-6 md:py-16 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex justify-center mb-10">
            <h2 className="text-lg md:text-2xl font-bold uppercase tracking-[0.2em] text-center">
              Our Story
            </h2>
          </div>
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-1 md:py-1 pb-5 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        {/* HEADING */}
        <div className="flex justify-center mb-6 md:mb-10">
          <div className="text-black py-2 md:py-3 px-6 md:px-24">
            <h2 className="text-lg md:text-2xl font-bold uppercase tracking-[0.2em] text-center">
              Our Story
            </h2>
          </div>
        </div>

        {/* GRID LAYOUT */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-10 px-2 md:px-0 max-w-xs md:max-w-none mx-auto">
          {stories.map((item) => (
            <div key={item._id} className="flex flex-col items-center group">
              {/* IMAGE CONTAINER */}
              <div
                className="relative w-full aspect-square md:aspect-[4/5] overflow-hidden rounded-2xl md:rounded-3xl mb-2 md:mb-6 shadow-sm group-hover:shadow-xl transition-all duration-500 cursor-pointer"
                onClick={() => item.description && toggleExpand(item._id)}
              >
                <img
                  src={item.image ? getImageUrl(item.image) : PLACEHOLDER}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                />
                {/* Subtle Overlay */}
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500"></div>
              </div>

              <h3 className="text-sm md:text-xl font-bold text-gray-800 tracking-tight md:tracking-wide text-center group-hover:text-black transition-colors">
                {item.title}
              </h3>

              {/* Description */}
              {item.description && (
                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    expandedId === item._id
                      ? "max-h-[500px] opacity-100 mt-2"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="text-xs md:text-sm text-gray-500 text-center leading-relaxed px-1">
                    {item.description}
                  </p>
                </div>
              )}

              {/* Read More hint */}
              {item.description && (
                <p
                  className="text-xs text-gray-400 mt-1 md:mt-2 uppercase tracking-wider cursor-pointer hover:text-gray-600 transition-colors duration-300"
                  onClick={() => toggleExpand(item._id)}
                >
                  {expandedId === item._id ? "Read Less" : "Read More"}
                </p>
              )}
            </div>
          ))}
        </div>

        {stories.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            <p>No stories available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OurStory;
