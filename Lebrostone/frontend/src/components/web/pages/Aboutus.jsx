import React, { useState, useEffect } from "react";
import instance from "../api/AxiosConfig";
import { Loader2, Users, Heart, Award, Leaf } from "lucide-react";

const Aboutus = () => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await instance.get("/api/pages/About Us");

        if (res.data.success && res.data.data) {
          setContent(res.data.data.description || "");
        } else {
          setError("Content not found");
        }
      } catch {
        setError("Failed to load content");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  // 🔹 Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-green-600" size={50} />
      </div>
    );
  }

  // 🔹 Error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow">
          <p className="text-red-500 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">

        {/* HERO */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-full">
              <Users className="text-white" size={48} />
            </div>
          </div>

          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            About Us
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our story, mission, and commitment to your wellness journey
          </p>
        </div>

        {/* MAIN CONTENT */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-12">
          <div className="px-8 py-10">

            {content ? (
              <div
                className="
                  prose prose-lg max-w-none
                  text-gray-700 leading-relaxed
                  
                  break-words
                  overflow-hidden
                  
                  [&_*]:break-words
                  [&_*]:whitespace-normal
                "
                dangerouslySetInnerHTML={{
                  __html: content.replace(/&nbsp;/g, " "),
                }}
              />
            ) : (
              <p className="text-center text-gray-500">
                No content available
              </p>
            )}

          </div>
        </div>

        {/* VALUES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-xl shadow text-center">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="text-red-600" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Our Mission</h3>
            <p className="text-gray-600">
              Dedicated to providing authentic Ayurvedic solutions for holistic wellness
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow text-center">
            <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="text-yellow-600" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Quality Promise</h3>
            <p className="text-gray-600">
              Premium ingredients sourced ethically with traditional wisdom
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Leaf className="text-green-600" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Natural Approach</h3>
            <p className="text-gray-600">
              Harnessing nature's power for sustainable health and beauty
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="bg-white rounded-2xl shadow p-8 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <button
            onClick={() =>
              window.scrollTo({ top: 0, behavior: "smooth" })
            }
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Back to Top
          </button>
        </div>

      </div>
    </div>
  );
};

export default Aboutus;