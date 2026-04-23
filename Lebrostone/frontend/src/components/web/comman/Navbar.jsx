import React, { useState, useEffect } from "react";
import { CiUser, CiSearch, CiShoppingBasket } from "react-icons/ci";
import { IoMdClose } from "react-icons/io";
import { HiMenuAlt3 } from "react-icons/hi";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import instance, { getImageUrl } from "../api/AxiosConfig";
import { getProductPath } from "../../../utils/productRoutes";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ products: [], categories: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const [cartCount] = useState(0);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await instance.get("/api/categories");
        const allCategories = res.data.data || [];
        setCategories(allCategories);
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults({ products: [], categories: [] });
      return;
    }
    setIsSearching(true);
    try {
      const productRes = await instance.get(`/api/products/search?q=${encodeURIComponent(query)}`);
      const products = productRes.data.data || [];
      const matchedCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults({
        products: products.slice(0, 8),
        categories: matchedCategories.slice(0, 5)
      });
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults({ products: [], categories: [] });
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults({ products: [], categories: [] });
    setSearchOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY === 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const staticNavItems = [
    { name: "HOME", path: "/" },
    { name: "SHOP ALL", path: "/shop" },
  ];
  const dynamicNavItems = categories.map(cat => ({
    name: cat.name.toUpperCase(),
    path: `/shop/category/${cat._id}`
  }));
  const endNavItems = [{ name: "BLOG", path: "/blogs" }];
  const navItems = [...staticNavItems, ...dynamicNavItems, ...endNavItems];

  return (
    <nav className="sticky top-0 w-full z-50 bg-[#FAF6EA] shadow-md">

      {/* Top Banner */}
      <div className={`bg-[#00a758] text-white flex justify-center items-center text-xs transition-all duration-300 overflow-hidden ${isVisible ? "h-10 opacity-100" : "h-0 opacity-0"}`}>
        <button className="absolute left-4"><IoChevronBack /></button>
        <span>GET 10% OFF YOUR FIRST ORDER – <b>LEBROSTONE10!</b></span>
        <button className="absolute right-4"><IoChevronForward /></button>
      </div>

      {/* Main Header */}
      <div className="px-4 md:px-14 py-2 flex items-center justify-between">

        {/* Left Logo — desktop only */}
        <a href="/" className="hidden md:flex flex-col text-[10px] items-start font-bold text-gray-800 leading-tight min-w-[120px]">
          <p className="text-center w-full text-sm uppercase font-medium ml-3">from the house of</p>
          <span className="h-10 w-auto">
            <img data-priority="high" className="h-full w-full object-contain" src="/leftlogo.png" alt="leftlogo" />
          </span>
        </a>

        {/* Mobile: Hamburger on left */}
        <button className="md:hidden text-2xl" onClick={() => setMobileMenuOpen(true)}>
          <HiMenuAlt3 />
        </button>

        {/* Center Logo */}
        <div className="flex-1 flex justify-center">
          <img data-priority="high" src="/logo.png" alt="logo" className="h-8" />
        </div>

        {/* Right Icons */}
        <div className="flex gap-3 md:gap-4 items-center min-w-[80px] justify-end">
          <button onClick={() => navigate("/profile")}>
            <CiUser size={22} />
          </button>

          <div className="relative group">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-1 rounded-full hover:bg-gray-200 transition-all duration-300"
            >
              <CiSearch size={22} className="text-gray-700" />
            </button>

            {/* Search Dropdown */}
            {searchOpen && (
              <div className="absolute right-0 top-full mt-3 w-[320px] md:w-96 bg-white rounded-2xl shadow-2xl z-50 border border-gray-100 overflow-hidden">
                {/* Search Input */}
                <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-100">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products, categories..."
                      className="w-full pl-4 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                      autoFocus
                    />
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full"
                    >
                      <IoMdClose size={20} />
                    </button>
                  </div>
                </div>

                {/* Results */}
                <div className="max-h-96 overflow-y-auto bg-white">
                  {isSearching ? (
                    <div className="p-8 text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-3"></div>
                      <div className="text-gray-500 font-medium">Searching...</div>
                    </div>
                  ) : searchQuery.trim() ? (
                    <>
                      {searchResults.categories.length > 0 && (
                        <div>
                          <div className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50 flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            Categories
                          </div>
                          {searchResults.categories.map((category, index) => (
                            <button
                              key={category._id}
                              onClick={() => { navigate(`/shop/category/${category._id}`); clearSearch(); }}
                              className={`w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-50 last:border-b-0 flex items-center gap-4 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                            >
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
                                {category.name.charAt(0)}
                              </div>
                              <span className="font-semibold text-gray-800">{category.name}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {searchResults.products.length > 0 && (
                        <div>
                          <div className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50 mt-1 flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            Products
                          </div>
                          {searchResults.products.map((product, index) => (
                            <button
                              key={product._id}
                              onClick={() => {
                                navigate(getProductPath(product));
                                clearSearch();
                              }}
                              className={`w-full text-left px-4 py-3 hover:bg-green-50 border-b border-gray-50 last:border-b-0 flex items-center gap-4 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                            >
                              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm border border-gray-100">
                                <img
                                  src={getImageUrl(product.thumbnail || (product.images && product.images[0])) || "https://via.placeholder.com/60"}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => e.target.src = "https://via.placeholder.com/60"}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-gray-800 truncate mb-1">{product.name}</div>
                                <div className="text-sm text-gray-500 truncate mb-1">{product.category?.name || 'Uncategorized'}</div>
                                <div className="text-lg font-extrabold text-green-600">₹{product.selling_price || product.unitPrice || 0}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {searchResults.categories.length === 0 && searchResults.products.length === 0 && !isSearching && (
                        <div className="p-8 text-center">
                          <div className="text-5xl mb-4">🔍</div>
                          <div className="text-gray-500 font-bold text-lg mb-2">No results found</div>
                          <div className="text-gray-400 text-sm">Try different keywords or check spelling</div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-8 text-center">
                      <div className="text-5xl mb-4">✨</div>
                      <div className="text-gray-500 font-bold text-lg mb-2">Start typing to search</div>
                      <div className="text-gray-400 text-sm">Find amazing products and categories</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <button onClick={() => navigate("/cart")} className="relative">
            <CiShoppingBasket size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Desktop Navigation — wraps if too many items */}
      <div className="hidden md:flex flex-wrap justify-center gap-x-6 gap-y-1 pb-3 px-4 text-xs font-semibold">
        {navItems.map((item, i) => (
          <button
            key={i}
            onClick={() => navigate(item.path)}
            className="hover:text-[#00a758] transition-colors whitespace-nowrap py-0.5"
          >
            {item.name}
          </button>
        ))}
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/40">
          <div className="absolute top-0 left-0 h-full w-72 bg-white shadow-xl flex flex-col">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <img data-priority="high" src="/logo.png" alt="logo" className="h-7" />
              <button className="text-2xl" onClick={() => setMobileMenuOpen(false)}>
                <IoMdClose />
              </button>
            </div>

            {/* Nav Items */}
            <div className="flex flex-col overflow-y-auto flex-1 px-5 py-4 gap-1">
              {navItems.map((item, index) => (
                <button
                  key={index}
                  className="text-left py-3 px-2 border-b border-gray-100 text-sm font-medium hover:text-[#00a758] hover:bg-green-50 rounded-lg transition-colors"
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* Backdrop */}
          <div className="w-full h-full" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

    </nav>
  );
};

export default Navbar;
