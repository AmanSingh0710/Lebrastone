import React, { useState, useEffect } from 'react';
import Sidebar from '../common/Sidebar';
import Topbar from '../common/Topbar';
import Footer from '../common/Footer';
import { X, LogOut, ShoppingCart, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';

const AdminLayout = ({ children }) => {
  const { success } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Modals States (Laravel Modals ka substitute)
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showOrderPopup, setShowOrderPopup] = useState(false);
  const [statusModal, setStatusModal] = useState({ show: false, type: '', message: '' });

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Demo: Simulate New Order Popup (Jaise Laravel mein aata hai)
  useEffect(() => {
    const timer = setTimeout(() => setShowOrderPopup(true), 5000); // 5 sec baad popup
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    success("Logged out successfully");
    setTimeout(() => {
      window.location.href = '/admin/login';
    }, 1000);
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      
      {/* 1. Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm md:hidden transition-opacity"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* 2. Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:relative md:translate-x-0
      `}>
        {/* Yahan Sidebar component ko prop pass kar rahe hain agar aapko wahan se logout trigger karna ho */}
        <Sidebar onLogoutClick={() => setShowLogoutModal(true)} />
      </div>

      {/* 3. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Topbar */}
        <Topbar 
            toggleSidebar={toggleSidebar} 
            onLogoutClick={() => setShowLogoutModal(true)} 
        />

        {/* Dynamic Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#f8fafc] p-4 md:p-6">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>

      {/* --- MODALS SECTION (Converting your Blade Modals to React) --- */}

      {/* A. Logout Confirmation Modal (sign-out-modal) */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-in fade-in zoom-in duration-200">
            <button onClick={() => setShowLogoutModal(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOut size={40} className="text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Leave?</h3>
            <p className="text-gray-500 mb-6">Select "Logout" below if you are ready to end your current session.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleLogout}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* B. New Order Popup Modal (popup-modal) */}
      {showOrderPopup && (
        <div className="fixed bottom-10 right-10 z-[90] animate-bounce-in">
          <div className="bg-white rounded-2xl shadow-2xl border-l-4 border-blue-600 p-5 flex items-center gap-4 max-w-md">
            <div className="bg-blue-100 p-3 rounded-full text-blue-600">
              <ShoppingCart size={24} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">You have new order!</h4>
              <p className="text-sm text-gray-500">Please check the order list.</p>
              <button 
                onClick={() => setShowOrderPopup(false)}
                className="mt-2 text-sm font-bold text-blue-600 hover:underline"
              >
                OK, Let me check
              </button>
            </div>
            <button onClick={() => setShowOrderPopup(false)} className="text-gray-400 hover:text-gray-600 self-start">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* C. Status/Toggle Modal (toggle-status-modal) */}
      {statusModal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40"></div>
          <div className="relative bg-white rounded-xl shadow-xl max-w-xs w-full p-5 text-center">
            <div className="mb-3 flex justify-center text-blue-500">
                <CheckCircle size={48} />
            </div>
            <h5 className="font-bold text-lg mb-2">Are you sure?</h5>
            <p className="text-sm text-gray-500 mb-4">{statusModal.message}</p>
            <div className="flex gap-2">
              <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold">OK</button>
              <button onClick={() => setStatusModal({show: false})} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg font-bold">Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminLayout;