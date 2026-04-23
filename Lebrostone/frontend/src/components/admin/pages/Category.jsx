import React, { useState, useEffect } from "react";
import instance from "../../web/api/AxiosConfig";
import { useNavigate } from "react-router-dom";
import { ImageIcon, Send, Search, Edit, Trash2, Download } from 'lucide-react';
import { CSVLink } from "react-csv";

const Category = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [imagePreview, setImagePreview] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const API_BASE = "https://lebrostonebackend4.lifeinfotechinstitute.com";
    const initialFormState = {
        name: "",
        image_url: null,
        priority: 0,
        show_in_nav: false,
    };

    const [formData, setFormData] = useState(initialFormState);

    const csvHeaders = [
        { label: "ID", key: "_id" },
        { label: "Name", key: "name" },
        { label: "Priority", key: "priority" },
        { label: "Navbar Status", key: "show_in_nav" }
    ];

    // Auth Header Helper
    const getAuthHeader = (isMultipart = false) => {
        const token = localStorage.getItem("adminToken");
        return {
            headers: {
                Authorization: token ? `Bearer ${token}` : "",
                "Content-Type": isMultipart ? "multipart/form-data" : "application/json",
            },
        };
    };

    useEffect(() => {
        fetchCategories();
    }, [searchTerm]);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            // Note: Humne axios.defaults set kiya hai isliye pura URL dene ki zarurat nahi
            const response = await instance.get(`/api/categories?search=${searchTerm}`, getAuthHeader());
            const resData = response.data.data || response.data || [];
            
            const sortedData = Array.isArray(resData) 
                ? resData.sort((a, b) => a.priority - b.priority) 
                : [];
                
            setCategories(sortedData);
        } catch (error) {
            console.error("Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === "file") {
            const file = files[0];
            if (file) {
                setFormData(prev => ({ ...prev, [name]: file }));
                setImagePreview(URL.createObjectURL(file));
            }
        } else {
            setFormData(prev => ({ 
                ...prev, 
                [name]: name === "priority" ? parseInt(value) : value 
            }));
        }
    };

    const handleReset = () => {
        setFormData(initialFormState);
        setImagePreview(null);
        setIsEditMode(false);
        setSelectedId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name) return alert("Name is required");

        const data = new FormData();
        data.append("name", formData.name.trim());
        data.append("priority", formData.priority);
        // Boolean ko string mein convert karke bhej rahe hain (Multer friendly)
        data.append("show_in_nav", String(formData.show_in_nav));
        
        if (formData.image_url instanceof File) {
            data.append("image_url", formData.image_url);
        }

        try {
            if (isEditMode) {
                await instance.put(`/api/categories/${selectedId}`, data, getAuthHeader(true));
                alert("Updated Successfully! ✅");
            } else {
                await instance.post(`/api/categories`, data, getAuthHeader(true));
                alert("Created Successfully! ✅");
            }
            handleReset();
            fetchCategories();
        } catch (error) {
            console.error("Submit Error:", error);
            alert(error.response?.data?.message || "Operation failed ❌");
        }
    };

    const handleDelete = async (id) => {
        if(window.confirm("Delete this category?")) {
            try {
                await instance.delete(`/api/categories/${id}`, getAuthHeader());
                fetchCategories();
            } catch (error) {
                alert("Delete failed!");
            }
        }
    };

    return (
        <div className="p-4 md:p-6 bg-[#f8fafc] min-h-screen">
            {/* Form Section */}
            <div className="mb-8">
                <h1 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <span className="bg-[#754133] p-1.5 rounded text-white"><ImageIcon size={18} /></span>
                    Category Setup
                </h1>

                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-10">
                        <div className="flex-1 space-y-5">
                            <div>
                                <label className="block text-sm font-medium mb-2">Category Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full border rounded-lg px-4 py-2.5 outline-none focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Priority</label>
                                <select 
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleInputChange}
                                    className="w-full border rounded-lg px-4 py-2.5 bg-white"
                                >
                                    {[...Array(11).keys()].map(p => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Category Logo *</label>
                                <input 
                                    type="file" 
                                    name="image_url" 
                                    onChange={handleInputChange} 
                                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    accept="image/*" 
                                />
                            </div>
                        </div>

                        <div className="w-full lg:w-[300px] flex justify-center">
                            <div className="w-56 h-56 border-2 border-dashed rounded-xl flex items-center justify-center bg-slate-50 overflow-hidden">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="preview" className="w-full h-full object-contain p-2" />
                                ) : (
                                    <ImageIcon size={60} className="text-slate-200" />
                                )}
                            </div>
                        </div>
                    </form>

                    <div className="flex justify-end gap-3 mt-8">
                        <button type="button" onClick={handleReset} className="px-8 py-2.5 bg-slate-100 rounded-lg hover:bg-slate-200 font-bold">Reset</button>
                        <button onClick={handleSubmit} className="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-md">
                            {isEditMode ? "Update" : "Submit"}
                        </button>
                    </div>
                </div>
            </div>

            {/* List Section */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
                    <h3 className="font-bold">Category List <span className="ml-2 bg-blue-100 px-2 py-0.5 rounded text-blue-600 text-xs">{categories.length}</span></h3>
                    
                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:border-blue-500 outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                        </div>
                        
                        <CSVLink 
                            data={categories} 
                            headers={csvHeaders} 
                            filename={"categories.csv"}
                            className="flex items-center gap-2 border bg-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-50"
                        >
                            <Download size={16} /> Export
                        </CSVLink>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b">
                            <tr>
                                <th className="px-6 py-4">#</th>
                                <th className="px-6 py-4">Image</th>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4 text-center">Priority</th>
                                <th className="px-6 py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-10">Loading...</td></tr>
                            ) : categories.map((cat, index) => (
                                <tr key={cat._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">{index + 1}</td>
                                    <td className="px-6 py-4">
                                        <img 
                                            // Ensure URL is correctly formed
                                            src={cat.image_url.startsWith('http') 
    ? cat.image_url 
    : `${API_BASE}${cat.image_url.startsWith('/') ? '' : '/'}${cat.image_url}`}
                                            alt={cat.name} 
                                            className="w-12 h-12 rounded-lg object-cover border" 
                                            onError={(e) => e.target.src = "https://via.placeholder.com/50"}
                                        />
                                    </td>
                                    <td className="px-6 py-4 font-medium">
                                        <button 
                                            onClick={() => window.open(`/shop/category/${cat._id}`, '_blank')}
                                            className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                                        >
                                            {cat.name}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold">{cat.priority}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center gap-3">
                                            <button 
                                                onClick={() => {
                                                    setFormData({
                                                        name: cat.name,
                                                        priority: cat.priority,
                                                        show_in_nav: cat.show_in_nav,
                                                        image_url: cat.image_url
                                                    });
                                                    setSelectedId(cat._id);
                                                    setIsEditMode(true);
                                                    setImagePreview(cat.image_url.startsWith('http') ? cat.image_url : `${API_BASE}${cat.image_url}`);
                                                }}
                                                className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(cat._id)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Category;