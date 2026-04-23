import React, { useState, useEffect } from "react";
import instance from "../api/AxiosConfig";
import { Loader2 } from "lucide-react";

const TermConditions = () => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await instance.get("/api/pages/Terms & Conditions");

        if (res.data.success && res.data.data) {
          setContent(res.data.data.description || "");
        } else {
          setError("Content not found");
        }
      } catch (err) {
        setError("Failed to load content");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  // 🔹 Loading UI
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={50} />
      </div>
    );
  }

  // 🔹 Error UI
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
      <div className="max-w-4xl mx-auto">

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

          {/* 🔵 HEADER */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-12 text-center">
            <h1 className="text-4xl font-bold text-white">
              Terms & Conditions
            </h1>
            <p className="text-blue-100 mt-2">
              Please read our terms carefully
            </p>
          </div>

          {/* 📝 CONTENT */}
          <div className="px-8 py-10">

            {content ? (
              <div
                className="
                  prose prose-lg max-w-none
                  break-words
                  overflow-hidden
                  leading-relaxed
                  text-gray-700
                  
                  [&_*]:break-words
                  [&_*]:whitespace-normal
                "
                dangerouslySetInnerHTML={{
                  __html: content.replace(/&nbsp;/g, " "),
                }}
              />
            ) : (
              <p className="text-gray-500 text-center">
                No content available
              </p>
            )}

          </div>

          {/* 🔘 FOOTER */}
          <div className="bg-gray-50 px-8 py-6 border-t flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <button
              onClick={() =>
                window.scrollTo({ top: 0, behavior: "smooth" })
              }
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Top
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default TermConditions;