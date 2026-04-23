import React, { useState, useEffect } from "react";
import instance, { getImageUrl } from "../../web/api/AxiosConfig";
import {
  Trash2,
  Star,
  Upload,
  Plus,
  Loader2,
  UserCircle,
  MessageSquare,
  
  Edit,
} from "lucide-react";

const Reviewadmin = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    customerName: "",
    rating: 5,
    comment: "",
    image: null,
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await instance.get("/api/reviews/all");
      setReviews(res.data);
    } catch (err) {
      console.error("Fetch error");
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const nameParts = name.trim().split(" ");
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    return (
      nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)
    ).toUpperCase();
  };

  const getReviewImageUrl = (path) => {
    if (!path) return null;
    return getImageUrl(path);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleEditClick = (rev) => {
    setEditingId(rev._id);
    setFormData({
      customerName: rev.customerName,
      rating: rev.rating,
      comment: rev.comment,
      image: null,
    });
    setImagePreview(getReviewImageUrl(rev.customerImage));
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ customerName: "", rating: 5, comment: "", image: null });
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    data.append("customerName", formData.customerName);
    data.append("rating", formData.rating);
    data.append("comment", formData.comment);
    if (formData.image) data.append("image", formData.image);

    try {
      const token = localStorage.getItem("adminToken");
      if (editingId) {
        await instance.put(`/api/reviews/update/${editingId}`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        alert("Review Updated! ⭐");
      } else {
        await instance.post("/api/reviews/add", data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        alert("Review Published! ⭐");
      }
      setFormData({ customerName: "", rating: 5, comment: "", image: null });
      setImagePreview(null);
      setEditingId(null);
      fetchReviews();
    } catch (err) {
      alert(editingId ? "Error updating review" : "Error adding review");
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (id) => {
    if (window.confirm("Delete this review?")) {
      const token = localStorage.getItem("adminToken");
      await instance.delete(`/api/reviews/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchReviews();
    }
  };

  return (
    <div className="p-6 md:p-8 bg-[#F9FAFB] min-h-screen text-slate-800 font-sans">
      <h1 className="text-2xl font-black uppercase  tracking-tighter text-slate-800 mb-8 flex items-center gap-3">
        <MessageSquare className="text-blue-600" size={28} />
        Review <span className="text-blue-600">Center</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Compact Form */}
        <div className="lg:col-span-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200"
          >
            <div className="flex items-center gap-4 mb-6 bg-slate-50 p-4 rounded-2xl">
              <div className="w-16 h-16 bg-white rounded-full overflow-hidden border-2 border-blue-100 flex items-center justify-center shrink-0">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl uppercase">
                    {formData.customerName ? (
                      getInitials(formData.customerName)
                    ) : (
                      <UserCircle size={30} className="text-slate-300" />
                    )}
                  </div>
                )}
              </div>
              <label className="text-[10px] font-black uppercase bg-blue-600 text-white px-3 py-1.5 rounded-lg cursor-pointer hover:bg-blue-700 transition-all">
                Upload Photo{" "}
                <input type="file" hidden onChange={handleImageChange} />
              </label>
            </div>

            <div className="space-y-3">
              <input
                required
                placeholder="Name"
                className="w-full bg-slate-50 p-3 rounded-xl outline-none ring-1 ring-slate-100 focus:ring-blue-500 font-bold text-sm"
                value={formData.customerName}
                onChange={(e) =>
                  setFormData({ ...formData, customerName: e.target.value })
                }
              />

              <select
                className="w-full bg-slate-50 p-3 rounded-xl outline-none ring-1 ring-slate-100 font-bold text-sm"
                value={formData.rating}
                onChange={(e) =>
                  setFormData({ ...formData, rating: e.target.value })
                }
              >
                {[5, 4, 3, 2, 1].map((num) => (
                  <option key={num} value={num}>
                    {num} Stars
                  </option>
                ))}
              </select>

              <textarea
                required
                placeholder="Write review..."
                className="w-full bg-slate-50 p-3 rounded-xl h-24 outline-none ring-1 ring-slate-100 resize-none font-medium text-sm"
                value={formData.comment}
                onChange={(e) =>
                  setFormData({ ...formData, comment: e.target.value })
                }
              />

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-slate-900 text-white p-3.5 rounded-xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 transition-all"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Plus size={16} />
                  )}{" "}
                  {editingId ? "Update Review" : "Post Review"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={loading}
                    className="bg-red-50 text-red-600 p-3.5 rounded-xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-red-100 transition-all"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Compact List (Table Format) */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="p-4 text-[10px] font-black uppercase text-slate-400">
                    User
                  </th>
                  <th className="p-4 text-[10px] font-black uppercase text-slate-400">
                    Rating
                  </th>
                  <th className="p-4 text-[10px] font-black uppercase text-slate-400">
                    Comment
                  </th>
                  <th className="p-4 text-[10px] font-black uppercase text-slate-400 text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {reviews.map((rev) => (
                  <tr
                    key={rev._id}
                    className="hover:bg-slate-50/50 transition-all group"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {rev.customerImage ? (
                          <img
                            src={getReviewImageUrl(rev.customerImage)}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200"
                            onError={(e) => {
                              e.target.onerror = null; // prevents looping
                              e.target.style.display = "none";
                              if (e.target.nextSibling)
                                e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm uppercase ${rev.customerImage ? "hidden" : ""}`}
                        >
                          {getInitials(rev.customerName)}
                        </div>
                        <span className="font-bold text-xs uppercase text-slate-700">
                          {rev.customerName}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-0.5">
                        {[...Array(Number(rev.rating))].map((_, i) => (
                          <Star
                            key={i}
                            size={10}
                            fill="#EAB308"
                            className="text-yellow-500"
                          />
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-[11px] text-slate-500 italic max-w-xs truncate">
                      "{rev.comment}"
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditClick(rev)}
                          className="text-slate-300 hover:text-blue-500 p-2 transition-all"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => deleteReview(rev._id)}
                          className="text-slate-300 hover:text-red-500 p-2 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {reviews.length === 0 && (
              <p className="p-10 text-center text-slate-300 font-bold uppercase text-[10px]">
                No reviews found
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reviewadmin;
