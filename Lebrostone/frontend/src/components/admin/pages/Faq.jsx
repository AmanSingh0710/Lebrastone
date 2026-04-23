import React, { useEffect, useState } from "react";
import instance from "../../web/api/AxiosConfig";
import { MessageSquare, Trash2, Plus, Loader2, HelpCircle, Box, ChevronRight } from "lucide-react";

const Faq = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [faqs, setFaqs] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);

  const getAuthHeader = () => {
    const token = localStorage.getItem('adminToken');
    return { headers: { 'Authorization': token ? `Bearer ${token}` : '' } };
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await instance.get("/api/products");
        setProducts(data.data || data.products || []);
      } catch (err) { console.error("Error products"); }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!selectedProduct) { setFaqs([]); return; }
    const fetchFaqs = async () => {
      setFetchLoading(true);
      try {
        const { data } = await instance.get(`/api/admin/faqs?productId=${selectedProduct}`);
        setFaqs(data.faqs || []);
      } catch (err) { console.error("Error FAQs"); }
      setFetchLoading(false);
    };
    fetchFaqs();
  }, [selectedProduct]);

  const handleAddFaq = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await instance.post("/api/admin/faqs", {
        question, answer, productId: selectedProduct
      }, getAuthHeader());
      if (data.success) {
        setFaqs([data.faq, ...faqs]);
        setQuestion(""); setAnswer("");
        alert("FAQ Added Successfully! ✅");
      }
    } catch (err) { alert("Failed to add FAQ"); }
    setLoading(false);
  };

  const handleDeleteFaq = async (id) => {
    if (window.confirm("Bhai, pakka delete karna hai?")) {
      try {
        await instance.delete(`/api/admin/faqs/${id}`, getAuthHeader());
        setFaqs(faqs.filter(f => f._id !== id));
      } catch (err) { alert("Delete failed"); }
    }
  };

  return (
    <div className="p-6 md:p-10 bg-[#F9FAFB] min-h-screen text-slate-900 font-sans">
      
      {/* Header Section */}
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-slate-800 flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200">
              <HelpCircle size={28} />
            </div>
            FAQ <span className="text-blue-600">Manager</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 ml-1">Update product knowledge base</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Control Panel */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Step 1: Select Product */}
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-4 text-slate-400">
              <Box size={16} />
              <label className="text-[10px] font-black uppercase tracking-widest">Select Product</label>
            </div>
            <select 
              className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-slate-700 appearance-none" 
              value={selectedProduct} 
              onChange={(e) => setSelectedProduct(e.target.value)}
            >
              <option value="">Choose a product...</option>
              {products.map(prod => (
                <option key={prod._id} value={prod._id}>{prod.name}</option>
              ))}
            </select>
          </div>

          {/* Step 2: Form */}
          {selectedProduct ? (
            <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-blue-900/5 border border-slate-200 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center gap-2 mb-6 text-blue-600">
                <Plus size={18} />
                <label className="text-[10px] font-black uppercase tracking-widest">New FAQ Entry</label>
              </div>
              <form onSubmit={handleAddFaq} className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Enter Question" 
                  value={question} 
                  onChange={(e) => setQuestion(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all font-semibold placeholder:text-slate-300" 
                  required 
                />
                <textarea 
                  placeholder="Enter Answer" 
                  value={answer} 
                  onChange={(e) => setAnswer(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl h-40 outline-none focus:border-blue-500 transition-all resize-none font-medium placeholder:text-slate-300" 
                  required 
                />
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full bg-slate-900 hover:bg-blue-600 text-white p-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : "Create FAQ"}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white/50 p-10 rounded-[2rem] border-2 border-dashed border-slate-200 text-center">
              <MessageSquare className="mx-auto text-slate-200 mb-4" size={40} />
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                Pick a product to <br/> manage questions
              </p>
            </div>
          )}
        </div>

        {/* Right Content Table */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-50 bg-white flex justify-between items-center">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live FAQ List</h3>
                <div className="bg-blue-50 px-4 py-1 rounded-full text-[10px] font-black text-blue-600 ring-1 ring-blue-100">
                    {faqs.length} Questions
                </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <tbody className="divide-y divide-slate-50">
                  {fetchLoading ? (
                    <tr>
                        <td className="p-20 text-center">
                            <Loader2 className="animate-spin mx-auto text-blue-500 mb-4" size={32} />
                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Loading FAQs...</p>
                        </td>
                    </tr>
                  ) : faqs.length === 0 ? (
                    <tr>
                        <td className="p-20 text-center text-slate-300 font-black uppercase tracking-[0.2em] italic text-sm">
                            {selectedProduct ? "No FAQs for this item" : "Select product to view list"}
                        </td>
                    </tr>
                  ) : faqs.map(faq => (
                    <tr key={faq._id} className="hover:bg-slate-50/80 transition-all group">
                      <td className="p-8">
                        <div className="flex items-start gap-4">
                            <div className="mt-1 bg-blue-50 p-2 rounded-lg text-blue-600">
                                <MessageSquare size={16} />
                            </div>
                            <div className="flex-1">
                                <div className="font-black text-slate-800 uppercase text-xs tracking-tight mb-2 flex items-center gap-2">
                                  Q: {faq.question}
                                  <div className="h-[1px] flex-1 bg-slate-100"></div>
                                </div>
                                <div className="text-slate-500 text-sm font-medium leading-relaxed bg-slate-50/50 p-4 rounded-2xl">
                                  <span className="font-bold text-slate-400 mr-2 text-[10px]">ANS:</span> 
                                  {faq.answer}
                                </div>
                            </div>
                        </div>
                      </td>
                      <td className="p-8 text-right align-top">
                        <button 
                          onClick={() => handleDeleteFaq(faq._id)} 
                          className="p-3 bg-white text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all border border-slate-100 shadow-sm"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Faq;