import React, { useState, useEffect } from 'react';
import instance from '../../web/api/AxiosConfig';
import { Search, Download, Edit, Trash2, Layers, RotateCcw, Send, X, AlertTriangle } from 'lucide-react';
import { CSVLink } from "react-csv";

const SubCategory = () => {
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // ✅ Modal States
  const [modalType, setModalType] = useState(null); // 'edit' or 'delete'
  const [selectedItem, setSelectedItem] = useState(null);

  const initialFormState = { name: '', mainCategory: '', priority: 0 };
  const [formData, setFormData] = useState(initialFormState);

  const getAuthHeader = () => {
    const token = localStorage.getItem("adminToken");
    return { headers: { Authorization: token ? `Bearer ${token}` : "" } };
  };

  useEffect(() => { 
    fetchSubCategories(); 
    fetchDependencies(); 
  }, []);

  const fetchDependencies = async () => {
    try {
      const res = await instance.get("/api/categories", getAuthHeader());
      setCategories(res.data.categories || res.data.data || []);
    } catch (err) { console.error(err); }
  };

  const fetchSubCategories = async () => {
    try {
      const res = await instance.get("/api/subcategories", getAuthHeader());
      setSubCategories(res.data.data || []);
      setLoading(false);
    } catch (err) { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await instance.post("/api/subcategories", formData, getAuthHeader());
      alert("Sub Category Added! ✅");
      setFormData(initialFormState);
      fetchSubCategories();
    } catch (err) { alert("Error! ❌"); }
  };

  // ✅ Edit Logic
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await instance.put(`/api/subcategories/${selectedItem._id}`, selectedItem, getAuthHeader());
      setModalType(null);
      fetchSubCategories();
      alert("Updated Successfully! ✅");
    } catch (err) { alert("Update Failed! ❌"); }
  };

  // ✅ Delete Logic
  const confirmDelete = async () => {
    try {
      await instance.delete(`/api/subcategories/${selectedItem._id}`, getAuthHeader());
      setModalType(null);
      fetchSubCategories();
      alert("Deleted! 🗑️");
    } catch (err) { alert("Delete Failed! ❌"); }
  };

  const openModal = (type, item) => {
    setSelectedItem({ ...item, mainCategory: item.mainCategory?._id || "" });
    setModalType(type);
  };

  const filteredSubCats = subCategories.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const csvHeaders = [
    { label: "ID", key: "_id" },
    { label: "Sub Category Name", key: "name" },
    { label: "Main Category", key: "mainCategory.name" },
    { label: "Priority", key: "priority" }
  ];

  return (
    <div className="p-4 md:p-6 bg-[#f8fafc] min-h-screen text-slate-700">
      <h1 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Layers size={20} className="text-blue-600" /> Sub Category Setup
      </h1>

      {/* --- ADD FORM --- */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
        <div className="border-b mb-6 font-bold text-blue-600 border-blue-600 pb-2 inline-block text-sm italic">English(EN)</div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-xs font-bold mb-2 uppercase text-slate-500">Sub Category Name *</label>
            <input type="text" placeholder="New Sub Category" className="w-full border p-2.5 rounded-lg outline-none focus:border-blue-400" 
              value={formData.name} onChange={(e)=>setFormData({...formData, name: e.target.value})} required />
          </div>
          <div>
            <label className="block text-xs font-bold mb-2 uppercase text-slate-500">Main Category</label>
            <select className="w-full border p-2.5 rounded-lg bg-white outline-none focus:border-blue-400" value={formData.mainCategory} onChange={(e)=>setFormData({...formData, mainCategory: e.target.value})}>
              <option value="">Select main category</option>
              {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold mb-2 uppercase text-slate-500">Priority</label>
            <select className="w-full border p-2.5 rounded-lg bg-white outline-none focus:border-blue-400" value={formData.priority} onChange={(e)=>setFormData({...formData, priority: e.target.value})}>
              <option value="0">Set Priority</option>
              {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="flex items-end gap-3">
            <button type="button" onClick={()=>setFormData(initialFormState)} className="px-6 py-2.5 bg-slate-100 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-200"><RotateCcw size={16}/> Reset</button>
            <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold flex items-center gap-2 shadow-lg hover:bg-blue-700"><Send size={16}/> Submit</button>
          </div>
        </form>
      </div>

      {/* --- LIST SECTION --- */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 flex flex-col md:flex-row justify-between items-center bg-slate-50/50 border-b gap-4">
          <h3 className="font-bold">Sub Category List <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-xs ml-1">{filteredSubCats.length}</span></h3>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <input type="text" placeholder="Search by name..." className="w-full border p-2 pl-4 rounded-lg text-sm outline-none focus:border-blue-400" value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} />
            </div>
            <CSVLink data={filteredSubCats} headers={csvHeaders} filename="Sub_Categories.csv" className="border border-blue-200 text-blue-600 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-50 transition-all"><Download size={16}/> Export</CSVLink>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 font-bold text-slate-600 uppercase text-[11px] border-b">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Sub Category Name</th>
                <th className="px-6 py-4">Category Name</th>
                <th className="px-6 py-4 text-center">Priority</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-10 italic">Loading records...</td></tr>
              ) : filteredSubCats.map((sub, idx) => (
                <tr key={sub._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-400">{idx + 1}</td>
                  <td className="px-6 py-4 font-bold text-slate-700">{sub.name}</td>
                  <td className="px-6 py-4"><span className="bg-slate-100 px-2 py-1 rounded text-xs">{sub.mainCategory?.name || "None"}</span></td>
                  <td className="px-6 py-4 text-center">{sub.priority}</td>
                  <td className="px-6 py-4 flex justify-center gap-2">
                    <button onClick={()=>openModal('edit', sub)} className="p-1.5 text-blue-500 border border-blue-100 rounded hover:bg-blue-500 hover:text-white"><Edit size={14}/></button>
                    <button onClick={()=>openModal('delete', sub)} className="p-1.5 text-red-500 border border-red-100 rounded hover:bg-red-500 hover:text-white"><Trash2 size={14}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODALS --- */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in duration-200">
            {modalType === 'delete' ? (
              <div className="text-center">
                <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-100 text-red-500">
                  <AlertTriangle size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Delete {selectedItem?.name}?</h3>
                <p className="text-slate-500 text-sm mb-8">This action cannot be undone. Are you sure?</p>
                <div className="flex gap-4">
                  <button onClick={confirmDelete} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-all">Delete</button>
                  <button onClick={()=>setModalType(null)} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold">Cancel</button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-6 border-b pb-2">
                  <h3 className="font-bold text-lg">Edit Sub Category</h3>
                  <X className="cursor-pointer text-slate-400" onClick={()=>setModalType(null)} />
                </div>
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold mb-1 uppercase text-slate-500">Sub Category Name</label>
                    <input type="text" className="w-full border p-2.5 rounded-lg outline-none focus:border-blue-400" 
                      value={selectedItem?.name} onChange={(e)=>setSelectedItem({...selectedItem, name: e.target.value})} required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1 uppercase text-slate-500">Main Category</label>
                    <select className="w-full border p-2.5 rounded-lg outline-none focus:border-blue-400" 
                      value={selectedItem?.mainCategory} onChange={(e)=>setSelectedItem({...selectedItem, mainCategory: e.target.value})}>
                      <option value="">None</option>
                      {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1 uppercase text-slate-500">Priority</label>
                    <select className="w-full border p-2.5 rounded-lg" value={selectedItem?.priority} onChange={(e)=>setSelectedItem({...selectedItem, priority: e.target.value})}>
                      {[...Array(11).keys()].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all mt-4">Save Changes</button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubCategory;