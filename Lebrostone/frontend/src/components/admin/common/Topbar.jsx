import React, { useState } from 'react';
import { Link } from 'react-router-dom';
const API_BASE = 'https://lebrostonebackend4.lifeinfotechinstitute.com';
const Topbar = ({ toggleSidebar }) => {
  // Demo data (Inhe aap props ya API se replace kar sakte hain)
  const [currentLang, setCurrentLang] = useState({ name: 'English', code: 'en' });
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const notifications = {
    messages: 3,
    orders: 5
  };

  return (
    <header className="h-16 bg-white border-b px-4 flex items-center justify-between shadow-sm sticky top-0 z-40">

      {/* Left Section: Sidebar Toggle & Brand */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
        >
          <span className="text-2xl">☰</span>
        </button>
        <div className="hidden md:block">
          <h1 className="text-gray-700 font-bold text-lg tracking-tight">Admin System</h1>
        </div>
      </div>

      {/* Right Section: Icons & Profile */}
      <div className="flex items-center gap-2 md:gap-5">

        {/* 4. Admin Profile Dropdown */}
        <div className="relative ml-2 border-l pl-4">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 hover:bg-gray-50 p-1 rounded-lg transition-all"
          >
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-gray-800 leading-none">{currentLang.name}</p>
              <p className="text-[11px] text-gray-500 mt-1 uppercase font-semibold">Master Admin</p>
            </div>
            <img
              // Placeholder ko hata kar backend URL aur file path likhein
              src={`${API_BASE}/uploads/logo/logo.png`}
              className="w-9 h-9 rounded-full border-2 border-blue-100 object-cover"
              alt="profile"
              // Agar image load na ho toh placeholder dikhane ke liye onError logic
              onError={(e) => { e.target.src = "https://via.placeholder.com/40"; }}
            />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white border rounded-xl shadow-2xl py-2 z-50">
              <Link to="/admin/settings" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors">Settings</Link>
              <div className="border-t my-1"></div>
              <button
                onClick={() => {
                  localStorage.removeItem('adminToken');
                  window.location.href = '/admin/login';
                }}
                className="block w-full text-left px-4 py-2.5 text-sm text-red-600 font-medium hover:bg-red-50 transition-colors">
                Logout
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Topbar;