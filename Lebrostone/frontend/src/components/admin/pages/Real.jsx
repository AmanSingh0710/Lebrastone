import React, { useState, useEffect } from 'react';
import instance from '../../web/api/AxiosConfig';
import { Trash2, Star, Play, Upload, Plus, Loader2, Video, X } from 'lucide-react';

const RealAdmin = () => {
    const [reels, setReels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [videoPreview, setVideoPreview] = useState(null);
    const [activeVideo, setActiveVideo] = useState(null);
    const [formData, setFormData] = useState({ customerName: '', rating: 5, reviewText: '', video: null });


    const API_BASE = "https://lebrostonebackend4.lifeinfotechinstitute.com";
    useEffect(() => { fetchReels(); }, []);

    const fetchReels = async () => {
        try {
            const res = await instance.get("/api/reels/all");
            setReels(res.data);
        } catch (err) { console.error("Fetch error"); }
    };

    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, video: file });
            setVideoPreview(URL.createObjectURL(file));
        }
    };

    const handleAddReel = async (e) => {
        e.preventDefault();
        if (!formData.video) return alert(" plz Video select !");
        
        setLoading(true);
        const data = new FormData();
        data.append('customerName', formData.customerName);
        data.append('rating', formData.rating);
        data.append('reviewText', formData.reviewText);
        data.append('video', formData.video);

        try {
            const token = localStorage.getItem('adminToken');
            await instance.post("/api/reels/add", data, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            alert("Video Review Added! 🎬");
            setFormData({ customerName: '', rating: 5, reviewText: '', video: null });
            setVideoPreview(null);
            fetchReels();
        } catch (err) { alert("Error uploading video"); }
        finally { setLoading(false); }
    };

    const deleteReel = async (e, id) => {
        e.stopPropagation(); // Delete click se video player open na ho
        if (window.confirm("Delete this video review?")) {
            const token = localStorage.getItem('adminToken');
            await instance.delete(`/api/reels/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchReels();
        }
    };

    return (
        <div className="p-6 md:p-10 bg-[#F9FAFB] min-h-screen text-slate-800 font-sans">
            <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-800 mb-8 flex items-center gap-3">
                <Video size={32} />
                Video Manager
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Upload Form */}
                <div className="lg:col-span-4">
                    <form onSubmit={handleAddReel} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
                        <div className="mb-6">
                            <label className="w-full h-64 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer overflow-hidden group">
                                {videoPreview ? (
                                    <video src={videoPreview} className="w-full h-full object-cover" />
                                ) : (
                                    <>
                                        <Upload className="text-slate-300 group-hover:text-orange-500 transition-colors" size={48} />
                                        <span className="text-[10px] font-black uppercase text-slate-400 mt-2">Click to Upload Reel</span>
                                    </>
                                )}
                                <input type="file" accept="video/*" hidden onChange={handleVideoChange} />
                            </label>
                        </div>

                        <div className="space-y-4">
                            <input required placeholder="Customer Name" className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-bold text-sm border-none ring-1 ring-slate-100 focus:ring-orange-500" 
                            value={formData.customerName} onChange={(e)=>setFormData({...formData, customerName:e.target.value})} />
                            
                            <select className="w-full bg-slate-50 p-4 rounded-2xl outline-none font-bold text-sm border-none ring-1 ring-slate-100" 
                            value={formData.rating} onChange={(e)=>setFormData({...formData, rating:e.target.value})}>
                                {[5,4,3,2,1].map(num => <option key={num} value={num}>{num} Stars</option>)}
                            </select>

                            <textarea placeholder="Review Text (Optional)..." className="w-full bg-slate-50 p-4 rounded-2xl h-24 outline-none resize-none font-medium text-sm border-none ring-1 ring-slate-100" 
                            value={formData.reviewText} onChange={(e)=>setFormData({...formData, reviewText:e.target.value})} />

                            <button disabled={loading} className="w-full bg-slate-900 text-white p-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-orange-600 transition-all shadow-lg">
                                {loading ? <Loader2 className="animate-spin" /> : <><Plus size={18} /> Upload Review</>}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Reels Grid */}
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {reels.map((reel) => (
                        <div 
                            key={reel._id} 
                            onClick={() => setActiveVideo(`${API_BASE}${reel.videoUrl}`)} // Click handler
                            className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-200 relative group aspect-[9/16] cursor-pointer"
                        >
                            <video src={`${API_BASE}${reel.videoUrl}`} className="w-full h-full object-cover" muted />
                            
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-6 flex flex-col justify-end">
                                <div className="flex gap-1 mb-2">
                                    {[...Array(reel.rating)].map((_, i) => <Star key={i} size={10} fill="#EAB308" className="text-yellow-500" />)}
                                </div>
                                <h3 className="font-black text-white text-sm uppercase tracking-tight">{reel.customerName}</h3>
                                <p className="text-white/70 text-[10px] line-clamp-2 mt-1 italic">"{reel.reviewText}"</p>
                                
                                <button onClick={(e) => deleteReel(e, reel._id)} className="absolute top-4 right-4 z-20 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-red-500 transition-all opacity-0 group-hover:opacity-100">
                                    <Trash2 size={16} />
                                </button>
                                
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-12 h-12 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/50">
                                        <Play size={20} fill="currentColor" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- Full-Screen Video Player Modal --- */}
            {activeVideo && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <button 
                        onClick={() => setActiveVideo(null)}
                        className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
                    >
                        <X size={32} />
                    </button>
                    
                    <div className="w-full max-w-sm aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                        <video 
                            src={activeVideo} 
                            controls 
                            autoPlay 
                            className="w-full h-full object-contain"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default RealAdmin;