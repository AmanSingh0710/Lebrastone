import React, { useState, useEffect } from 'react';
import instance from '../../web/api/AxiosConfig';
import { IndianRupee, Calendar, Search, Loader2, CheckCircle } from 'lucide-react';

const Payment = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const res = await instance.get("/api/payments/transactions/all");
            if (res.data.success) {
                setTransactions(res.data.data);
            }
        } catch (err) {
            console.error("Error fetching transactions", err);
        } finally {
            setLoading(false);
        }
    };

    // --- TOTAL EARNINGS CALCULATION ---
    const totalEarnings = transactions.reduce((acc, curr) => acc + curr.amountPaid, 0);

    // --- FILTER LOGIC ---
    const filteredData = transactions.filter(t => 
        t.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.orderId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-white">
            <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
    );

    return (
        <div className="p-6 bg-[#f8fafc] min-h-screen font-sans text-black">
            <div className="max-w-7xl mx-auto">
                
                {/* TOP BAR: Title, Search and Total Earnings */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                            <IndianRupee className="text-emerald-600" size={24} /> Payment Records
                        </h1>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                        {/* Search Input */}
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="text"
                                placeholder="Search Name or Order ID..."
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Total Earnings Card */}
                        <div className="bg-slate-900 text-white px-6 py-2 rounded-xl shadow-lg flex flex-col items-center min-w-[180px]">
                            <p className="text-[10px] font-bold uppercase opacity-60 tracking-widest">Total Earnings</p>
                            <h2 className="text-xl font-black text-emerald-400">₹{totalEarnings.toLocaleString('en-IN')}</h2>
                        </div>
                    </div>
                </div>

                {/* TRANSACTION TABLE */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    <th className="p-5">Date</th>
                                    <th className="p-5">Order ID</th>
                                    <th className="p-5">Customer</th>
                                    <th className="p-5">Products</th>
                                    <th className="p-5">Amount</th>
                                    <th className="p-5 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredData.map((t) => (
                                    <tr key={t._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-5 text-xs font-bold text-slate-600">
                                            {new Date(t.transactionDate).toLocaleDateString('en-GB')}
                                        </td>
                                        <td className="p-5 text-[11px] font-black text-blue-600 uppercase">
                                            #{t.orderId?.slice(-8).toUpperCase()}
                                        </td>
                                        <td className="p-5">
                                            <p className="font-bold text-sm">{t.userName}</p>
                                            <p className="text-[10px] text-slate-500">{t.userEmail}</p>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex flex-col gap-1">
                                                {t.products?.map((p, i) => (
                                                    <span key={i} className="text-[9px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-bold w-fit">
                                                        {p.name} (x{p.quantity})
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-5 font-black text-slate-900">₹{t.amountPaid}</td>
                                        <td className="p-5">
                                            <div className="flex justify-center">
                                                <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-emerald-100">
                                                    <CheckCircle size={12} /> {t.status}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {filteredData.length === 0 && (
                            <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                                No records found
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;