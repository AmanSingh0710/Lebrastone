import React, { useState, useEffect } from "react";
import instance from "../../web/api/AxiosConfig";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { FileText, Loader2, Save, Trash2, Plus, X, Layers } from "lucide-react";

const defaultPages = [
  "Terms & Conditions",
  "Privacy Policy",
  "Shipping Policy",
  "Refund Policy",
  "Return Policy",
  "Cancellation Policy",
  "About Us",
];

const BusinessPage = () => {
  const [activeTab, setActiveTab] = useState(defaultPages[0]);
  const [allPageNames, setAllPageNames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNewPageModal, setShowNewPageModal] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  const [currentPage, setCurrentPage] = useState(null);
  const [description, setDescription] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Fetch all page names
  const fetchAllPageNames = async () => {
    try {
      const response = await instance.get("/api/pages/names");
      if (response.data.success) {
        const names = response.data.data || [];
        setAllPageNames(names);
        
        // Merge with default pages
        const merged = [...new Set([...defaultPages, ...names])];
        
        // Set first tab if current doesn't exist
        if (!merged.includes(activeTab) && merged.length > 0) {
          setActiveTab(merged[0]);
        }
        
        // Return the merged array for use in other functions
        return merged;
      }
      return [];
    } catch (err) {
      console.error("Error fetching page names:", err);
      return [];
    }
  };

  // Fetch page data for active tab
  const fetchPage = async (pageName) => {
    try {
      const response = await instance.get(`/api/pages/${encodeURIComponent(pageName)}`);
      if (response.data.success && response.data.data) {
        setCurrentPage(response.data.data);
        setDescription(response.data.data.description || "");
      } else {
        setCurrentPage(null);
        setDescription("");
      }
    } catch (err) {
      console.error("Error fetching page:", err);
      setCurrentPage(null);
      setDescription("");
    }
  };

  // Initial load
  useEffect(() => {
    fetchAllPageNames();
  }, []);

  // Load page when tab changes
  useEffect(() => {
    if (activeTab) {
      fetchPage(activeTab);
      setIsEditing(false);
    }
  }, [activeTab]);

  const handleEditorChange = (value) => {
    setDescription(value);
  };

  const handleSave = async () => {
    if (!description.trim()) {
      alert("Please add some content for the page");
      return;
    }

    setLoading(true);

    const data = {
      pageName: activeTab,
      description: description,
    };

    try {
      const token = localStorage.getItem("adminToken");

      await instance.post("/api/pages/add", data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert(`${activeTab} saved successfully ✅`);
      
      // Refresh page data and tab list
      await fetchPage(activeTab);
      await fetchAllPageNames();
      setIsEditing(false);
    } catch (err) {
      alert("Error saving page: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${activeTab}"?`)) return;

    try {
      const token = localStorage.getItem("adminToken");

      await instance.delete(`/api/pages/${encodeURIComponent(activeTab)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Page deleted successfully ✅");
      
      // Refresh the tab list and switch to another tab
      const allTabs = await fetchAllPageNames();
      const remaining = allTabs.filter(p => p !== activeTab);
      if (remaining.length > 0) {
        setActiveTab(remaining[0]);
      } else {
        setActiveTab(defaultPages[0]);
        setDescription("");
        setCurrentPage(null);
      }
    } catch (err) {
      alert("Error deleting page: " + (err.response?.data?.message || err.message));
    }
  };

  const handleAddNewPage = () => {
    if (!newPageName.trim()) {
      alert("Please enter a page name");
      return;
    }
    
    const normalizedName = newPageName.trim();
    const allTabs = [...new Set([...defaultPages, ...allPageNames])];
    
    if (allTabs.includes(normalizedName)) {
      alert("This page already exists. Please select it from the tabs.");
      setShowNewPageModal(false);
      setNewPageName("");
      return;
    }
    
    setActiveTab(normalizedName);
    setDescription("");
    setCurrentPage(null);
    setShowNewPageModal(false);
    setNewPageName("");
    setIsEditing(true);
  };

  const allTabs = [...new Set([...defaultPages, ...allPageNames])];

  return (
    <div className="p-6 md:p-10 bg-[#F9FAFB] min-h-screen font-sans">

      {/* Header */}
      <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-800 mb-8 flex items-center gap-3">
        <FileText className="text-blue-600" size={32} />
        Pages <span className="text-blue-600">Management</span>
      </h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b mb-8 items-center">
        {allTabs.map((page) => (
          <button
            key={page}
            onClick={() => setActiveTab(page)}
            className={`pb-2 px-3 text-sm font-bold transition ${
              activeTab === page
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-slate-500 hover:text-blue-600"
            }`}
          >
            {page}
          </button>
        ))}
        
        {/* Add New Page Button */}
        <button
          onClick={() => setShowNewPageModal(true)}
          className="pb-2 px-3 text-sm font-bold text-green-600 hover:text-green-700 flex items-center gap-1"
        >
          <Plus size={16} /> Add Page
        </button>
      </div>

      {/* Editor Card */}
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 space-y-6 max-w-5xl">

        <div className="flex items-center justify-between">
          <h2 className="font-black text-slate-800">{activeTab}</h2>
          
          {/* Action buttons */}
          <div className="flex gap-2">
            {currentPage && (
              <button
                onClick={handleDelete}
                className="bg-red-100 text-red-600 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-red-200 transition"
              >
                <Trash2 size={16} /> Delete
              </button>
            )}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-slate-200 transition"
            >
              {isEditing ? <X size={16} /> : <Plus size={16} />}
              {isEditing ? "Cancel" : "Edit"}
            </button>
          </div>
        </div>

        {/* Rich Editor */}
        <div className="bg-white rounded-2xl overflow-hidden ring-1 ring-slate-100">
          <ReactQuill
            theme="snow"
            value={description}
            onChange={handleEditorChange}
            placeholder={`Write ${activeTab} content here...`}
            className="h-72 mb-12"
            readOnly={!isEditing}
          />
        </div>

        {/* Save Button */}
        {isEditing && (
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 transition-all"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <Save size={18} /> {currentPage ? "Update Page" : "Save Page"}
              </>
            )}
          </button>
        )}

        {/* Page Info */}
        {currentPage && !isEditing && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-green-700 font-bold text-sm">
              ✓ This page is saved and active
            </p>
            <p className="text-green-600 text-xs mt-1">
              Last updated: {new Date(currentPage.updatedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        )}
      </div>

      {/* New Page Modal */}
      {showNewPageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full mx-4">
            <h3 className="font-black text-xl mb-4 flex items-center gap-2">
              <Layers className="text-blue-600" /> Create New Page
            </h3>
            
            <input
              type="text"
              value={newPageName}
              onChange={(e) => setNewPageName(e.target.value)}
              placeholder="Enter page name (e.g., Contact Us)"
              className="w-full p-3 border border-slate-300 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleAddNewPage()}
            />
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowNewPageModal(false);
                  setNewPageName("");
                }}
                className="flex-1 bg-slate-200 text-slate-700 p-3 rounded-xl font-bold hover:bg-slate-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNewPage}
                className="flex-1 bg-blue-600 text-white p-3 rounded-xl font-bold hover:bg-blue-700 transition"
              >
                Create Page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessPage;
