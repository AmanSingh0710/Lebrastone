import React, { useState } from 'react';
import { Image as ImageIcon, RotateCcw, Send } from 'lucide-react';
import instance from '../../web/api/AxiosConfig';

const Brand = () => {
  const [brandName, setBrandName] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleReset = () => {
    setBrandName('');
    setLogoFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!brandName || !logoFile) {
      alert("Please enter Brand Name and select a Logo!");
      return;
    }

    const formData = new FormData();
    formData.append('name', brandName);
    formData.append('logo', logoFile);

    try {
      const token = localStorage.getItem('adminToken');
      
      // ✅ API_BASE ka use kiya gaya hai
      const response = await instance.post("/api/brands", formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        alert("Brand Added Successfully! ✅");
        handleReset();
      }
    } catch (error) {
      console.error("Submit Error:", error);
      alert(error.response?.data?.message || "Error saving brand! ❌");
    }
  };

  return (
    <div className="p-2 md:p-6 bg-[#f8fafc] min-h-screen">
      {/* Title Section */}
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-[#754133] p-1.5 rounded shadow-sm">
           <ImageIcon size={18} className="text-white" />
        </div>
        <h1 className="text-xl font-bold text-slate-800">Brand Setup</h1>
        {/* Debug Label: Aapko batayega abhi kaunsa backend use ho raha hai */}
    
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6">
          <div className="border-b border-slate-200 mb-8">
            <button className="text-blue-600 font-bold border-b-2 border-blue-600 pb-2 px-4 text-sm">
              English(EN)
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col lg:flex-row gap-10">
              <div className="flex-1 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Brand Name <span className="text-red-500">*</span> (EN)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex : LUX"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Brand Logo <span className="text-red-500">*</span> 
                    <span className="ml-2 text-cyan-500 font-normal italic text-xs">Ratio 1:1 (500x500px)</span>
                  </label>
                  <div className="flex items-stretch border border-slate-300 rounded-lg overflow-hidden group">
                    <div className="flex-1 flex items-center px-4 text-slate-400 text-sm italic">
                      {logoFile ? logoFile.name : 'Choose File'}
                    </div>
                    <label className="bg-slate-50 border-l border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-100">
                      Browse
                      <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                    </label>
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-[350px] flex justify-center lg:justify-start items-center">
                <div className="w-64 h-64 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center bg-slate-50 overflow-hidden relative">
                  {imagePreview ? (
                    <img src={imagePreview} alt="preview" className="w-full h-full object-contain p-2" />
                  ) : (
                    <div className="text-center">
                      <ImageIcon size={80} className="text-slate-200 mx-auto mb-2" />
                      <p className="text-slate-300 text-xs">Logo Preview</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-10">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-2 px-8 py-2.5 bg-slate-100 text-slate-600 rounded-lg font-bold hover:bg-slate-200"
              >
                <RotateCcw size={18} /> Reset
              </button>
              <button 
                type="submit"
                className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg"
              >
                <Send size={18} /> Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Brand;