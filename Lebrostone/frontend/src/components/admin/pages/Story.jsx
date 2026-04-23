import React, { useState, useEffect } from "react";
import instance, { getImageUrl } from "../../web/api/AxiosConfig";
import {
  Upload,
  Plus,
  Loader2,
  BookOpen,
  Trash2,
  Pencil,
  X,
} from "lucide-react";

const Story = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [editingStory, setEditingStory] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: null,
  });

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const res = await instance.get("/api/stories/all");
      setStories(res.data.data || []);
    } catch (err) {
      console.error("Error fetching stories:", err);
    }
  };

  const handleAddStory = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("image", formData.image);

    try {
      const token = localStorage.getItem("adminToken");
      await instance.post("/api/stories/add", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Story Created! ✨");
      resetForm();
      fetchStories();
    } catch (err) {
      alert(
        "Error creating story: " + (err.response?.data?.message || err.message),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStory = async (e) => {
    e.preventDefault();
    if (!editingStory) return;

    setLoading(true);
    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    if (formData.image) {
      data.append("image", formData.image);
    }

    try {
      const token = localStorage.getItem("adminToken");
      await instance.put(`/api/stories/update/${editingStory._id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Story Updated! ✨");
      resetForm();
      fetchStories();
    } catch (err) {
      alert(
        "Error updating story: " + (err.response?.data?.message || err.message),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStory = async (storyId) => {
    if (!confirm("Are you sure you want to delete this story?")) return;

    try {
      const token = localStorage.getItem("adminToken");
      await instance.delete(`/api/stories/delete/${storyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Story Deleted! 🗑️");
      fetchStories();
    } catch (err) {
      alert(
        "Error deleting story: " + (err.response?.data?.message || err.message),
      );
    }
  };

  const handleToggleStatus = async (story) => {
    try {
      const token = localStorage.getItem("adminToken");
      await instance.put(
        `/api/stories/update/${story._id}`,
        {
          title: story.title,
          description: story.description,
          status: !story.status,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchStories();
    } catch (err) {
      alert(
        "Error updating status: " +
          (err.response?.data?.message || err.message),
      );
    }
  };

  const startEditing = (story) => {
    setEditingStory(story);
    setFormData({
      title: story.title,
      description: story.description || "",
      image: null,
    });
    const imageUrl = story.image ? getImageUrl(story.image) : "";
    setImagePreview(imageUrl);
  };

  const resetForm = () => {
    setFormData({ title: "", description: "", image: null });
    setImagePreview(null);
    setEditingStory(null);
  };

  return (
    <div className="p-6 md:p-10 bg-[#F9FAFB] min-h-screen font-sans">
      <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-800 mb-8 flex items-center gap-3">
        <BookOpen className="text-blue-600" size={32} /> Story{" "}
        <span className="text-blue-600">Management</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-7">
          <form
            onSubmit={editingStory ? handleUpdateStory : handleAddStory}
            className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 space-y-6"
          >
            {editingStory && (
              <div className="flex items-center justify-between bg-blue-50 p-4 rounded-2xl">
                <span className="text-blue-600 font-bold text-sm">
                  Editing: {editingStory.title}
                </span>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-slate-500 hover:text-red-500 p-1 rounded-lg transition-all"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            <div className="space-y-4">
              {/* Title Input */}
              <input
                required
                placeholder="Story Title"
                className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-bold ring-1 ring-slate-100"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />

              {/* Description Input */}
              <textarea
                placeholder="Story Description"
                className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-medium ring-1 ring-slate-100 resize-none min-h-[120px]"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
              />
            </div>

            {/* Image Upload */}
            <label className="border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer overflow-hidden bg-slate-50 h-[250px]">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  className="w-full h-full object-cover"
                  alt="Preview"
                />
              ) : (
                <>
                  <Upload className="text-slate-300" size={32} />
                  <span className="text-[10px] font-black uppercase text-slate-400 mt-2">
                    Upload Story Image
                  </span>
                  <span className="text-xs text-slate-400 mt-1">
                    Recommended: 400x600 (Portrait)
                  </span>
                </>
              )}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    setFormData({ ...formData, image: e.target.files[0] });
                    setImagePreview(URL.createObjectURL(e.target.files[0]));
                  }
                }}
              />
            </label>

            <button
              disabled={loading}
              className={`w-full text-white p-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all ${editingStory ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-900 hover:bg-blue-600"}`}
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  {editingStory ? (
                    <>
                      <Pencil size={18} /> Update Story
                    </>
                  ) : (
                    <>
                      <Plus size={18} /> Create Story
                    </>
                  )}
                </>
              )}
            </button>
          </form>
        </div>

        {/* List Section */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="font-black uppercase text-xs text-slate-400 tracking-widest ml-4">
            All Stories ({stories.length})
          </h3>
          {stories.map((story) => (
            <div
              key={story._id}
              className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 flex gap-4 group"
            >
              <div className="relative">
                <img
                  src={story.image ? getImageUrl(story.image) : ""}
                  className="w-20 h-28 rounded-2xl object-cover bg-slate-100"
                  alt={story.title}
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/80x112?text=Story";
                  }}
                />
                {!story.status && (
                  <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                    <span className="text-white text-xs font-bold rotate-[-15deg]">
                      Inactive
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-800 line-clamp-1">
                  {story.title}
                </h4>
                {story.description && (
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                    {story.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => startEditing(story)}
                    className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-lg transition-all"
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteStory(story._id)}
                    className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={() => handleToggleStatus(story)}
                    className={`text-xs px-2 py-1 rounded-lg transition-all ${story.status ? "text-amber-500 hover:bg-amber-50" : "text-green-500 hover:bg-green-50"}`}
                    title={story.status ? "Deactivate" : "Activate"}
                  >
                    {story.status ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            </div>
          ))}
          {stories.length === 0 && (
            <div className="text-center py-10 text-slate-400">
              <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
              <p>No stories created yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Story;
