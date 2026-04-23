import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import instance, { getImageUrl } from "./api/AxiosConfig";

const Blog = ({ limit }) => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const getBlogImageUrl = (url) => {
    if (!url) return "https://via.placeholder.com/400x400?text=Blog";
    return getImageUrl(url) || "https://via.placeholder.com/400x400?text=Blog";
  };

  // Helper to clean HTML tags and entities from descriptions
  const cleanText = (html) => {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ");
  };

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        // Using await instead of .then() for cleaner logic
        const res = await instance.get("/api/blogs/all");

        // Based on your console: res.data is the Array [ {author, createdAt...} ]
        const rawData = res.data || [];

        const formatted = rawData
          .filter((item) => item.status === true) // Show only active blogs
          .map((item) => ({
            id: item._id,
            title: item.title,
            image: getBlogImageUrl(item.image),
            // Clean up the <h3> and &nbsp; tags found in your console screenshot
            shortDescription: cleanText(item.shortDescription),
            author: item.author,
          }));

        setData(formatted);
      } catch (err) {
        console.error("Blog Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const displayedData = limit ? data.slice(0, limit) : data;

  return (
    <section className="py-10 md:py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-10 uppercase tracking-wide">
          Blogs
        </h2>

        {displayedData.length > 0 ? (
         <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {displayedData.map((item) => (
              <article
                key={item.id}
                className="group cursor-pointer"
                onClick={() => navigate(`/blog/${item.id}`)}
              >
                {/* Image Container */}
                <div className="overflow-hidden rounded-xl mb-4 aspect-square shadow-md">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold mb-2 group-hover:text-blue-600 transition">
                  {item.title}
                </h3>

                <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                  {item.shortDescription}
                </p>

                <div className="mt-3 font-semibold text-blue-600 border-black inline-block text-xs uppercase tracking-tighter">
                  Read More
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No active blogs found.</p>
        )}

        {/* View All Button (Shown only when limited) */}
        {limit && data.length > limit && (
          <div className="flex justify-center mt-12">
            <button
              onClick={() => navigate("/blogs")}
              className="bg-black text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition duration-300 shadow-md"
            >
              View More Blogs
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Blog;
