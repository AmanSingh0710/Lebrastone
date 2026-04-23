import React, { useState, useEffect } from 'react';
import instance from '../../web/api/AxiosConfig';
import { Search, Download, Edit, Trash2, Layers, RotateCcw, Send, X, AlertTriangle } from 'lucide-react';
import { CSVLink } from "react-csv";

const SubSubCategory = () => {
  const [list, setList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [filteredSubs, setFilteredSubs] = useState([]); // Add form ke liye
  const [editFilteredSubs, setEditFilteredSubs] = useState([]); // Edit modal ke liye
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [modalType, setModalType] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const initialForm = { name: '', mainCategory: '', subCategory: '', priority: 0 };
  const [formData, setFormData] = useState(initialForm);

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` }
  });

  useEffect(() => {
    fetchData();
    fetchDependencies();
  }, []);

  const fetchDependencies = async () => {
    try {
      const [catRes, subRes] = await Promise.all([
        instance.get("/api/categories", getAuthHeader()),
        instance.get("/api/subcategories", getAuthHeader())
      ]);
      setCategories(catRes.data.categories || catRes.data.data || []);
      setSubCategories(subRes.data.data || []);
    } catch (err) { console.error("Error loading categories/subs:", err); }
  };

  const fetchData = async () => {
    try {
      const res = await instance.get("/api/subsubcategories", getAuthHeader());
      setList(res.data.data || []);
      setLoading(false);
    } catch (err) { setLoading(false); }
  };

  // ✅ Search Filter Variable (ERROR FIX)
  const filteredList = list.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMainCategoryChange = (catId) => {
    setFormData({ ...formData, mainCategory: catId, subCategory: '' });
    const relatedSubs = subCategories.filter(sub => (sub.mainCategory?._id || sub.mainCategory) === catId);
    setFilteredSubs(relatedSubs);
  };

  const handleEditMainCategoryChange = (catId) => {
    setSelectedItem({ ...selectedItem, mainCategory: catId, subCategory: '' });
    const relatedSubs = subCategories.filter(sub => (sub.mainCategory?._id || sub.mainCategory) === catId);
    setEditFilteredSubs(relatedSubs);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await instance.post("/api/subsubcategories", formData, getAuthHeader());
      alert("Added Successfully! ✅");
      setFormData(initialForm);
      setFilteredSubs([]);
      fetchData();
    } catch (err) { alert("Error! ❌ Check backend logs."); }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await instance.put(`/api/subsubcategories/${selectedItem._id}`, selectedItem, getAuthHeader());
      alert("Updated Successfully! ✅");
      setModalType(null);
      fetchData();
    } catch (err) { alert("Update failed! ❌"); }
  };

  const confirmDelete = async () => {
    try {
      await instance.delete(`/api/subsubcategories/${selectedItem._id}`, getAuthHeader());
      setModalType(null);
      fetchData();
    } catch (err) { alert("Delete failed"); }
  };

  const openEditModal = (item) => {
    const mainCatId = item.mainCategory?._id || item.mainCategory;
    setSelectedItem({
      ...item,
      mainCategory: mainCatId,
      subCategory: item.subCategory?._id || item.subCategory
    });
    const relatedSubs = subCategories.filter(sub => (sub.mainCategory?._id || sub.mainCategory) === mainCatId);
    setEditFilteredSubs(relatedSubs);
    setModalType('edit');
  };

  return (
    <div className="p-4 md:p-6 bg-[#f8fafc] min-h-screen text-slate-700">
      <h1 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Layers size={20} className="text-blue-600" /> Sub Sub Category Setup
      </h1>

      {/* --- ADD FORM --- */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
        <div className="border-b mb-6 font-bold text-blue-600 border-blue-600 pb-2 inline-block text-sm italic">English(EN)</div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
             <label className="text-xs font-bold uppercase text-slate-500 italic">Sub Sub Category Name *</label>
             <input type="text" placeholder="New Sub Sub Category" className="w-full border p-2.5 rounded-lg outline-none focus:border-blue-400" 
               value={formData.name} onChange={(e)=>setFormData({...formData, name: e.target.value})} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold mb-2 uppercase text-slate-500 italic">Main Category *</label>
              <select className="w-full border p-2.5 rounded-lg bg-white" value={formData.mainCategory} onChange={(e)=>handleMainCategoryChange(e.target.value)} required>
                <option value="">Select main category</option>
                {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-2 uppercase text-slate-500 italic">Sub Category Name *</label>
              <select className="w-full border p-2.5 rounded-lg bg-white" value={formData.subCategory} onChange={(e)=>setFormData({...formData, subCategory: e.target.value})} required disabled={!formData.mainCategory}>
                <option value="">{formData.mainCategory ? "Select sub category" : "Select main category first"}</option>
                {filteredSubs.map(sub => <option key={sub._id} value={sub._id}>{sub.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-2 uppercase text-slate-500 italic">Priority</label>
              <select className="w-full border p-2.5 rounded-lg" value={formData.priority} onChange={(e)=>setFormData({...formData, priority: e.target.value})}>
                <option value="0">Set Priority</option>
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={()=>setFormData(initialForm)} className="px-8 py-2.5 bg-slate-100 rounded-lg font-bold">Reset</button>
            <button type="submit" className="px-8 py-2.5 bg-blue-600 text-white rounded-lg font-bold shadow-lg shadow-blue-100">Submit</button>
          </div>
        </form>
      </div>

      {/* --- LIST SECTION --- */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 flex flex-col md:flex-row justify-between items-center bg-slate-50/50 border-b gap-4">
          <h3 className="font-bold">Sub Sub Category List <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-xs ml-1">{filteredList.length}</span></h3>
          <div className="flex gap-2">
            <div className="relative">
               <input type="text" placeholder="Search..." className="border p-2 rounded-lg text-sm" value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} />
            </div>
            <CSVLink data={filteredList} filename="Sub_Sub_Categories.csv" className="border border-blue-200 text-blue-600 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-50 transition-all"><Download size={16}/> Export</CSVLink>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 font-bold text-slate-600 uppercase text-[11px] border-b">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Sub Sub Category Name</th>
                <th className="px-6 py-4 text-center">Sub Category Name</th>
                <th className="px-6 py-4 text-center">Category Name</th>
                <th className="px-6 py-4 text-center">Priority</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-10 italic">Loading...</td></tr>
              ) : filteredList.map((item, idx) => (
                <tr key={item._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-slate-400">{idx + 1}</td>
                  <td className="px-6 py-4 font-bold text-slate-700">{item.name}</td>
                  <td className="px-6 py-4 text-center">{item.subCategory?.name || "N/A"}</td>
                  <td className="px-6 py-4 text-center">{item.mainCategory?.name || "N/A"}</td>
                  <td className="px-6 py-4 text-center">{item.priority}</td>
                  <td className="px-6 py-4 flex justify-center gap-2">
                    <button onClick={() => openEditModal(item)} className="p-1.5 text-blue-500 border rounded hover:bg-blue-50"><Edit size={14}/></button>
                    <button onClick={() => {setSelectedItem(item); setModalType('delete');}} className="p-1.5 text-red-500 border rounded hover:bg-red-50"><Trash2 size={14}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- EDIT MODAL --- */}
      {modalType === 'edit' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-6 border-b pb-3">
              <h3 className="font-bold text-lg">Update Sub Sub Category</h3>
              <X className="cursor-pointer text-slate-400" onClick={()=>setModalType(null)} />
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1 uppercase text-slate-500">Name</label>
                <input type="text" className="w-full border p-2.5 rounded-lg outline-none" 
                  value={selectedItem?.name} onChange={(e)=>setSelectedItem({...selectedItem, name: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1 uppercase text-slate-500">Main Category</label>
                  <select className="w-full border p-2.5 rounded-lg" 
                    value={selectedItem?.mainCategory} onChange={(e)=>handleEditMainCategoryChange(e.target.value)} required>
                    {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 uppercase text-slate-500">Sub Category</label>
                  <select className="w-full border p-2.5 rounded-lg" 
                    value={selectedItem?.subCategory} onChange={(e)=>setSelectedItem({...selectedItem, subCategory: e.target.value})} required>
                    <option value="">Select sub category</option>
                    {editFilteredSubs.map(sub => <option key={sub._id} value={sub._id}>{sub.name}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold mt-4">Save Changes</button>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE MODAL --- */}
      {modalType === 'delete' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 text-center">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in duration-200">
            <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-red-100 text-red-500">
              <AlertTriangle size={40} />
            </div>
            <h3 className="text-2xl font-bold mb-2">Are you sure?</h3>
            <p className="text-slate-500 mb-8">Want to delete {selectedItem?.name}?</p>
            <div className="flex gap-4">
              <button onClick={confirmDelete} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700">Delete</button>
              <button onClick={()=>setModalType(null)} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubSubCategory;