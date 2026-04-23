import React, { useState, useEffect } from "react";
import instance from "../api/AxiosConfig";
import { Loader2, XCircle } from "lucide-react";

const CancellationPolicy = () => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await instance.get("/api/pages/Cancellation Policy");

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
        <Loader2 className="animate-spin text-red-600" size={50} />
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
      <div className="max-w-4xl mx-auto">

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

          {/* 🔴 HEADER */}
          <div className="bg-gradient-to-r from-red-500 to-pink-500 px-8 py-12 text-center">
            <div className="flex justify-center mb-4">
              <XCircle className="text-white" size={48} />
            </div>

            <h1 className="text-4xl font-bold text-white">
              Cancellation Policy
            </h1>

            <p className="text-red-100 mt-2">
              Clear guidelines for order cancellations
            </p>
          </div>

          {/* 📝 CONTENT */}
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

          {/* 🔘 FOOTER */}
          <div className="bg-gray-50 px-8 py-6 border-t flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <button
              onClick={() =>
                window.scrollTo({ top: 0, behavior: "smooth" })
              }
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Back to Top
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default CancellationPolicy;