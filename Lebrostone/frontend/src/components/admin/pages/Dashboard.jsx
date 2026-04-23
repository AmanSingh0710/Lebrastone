import React, { useEffect, useState } from 'react';
import instance from '../../web/api/AxiosConfig';
import { Package, ShoppingCart, Users, IndianRupee, Loader } from 'lucide-react'; 

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    recentOrders: []
  });
  const API_BASE = "https://lebrostonebackend4.lifeinfotechinstitute.com";
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        
        if (!token) {
          window.location.href = "/admin/login";
          return;
        }

        const res = await instance.get("/api/admin/dashboard-stats", {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (error) {
        console.error("Dashboard Error:", error);
        
        // ✅ Agar token expire ho gaya (401), toh logout karwa do
        if (error.response && error.response.status === 401) {
          alert("Session expired. Please login again.");
          localStorage.removeItem('adminToken');
          window.location.href = "/admin/login";
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [API_BASE]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-emerald-100 text-emerald-700';
      case 'Shipped': return 'bg-blue-100 text-blue-700';
      case 'Pending': return 'bg-orange-100 text-orange-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const statsCards = [
    { id: 1, name: 'Total Products', value: stats.totalProducts, icon: <Package size={22} />, color: 'bg-blue-600' },
    { id: 2, name: 'Total Orders', value: stats.totalOrders, icon: <ShoppingCart size={22} />, color: 'bg-indigo-600' },
    { id: 3, name: 'Total Users', value: stats.totalUsers, icon: <Users size={22} />, color: 'bg-purple-600' },
    { id: 4, name: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: <IndianRupee size={22} />, color: 'bg-emerald-600' },
  ];

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-64 text-slate-500">
      <Loader className="animate-spin mb-2" />
      <p className="text-xs font-bold uppercase tracking-widest">Loading Analytics...</p>
    </div>
  );

  return (
    <div className="space-y-8 p-2">
      <div className="flex flex-col">
        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Analytics Overview</h1>
        <p className="text-sm text-slate-500">Real-time data from your store</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((item) => (
          <div key={item.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5">
            <div className={`${item.color} text-white p-4 rounded-2xl shadow-lg shadow-inherit/20`}>
              {item.icon}
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">{item.name}</p>
              <h3 className="text-xl font-black text-slate-900">{item.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h2 className="font-black text-slate-800 uppercase text-sm tracking-wide">Recent Transactions</h2>
          <button className="text-[10px] font-black text-blue-600 uppercase border-b-2 border-blue-600">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-black">
              {stats.recentOrders?.length > 0 ? (
                stats.recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-6 py-4 font-bold text-xs text-blue-600">#{order._id.slice(-6).toUpperCase()}</td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-700">{order.user?.name || 'Unknown User'}</td>
                    <td className="px-6 py-4 text-xs font-black">₹{order.finalTotal || order.totalPrice}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${getStatusColor(order.deliveryStatus || order.status)}`}>
                        {order.deliveryStatus || order.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" className="px-6 py-10 text-center text-slate-400 text-xs font-bold uppercase">No recent data available</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;