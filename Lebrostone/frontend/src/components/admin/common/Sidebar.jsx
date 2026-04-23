import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, Package, Star,
  Image as ImageIcon, Ticket, MessageSquare,
  ChevronDown, LogOut, PlusCircle, List,
  Filter, ShoppingBag, CreditCard, Users, HelpCircle, Sun, PlayCircle, BookOpen,
  LifeBuoy,
  Key,
  Package2,
  BanknoteArrowUpIcon,
  BookOpenCheck,
  Settings
} from 'lucide-react';

import { IMAGE_BASE_URL } from '../../web/api/AxiosConfig';
import { FaRegEnvelope } from 'react-icons/fa';
import { HiCash } from 'react-icons/hi';

const Sidebar = () => {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({
    brand: false,
    category: false,
    products: false,
    combo: false,
    promotions: true
  });

  const toggleMenu = (menuName) => {
    setOpenMenus(prev => ({ ...prev, [menuName]: !prev[menuName] }));
  };

  // ACTIVE STATE: Blue background for top-level active items
  const getLinkStyle = (path) =>
    location.pathname === path
      ? 'bg-blue-600 text-white shadow-md font-semibold'
      : 'text-gray-300 hover:bg-gray-800 hover:text-white';

  // PARENT MENU ACTIVE: Blue background when any child is active
  const isParentActive = (pathPart) =>
    location.pathname.includes(pathPart)
      ? 'text-white bg-blue-600'
      : 'text-gray-300';

  return (
    <aside className="w-64 bg-black text-white h-screen flex flex-col sticky top-0 shadow-xl overflow-hidden border-r border-gray-800">

      {/* Branding - Darker shade for depth */}
      <div className="p-5 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden">
            <img
              src={`${IMAGE_BASE_URL}/uploads/logo/logo.png`}
              alt="L"
              className="w-full h-full object-contain p-1"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<span class="font-bold text-gray-800">L</span>';
              }}
            />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight">LEBROSTONE</h2>
            <p className="text-[10px] text-blue-300/80 font-bold uppercase tracking-widest">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{
        overflow: 'auto',
        '-ms-overflow-style': 'none',
        'scrollbar-width': 'none',
      }} className="flex-1 px-3 mt-4 space-y-1 overflow-y-auto pb-5">

        {/* Dashboard */}
        <Link to="/admin/dashboard" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${getLinkStyle('/admin/dashboard')}`}>
          <LayoutDashboard size={18} />
          <span className="text-sm font-medium">Dashboard</span>
        </Link>

        {/* --- MASTER DATA SECTION --- */}
        <div className="pt-4 pb-1 px-3">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Master Data</p>
        </div>

        {/* Brand Setup */}
        <div>
          <button
            onClick={() => toggleMenu('brand')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all hover:bg-gray-800 ${isParentActive('brand')}`}
          >
            <div className="flex items-center gap-3">
              <Star size={18} className="text-yellow-300" />
              <span className="text-sm font-medium">Brand Setup</span>
            </div>
            <ChevronDown size={14} className={`transition-transform duration-200 ${openMenus['brand'] ? 'rotate-180 text-white' : 'text-gray-400'}`} />
          </button>
          {openMenus['brand'] && (
            <ul className="mt-1 ml-4 space-y-1 border-l border-gray-700 pl-4">
              <li>
                <Link
                  to="/admin/brand"
                  className={`flex items-center gap-2 py-2 text-xs transition-colors ${location.pathname === '/admin/brand'
                    ? 'text-blue-300 font-bold border-l-2 border-blue-400 pl-2 -ml-1'
                    : 'text-gray-400 hover:text-white'
                    }`}
                >
                  <PlusCircle size={14} /> <span>Add Brand</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/brandslist"
                  className={`flex items-center gap-2 py-2 text-xs transition-colors ${location.pathname === '/admin/brandslist'
                    ? 'text-blue-300 font-bold border-l-2 border-blue-400 pl-2 -ml-1'
                    : 'text-gray-400 hover:text-white'
                    }`}
                >
                  <List size={14} /> <span>All Brands</span>
                </Link>
              </li>
            </ul>
          )}
        </div>

        {/* Category Setup */}
        <div>
          <button
            onClick={() => toggleMenu('category')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all hover:bg-gray-800 ${isParentActive('category')}`}
          >
            <div className="flex items-center gap-3">
              <Filter size={18} className="text-purple-300" />
              <span className="text-sm font-medium">Category Setup</span>
            </div>
            <ChevronDown size={14} className={`transition-transform duration-200 ${openMenus['category'] ? 'rotate-180 text-white' : 'text-gray-400'}`} />
          </button>
          {openMenus['category'] && (
            <ul className="mt-1 ml-4 space-y-1 border-l border-gray-700 pl-4">
              <li>
                <Link
                  to="/admin/category"
                  className={`block py-2 text-xs ${location.pathname === '/admin/category'
                    ? 'text-blue-300 font-bold border-l-2 border-blue-400 pl-2 -ml-1'
                    : 'text-gray-400 hover:text-white'
                    }`}
                >
                  • Category
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/subcategory"
                  className={`block py-2 text-xs ${location.pathname === '/admin/subcategory'
                    ? 'text-blue-300 font-bold border-l-2 border-blue-400 pl-2 -ml-1'
                    : 'text-gray-400 hover:text-white'
                    }`}
                >
                  • Sub Category
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/subSubCategory"
                  className={`block py-2 text-xs ${location.pathname === '/admin/subSubCategory'
                    ? 'text-blue-300 font-bold border-l-2 border-blue-400 pl-2 -ml-1'
                    : 'text-gray-400 hover:text-white'
                    }`}
                >
                  • Sub Sub Category
                </Link>
              </li>
            </ul>
          )}
        </div>

        {/* Product Vault */}
        <div>
          <button
            onClick={() => toggleMenu('products')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all hover:bg-gray-800 ${isParentActive('product')}`}
          >
            <div className="flex items-center gap-3">
              <ShoppingBag size={18} className="text-green-300" />
              <span className="text-sm font-medium">Product Vault</span>
            </div>
            <ChevronDown size={14} className={`transition-transform duration-200 ${openMenus['products'] ? 'rotate-180 text-white' : 'text-gray-400'}`} />
          </button>
          {openMenus['products'] && (
            <ul className="mt-1 ml-4 space-y-1 border-l border-gray-700 pl-4">
              <li>
                <Link
                  to="/admin/addproduct"
                  className={`block py-2 text-xs ${location.pathname === '/admin/addproduct'
                    ? 'text-blue-300 font-bold border-l-2 border-blue-400 pl-2 -ml-1'
                    : 'text-gray-400 hover:text-white'
                    }`}
                >
                  + New Product
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/productadminlist"
                  className={`block py-2 text-xs ${location.pathname === '/admin/productadminlist'
                    ? 'text-blue-300 font-bold border-l-2 border-blue-400 pl-2 -ml-1'
                    : 'text-gray-400 hover:text-white'
                    }`}
                >
                  Product List
                </Link>
              </li>

              <li>
                <Link
                  to="/admin/variant"
                  className={`block py-2 text-xs ${location.pathname === '/admin/variant'
                    ? 'text-blue-300 font-bold border-l-2 border-blue-400 pl-2 -ml-1'
                    : 'text-gray-400 hover:text-white'
                    }`}
                >
                  Variants
                </Link>

              </li>
              <li>
                <Link
                  to="/admin/features"
                  className={`block py-2 text-xs ${location.pathname === '/admin/features'
                    ? 'text-blue-300 font-bold border-l-2 border-blue-400 pl-2 -ml-1'
                    : 'text-gray-400 hover:text-white'
                    }`}
                >
                  Features
                </Link>
              </li>
            </ul>
          )}
        </div>
        {/* Combo Vault */}
        <div>
          <button
            onClick={() => toggleMenu('combo')}   // ✅ FIXED
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all hover:bg-gray-800 ${isParentActive('combo')}`}
          >
            <div className="flex items-center gap-3">
              <ShoppingBag size={18} className="text-green-300" />
              <span className="text-sm font-medium">Combo Vault</span>
            </div>

            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${openMenus['combo'] ? 'rotate-180 text-white' : 'text-gray-400'
                }`}
            />
          </button>

          {openMenus['combo'] && (   // ✅ FIXED
            <ul className="mt-1 ml-4 space-y-1 border-l border-gray-700 pl-4">

              <li>
                <Link
                  to="/admin/addcombo"
                  className={`block py-2 text-xs ${location.pathname === '/admin/addcombo'
                    ? 'text-blue-300 font-bold border-l-2 border-blue-400 pl-2 -ml-1'
                    : 'text-gray-400 hover:text-white'
                    }`}
                >
                  + New Combo
                </Link>
              </li>

              <li>
                <Link
                  to="/admin/comboslist"
                  className={`block py-2 text-xs ${location.pathname === '/admin/comboslist'
                    ? 'text-blue-300 font-bold border-l-2 border-blue-400 pl-2 -ml-1'
                    : 'text-gray-400 hover:text-white'
                    }`}
                >
                  Combo List
                </Link>
              </li>

            </ul>
          )}
        </div>
        {/* Shop by Concern */}
        <Link to="/admin/concern" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${getLinkStyle('/admin/concern')}`}>
          <BanknoteArrowUpIcon size={18} className="text-fuchsia-300" />
          <span className="text-sm font-medium">Shop by Concern</span>
        </Link>

        {/* <Link to="/admin/ingredient" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${getLinkStyle('/admin/ingredient')}`}>
          <BookOpen size={18} className="text-indigo-300" />
          <span className="text-sm font-medium">Shop by Ingredient</span>
        </Link> */}



        {/* --- OPERATIONS SECTION --- */}
        <div className="pt-4 pb-1 px-3">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Operations</p>
        </div>

        <Link to="/admin/orders" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${getLinkStyle('/admin/orders')}`}>
          <ShoppingCart size={18} className="text-rose-300" />
          <span className="text-sm font-medium">Orders</span>
        </Link>

        <Link to="/admin/users" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${getLinkStyle('/admin/users')}`}>
          <Users size={18} className="text-cyan-300" />
          <span className="text-sm font-medium">Customers</span>
        </Link>

        {/* --- GROWTH & SUPPORT SECTION --- */}
        <div className="pt-4 pb-1 px-3">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Growth & Support</p>
        </div>

        <Link to="/admin/anantambanner" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${getLinkStyle('/admin/anantambanner')}`}>
          <Sun size={18} className="text-amber-300" />
          <span className="text-sm font-medium">Anantam Promo</span>
        </Link>

        <Link to="/admin/coupons" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${getLinkStyle('/admin/coupons')}`}>
          <Ticket size={18} className="text-violet-300" />
          <span className="text-sm font-medium">Coupons</span>
        </Link>
        <Link to="/admin/heroslider" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${getLinkStyle('/admin/heroslider')}`}>
          <BanknoteArrowUpIcon size={18} className="text-fuchsia-300" />
          <span className="text-sm font-medium">Hero Slider</span>
        </Link>
        <Link to="/admin/offerbanner" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${getLinkStyle('/admin/offerbanner')}`}>
          <BookOpen size={18} className="text-indigo-300" />
          <span className="text-sm font-medium">Offer Banner</span>
        </Link>
        <Link to="/admin/findoffer" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${getLinkStyle('/admin/findoffer')}`}>
          <BookOpen size={18} className="text-indigo-300" />
          <span className="text-sm font-medium">Find Offer</span>
        </Link>
        <Link to="/admin/reviews" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${getLinkStyle('/admin/reviews')}`}>
          <MessageSquare size={18} className="text-emerald-300" />
          <span className="text-sm font-medium">Reviews</span>
        </Link>
        <Link to="/admin/story" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${getLinkStyle('/admin/story')}`}>
          <BookOpenCheck size={18} className="text-emerald-300" />
          <span className="text-sm font-medium">Our Story</span>
        </Link>
        <Link to="/admin/subscribe" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${getLinkStyle('/admin/subscribe')}`}>
          <FaRegEnvelope size={18} className="text-sky-300" />
          <span className="text-sm font-medium">Subscribe</span>
        </Link>
        <Link to="/admin/real" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${getLinkStyle('/admin/real')}`}>
          <PlayCircle size={18} className="text-fuchsia-300" />
          <span className="text-sm font-medium">Video Reels</span>
        </Link>

        <Link to="/admin/blog" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${getLinkStyle('/admin/blog')}`}>
          <BookOpen size={18} className="text-indigo-300" />
          <span className="text-sm font-medium">Blog Posts</span>
        </Link>

        <Link to="/admin/faq" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${getLinkStyle('/admin/faq')}`}>
          <HelpCircle size={18} className="text-sky-300" />
          <span className="text-sm font-medium">Help / FAQ</span>
        </Link>

        {/* Help & Support */}

        <div className="pt-4 pb-1 px-3">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Help & Support</p>
        </div>

        <Link to="/admin/inbox" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${getLinkStyle('/admin/inbox')}`}>
          <LifeBuoy size={18} className="text-sky-300" />
          <span className="text-sm font-medium">Inbox</span>
        </Link>
        <Link to="/admin/support" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${getLinkStyle('/admin/support')}`}>
          <LifeBuoy size={18} className="text-sky-300" />
          <span className="text-sm font-medium">Support Ticket</span>
        </Link>

        {/* System Settings */}
        <div className="pt-4 pb-1 px-3">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">System Settings</p>
        </div>

        <Link to="/admin/paymentpage" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${getLinkStyle('/admin/paymentpage')}`}>
          <HiCash size={18} className="text-sky-300" />
          <span className="text-sm font-medium">Payment Gateway</span>
        </Link>

        <Link to="/admin/orderconfig" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${getLinkStyle('/admin/orderconfig')}`}>
          <Key size={18} className="text-yellow-300" />
          <span className="text-sm font-medium">Order Configuration</span>
        </Link>

        <Link to="/admin/businesspage" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${getLinkStyle('/admin/businesspage')}`}>
          <Package2 size={18} className="text-sky-300" />
          <span className="text-sm font-medium">Business Pages</span>
        </Link>

        <Link to="/admin/settings" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${getLinkStyle('/admin/settings')}`}>
          <Settings size={18} className="text-blue-300" />
          <span className="text-sm font-medium">Admin Settings</span>
        </Link>




      </nav>

      {/* Logout Section */}
      <div className="p-4 border-t border-gray-800 bg-gray-900">
        <button
          onClick={() => {
            localStorage.removeItem('adminToken');
            window.location.href = '/admin/login';
          }}
          className="w-full flex items-center justify-center gap-2 p-2.5 bg-red-900/30 text-red-300 border border-red-900/50 hover:bg-red-900 hover:text-white rounded-xl transition-all font-black text-[10px] tracking-widest"
        >
          <LogOut size={16} />
          LOGOUT SYSTEM
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;