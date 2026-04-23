import React, { useState, useEffect } from 'react';
import instance, { getImageUrl } from '../../web/api/AxiosConfig';
import { Search, Download, Edit, Trash2, Tag, X, AlertTriangle, ImageIcon } from 'lucide-react';
import { CSVLink } from "react-csv";

const Brandlist = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // ✅ Modal States
  const [modalType, setModalType] = useState(null); // 'status', 'edit', 'delete'
  const [selectedBrand, setSelectedBrand] = useState(null);
  
  // ✅ Edit Form States
  const [editName, setEditName] = useState("");
  const [editFile, setEditFile] = useState(null);
  const [editPreview, setEditPreview] = useState(null);

  const getAuthHeader = (isMultipart = false) => {
    const token = localStorage.getItem("adminToken");
    return { 
      headers: { 
        Authorization: token ? `Bearer ${token}` : "",
        ...(isMultipart ? { "Content-Type": "multipart/form-data" } : {})
      } 
    };
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await instance.get("/api/brands", getAuthHeader());
      setBrands(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Fetch Error:", error);
      setLoading(false);
    }
  };

  // ✅ Open Modals
  const handleAction = (type, brand) => {
    setSelectedBrand(brand);
    setModalType(type);
    if (type === 'edit') {
      setEditName(brand.name);
      setEditPreview(getImageUrl(brand.logo) || "");
      setEditFile(null);
    }
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedBrand(null);
  };

  // ✅ 1. Toggle Status
  const confirmToggleStatus = async () => {
    try {
      const newStatus = !selectedBrand.status;
      await instance.put(`/api/brands/${selectedBrand._id}`, { status: newStatus }, getAuthHeader());
      fetchBrands();
      closeModal();
    } catch (error) {
      alert("Status update failed! ❌");
    }
  };

  // ✅ 2. Delete Brand
  const confirmDelete = async () => {
    try {
      await instance.delete(`/api/brands/${selectedBrand._id}`, getAuthHeader());
      fetchBrands();
      closeModal();
    } catch (error) {
      alert("Delete failed! ❌");
    }
  };

  // ✅ 3. Update Brand (Edit)
  const handleUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', editName);
    if (editFile) formData.append('logo', editFile);

    try {
      await instance.put(`/api/brands/${selectedBrand._id}`, formData, getAuthHeader(true));
      fetchBrands();
      closeModal();
      alert("Brand Updated! ✅");
    } catch (error) {
      alert("Update failed! ❌");
    }
  };

  const filteredBrands = brands.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-4 md:p-6 bg-[#f8fafc] min-h-screen font-sans text-slate-700 relative">
      {/* Header & Table same as before... */}
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-[#f59e0b] p-1.5 rounded shadow-sm text-white"><Tag size={18} /></div>
        <h1 className="text-xl font-bold text-slate-800">Brand List</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 flex justify-between items-center border-b border-slate-100">
           <div className="flex gap-2">
              <input type="text" placeholder="Search..." className="border p-2 rounded-lg text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
           </div>
           <CSVLink data={filteredBrands} className="flex items-center gap-2 text-blue-600 font-bold text-sm"><Download size={16}/> Export</CSVLink>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f1f5f9] font-bold uppercase text-[11px] border-b">
              <tr>
                <th className="px-6 py-4">SL</th>
                <th className="px-6 py-4 text-center">Logo</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBrands.map((brand, index) => (
                <tr key={brand._id} className="border-b hover:bg-slate-50">
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4 flex justify-center"><img src={getImageUrl(brand.logo)} className="w-12 h-12 object-contain" alt="" /></td>
                  <td className="px-6 py-4 font-medium">{brand.name}</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => handleAction('status', brand)} className={`h-6 w-11 rounded-full relative ${brand.status ? 'bg-blue-600' : 'bg-slate-300'}`}>
                      <span className={`h-4 w-4 bg-white rounded-full absolute top-1 transition-all ${brand.status ? 'right-1' : 'left-1'}`} />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center space-x-2">
                    <button onClick={() => handleAction('edit', brand)} className="p-1 text-blue-500 border rounded"><Edit size={16}/></button>
                    <button onClick={() => handleAction('delete', brand)} className="p-1 text-red-500 border rounded"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ ALL MODALS WRAPPER */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden p-6 animate-in zoom-in duration-200">
            
            {/* 1. Status Modal */}
            {modalType === 'status' && (
              <div className="text-center">
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-blue-100">
                  <Tag className="text-blue-500" size={30} />
                </div>
                <h3 className="text-lg font-bold mb-2">Change {selectedBrand?.name} Status?</h3>
                <p className="text-slate-500 text-sm mb-6">This will hide/show the brand on the website.</p>
                <div className="flex gap-3">
                  <button onClick={confirmToggleStatus} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold">Ok</button>
                  <button onClick={closeModal} className="flex-1 bg-slate-100 py-2 rounded-lg font-bold">Cancel</button>
                </div>
              </div>
            )}

            {/* 2. Delete Modal */}
            {modalType === 'delete' && (
              <div className="text-center">
                <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-100 text-red-500">
                  <AlertTriangle size={30} />
                </div>
                <h3 className="text-lg font-bold mb-2 text-red-600">Delete {selectedBrand?.name}?</h3>
                <p className="text-slate-500 text-sm mb-6">Are you sure? This action cannot be undone.</p>
                <div className="flex gap-3">
                  <button onClick={confirmDelete} className="flex-1 bg-red-600 text-white py-2 rounded-lg font-bold">Yes, Delete</button>
                  <button onClick={closeModal} className="flex-1 bg-slate-100 py-2 rounded-lg font-bold">Cancel</button>
                </div>
              </div>
            )}

            {/* 3. Edit Modal */}
            {modalType === 'edit' && (
              <div>
                <div className="flex justify-between items-center mb-6 border-b pb-2">
                  <h3 className="font-bold text-lg text-slate-800">Edit Brand</h3>
                  <X className="cursor-pointer text-slate-400" onClick={closeModal} />
                </div>
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold mb-1">Brand Name</label>
                    <input type="text" className="w-full border p-2 rounded-lg" value={editName} onChange={(e) => setEditName(e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Brand Logo</label>
                    <div className="border-2 border-dashed p-4 rounded-xl text-center bg-slate-50">
                      {editPreview ? (
                        <img src={editPreview} className="h-24 mx-auto object-contain mb-2" alt="preview" />
                      ) : (
                        <ImageIcon className="mx-auto text-slate-300 mb-2" size={40} />
                      )}
                      <label className="text-blue-600 cursor-pointer text-xs font-bold block">
                        Change Logo
                        <input type="file" className="hidden" onChange={(e) => {
                          const file = e.target.files[0];
                          if(file) {
                            setEditFile(file);
                            setEditPreview(URL.createObjectURL(file));
                          }
                        }} />
                      </label>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold mt-4">Save Changes</button>
                </form>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default Brandlist;