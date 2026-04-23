import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, User } from "lucide-react";
import instance, { getImageUrl } from "./api/AxiosConfig";
import SeoMeta from "../common/SeoMeta";

import Footer from "./comman/Footer";

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getBlogImageUrl = (url) => {
    if (!url) return "https://via.placeholder.com/800x400?text=Blog";
    return getImageUrl(url);
  };

  useEffect(() => {
    const fetchBlogDetail = async () => {
      try {
        const res = await instance.get(`/api/blogs/${id}`);
        if (res.data.success && res.data.data) {
          setBlog(res.data.data);
        } else {
          throw new Error("Blog not found");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load blog");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchBlogDetail();
    window.scrollTo(0, 0);
  }, [id]);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-10 w-10 border-b-2 border-[#00a688] rounded-full" />
      </div>
    );

  if (error || !blog)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold mb-3">Blog Not Found</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={() => navigate("/blogs")}
          className="bg-[#00a688] text-white px-6 py-2 rounded-md hover:bg-[#008d74]"
        >
          Back to Blogs
        </button>
      </div>
    );

  const seoDescription = String(
    blog.shortDescription || blog.longDescription || blog.title || "",
  )
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
  const seoImage = getBlogImageUrl(blog.image);

  return (
    <div className="bg-white">
      <SeoMeta
        title={`${blog.title} | LEBROSTONE Blog`}
        description={seoDescription || "Read this blog article from LEBROSTONE."}
        image={seoImage}
        type="article"
      />

      <main className="py-10 px-4">
        {/* Back Button */}
        <div className="max-w-3xl mx-auto mb-6">
          <button
            onClick={() => navigate("/blogs")}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#00a688]"
          >
            <ArrowLeft size={18} />
            Back to Blogs
          </button>
        </div>

        {/* Article */}
        <article className="max-w-3xl mx-auto">

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-4">
            {blog.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
            <div className="flex items-center gap-1">
              <User size={16} />
              {blog.author || "Admin"}
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              {formatDate(blog.createdAt)}
            </div>
          </div>

          {/* Image */}
          <div className="rounded-xl overflow-hidden mb-6">
            <img
              src={getBlogImageUrl(blog.image)}
              alt={blog.title}
              className="w-full h-[260px] md:h-[380px] object-cover"
            />
          </div>

          {/* Short Description */}
          {blog.shortDescription && (
            <div className="bg-gray-50 border-l-4 border-[#00a688] p-4 rounded mb-6">
              <p className="italic text-gray-700">
                {blog.shortDescription}
              </p>
            </div>
          )}

          {/* Content */}
         <div
  className="
    text-gray-700 leading-7 space-y-4 w-full
    break-words overflow-hidden

    [&_img]:max-w-full
    [&_img]:h-auto
    [&_img]:rounded-lg

    [&_p]:break-words
    [&_*]:max-w-full
  "
  dangerouslySetInnerHTML={{ __html: blog.longDescription }}
/>

          {/* Bottom Back Button */}
          <div className="mt-10 text-center">
            <button
              onClick={() => navigate("/blogs")}
              className="bg-[#00a688] text-white px-6 py-2 rounded-md hover:bg-[#008d74]"
            >
              ← Back to Blogs
            </button>
          </div>

        </article>
      </main>

      <Footer />
    </div>
  );
};

export default BlogDetail;
