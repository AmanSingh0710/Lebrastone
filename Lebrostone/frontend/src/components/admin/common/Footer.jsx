import React from 'react';
// Agar aapne lucide-react install nahi kiya hai to: npm install lucide-react
import { User, Home } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t py-4 px-6 mt-auto">
      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row justify-between items-center gap-4">
        
        {/* Left Side: Copyright Text */}
        <div className="text-center lg:text-left">
          <p className="text-sm text-gray-600 font-medium">
            <span className="hidden sm:inline-block">
              © {currentYear} Lebrostone. All rights reserved.
            </span>
          </p>
        </div>

        {/* Right Side: Navigation Links with Icons */}
        <div className="flex justify-center lg:justify-end">
          <ul className="flex items-center gap-6 mb-0 list-none">
            <li>
              <a 
                href="/admin/profile" 
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors group"
              >
                <User size={16} className="text-gray-400 group-hover:text-blue-600" />
                <span>Profile</span>
              </a>
            </li>
            
            {/* Divider like 'list-separator-link' */}
            <li className="h-4 w-[1px] bg-gray-300 hidden sm:block"></li>

            <li>
              <a 
                href="/admin/dashboard" 
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors group"
              >
                <Home size={16} className="text-gray-400 group-hover:text-blue-600" />
                <span>Home</span>
              </a>
            </li>
          </ul>
        </div>

      </div>
    </footer>
  );
};

export default Footer;