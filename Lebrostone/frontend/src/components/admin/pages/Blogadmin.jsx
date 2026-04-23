import React, { useState, useEffect } from 'react';
import instance, { getImageUrl } from '../../web/api/AxiosConfig';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Upload, Plus, Loader2, BookOpen, Trash2, Pencil, X } from 'lucide-react';

const Blogadmin= () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [editingBlog, setEditingBlog] = useState(null);
    const [formData, setFormData] = useState({ 
        title: '', 
        shortDescription: '', 
        longDescription: '', 
        image: null 
    });

    useEffect(() => { fetchBlogs(); }, []);

    const fetchBlogs = async () => {
        const res = await instance.get("/api/blogs/all");
        setBlogs(res.data);
    };

    const handleAddBlog = async (e) => {
        e.preventDefault();
        setLoading(true);
        const data = new FormData();
        data.append('title', formData.title);
        data.append('shortDescription', formData.shortDescription);
        data.append('longDescription', formData.longDescription);
        data.append('image', formData.image);

        try {
            const token = localStorage.getItem('adminToken');
            await instance.post("/api/blogs/add", data, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            alert("Blog Published! 🚀");
            resetForm();
            fetchBlogs();
        } catch (err) { alert("Error adding blog"); }
        finally { setLoading(false); }
    };

    const handleUpdateBlog = async (e) => {
        e.preventDefault();
        if (!editingBlog) return;
        
        setLoading(true);
        const data = new FormData();
        data.append('title', formData.title);
        data.append('shortDescription', formData.shortDescription);
        data.append('longDescription', formData.longDescription);
        if (formData.image) {
            data.append('image', formData.image);
        }

        try {
            const token = localStorage.getItem('adminToken');
            await instance.put(`/api/blogs/update/${editingBlog._id}`, data, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            alert("Blog Updated! ✍️");
            resetForm();
            fetchBlogs();
        } catch (err) { alert("Error updating blog"); }
        finally { setLoading(false); }
    };

    const handleDeleteBlog = async (blogId) => {
        if (!confirm("Are you sure you want to delete this blog?")) return;
        
        try {
            const token = localStorage.getItem('adminToken');
            await instance.delete(`/api/blogs/delete/${blogId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Blog Deleted! 🗑️");
            fetchBlogs();
        } catch (err) { alert("Error deleting blog"); }
    };

    const startEditing = (blog) => {
        setEditingBlog(blog);
        setFormData({
            title: blog.title,
            shortDescription: blog.shortDescription,
            longDescription: blog.longDescription,
            image: null
        });
        // Handle image path - ensure it works with both /uploads/... and uploads/... formats
        const imageUrl = blog.image ? getImageUrl(blog.image) : '';
        setImagePreview(imageUrl);
    };

    const resetForm = () => {
        setFormData({ title: '', shortDescription: '', longDescription: '', image: null });
        setImagePreview(null);
        setEditingBlog(null);
    };

    return (
        <div className="p-6 md:p-10 bg-[#F9FAFB] min-h-screen font-sans">
            <h1 className="text-3xl font-black uppercase  tracking-tighter text-slate-800 mb-8 flex items-center gap-3">
                <BookOpen className="text-blue-600" size={32} /> Blog <span className="text-blue-600">Management</span>
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-7">
                    <form onSubmit={editingBlog ? handleUpdateBlog : handleAddBlog} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 space-y-6">
                        {editingBlog && (
                            <div className="flex items-center justify-between bg-blue-50 p-4 rounded-2xl">
                                <span className="text-blue-600 font-bold text-sm">Editing: {editingBlog.title}</span>
                                <button type="button" onClick={resetForm} className="text-slate-500 hover:text-red-500 p-1 rounded-lg transition-all">
                                    <X size={18} />
                                </button>
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <input required placeholder="Blog Title" className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-bold ring-1 ring-slate-100" 
                                value={formData.title} onChange={(e)=>setFormData({...formData, title:e.target.value})} />
                                
                                <textarea required placeholder="Short Description (for card)" className="w-full bg-slate-50 p-4 rounded-2xl h-24 outline-none resize-none ring-1 ring-slate-100" 
                                value={formData.shortDescription} onChange={(e)=>setFormData({...formData, shortDescription:e.target.value})} />
                            </div>
                            
                            <label className="border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer overflow-hidden bg-slate-50 h-full min-h-[200px]">
                                {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" /> : <><Upload className="text-slate-300" /> <span className="text-[10px] font-black uppercase text-slate-400 mt-2">Upload Blog Image</span></>}
                                <input type="file" hidden onChange={(e)=>{setFormData({...formData, image:e.target.files[0]}); setImagePreview(URL.createObjectURL(e.target.files[0]))}} />
                            </label>
                        </div>

                        {/* Rich Text Editor */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Description (EN)</label>
                            <div className="bg-white rounded-2xl overflow-hidden ring-1 ring-slate-100">
                                <ReactQuill 
                                    theme="snow" 
                                    value={formData.longDescription} 
                                    onChange={(content) => setFormData({...formData, longDescription: content})}
                                    placeholder="Write your blog content here..."
                                    className="h-64 mb-12"
                                />
                            </div>
                        </div>

                        <button disabled={loading} className={`w-full text-white p-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all ${editingBlog ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-900 hover:bg-blue-600'}`}>
                            {loading ? <Loader2 className="animate-spin" /> : <>{editingBlog ? <><Pencil size={18} /> Update Blog</> : <><Plus size={18} /> Publish Blog</>}</>}
                        </button>
                    </form>
                </div>

                {/* List Section */}
                <div className="lg:col-span-5 space-y-4">
                    <h3 className="font-black uppercase text-xs text-slate-400 tracking-widest ml-4">Recent Blogs</h3>
                    {blogs.map(blog => (
                        <div key={blog._id} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 flex gap-4 group">
                            <img 
                                src={blog.image ? getImageUrl(blog.image) : ''} 
                                className="w-24 h-24 rounded-2xl object-cover bg-slate-100" 
                                alt={blog.title}
                                onError={(e) => { e.target.src = ''; e.target.classList.add('bg-slate-200'); }}
                            />
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-800 line-clamp-1">{blog.title}</h4>
                                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{blog.shortDescription}</p>
                                <div className="flex gap-2 mt-2">
                                    <button 
                                        onClick={() => startEditing(blog)}
                                        className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteBlog(blog._id)}
                                        className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Blogadmin;