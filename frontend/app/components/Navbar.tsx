import React from 'react';
import { ArrowUpRight, Menu } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
const Navbar = () => {
  return (
    <nav className="absolute top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b-2 bg-black">
      <div className="max-w-[1400px] mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-green-400 to-green-600 rounded flex items-center justify-center">
            <svg width="16" height="16" className="sm:w-5 sm:h-5" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L3 7v6l7 5 7-5V7l-7-5z" fill="currentColor" className="text-black/80"/>
            </svg>
          </div>
          <span className="text-white text-lg sm:text-xl font-semibold tracking-tight">.Certifi</span>
        </div>

        {/* Navigation Links */}
        <div className="hidden lg:flex items-center gap-8 xl:gap-10">
          <a href="#" className="text-green-400 text-sm font-medium hover:text-green-300 transition-colors">
            Home
          </a>
          <a href="#" className="text-gray-300 text-sm font-medium hover:text-white transition-colors">
            About Us
          </a>
          <a href="#" className="text-gray-300 text-sm font-medium hover:text-white transition-colors">
            Services
          </a>
          <a href="#" className="text-gray-300 text-sm font-medium hover:text-white transition-colors">
            Review
          </a>
          <a href="#" className="text-gray-300 text-sm font-medium hover:text-white transition-colors">
            Blog
          </a>
          <a href="#" className="text-gray-300 text-sm font-medium hover:text-white transition-colors">
            Contact
          </a>
          <ConnectButton 
            label="Connect wallet"
            chainStatus={{
              largeScreen: 'name',
              smallScreen: 'icon',
            }}
            showBalance={false}
            accountStatus={{
              largeScreen: 'full',
              smallScreen: 'address',
            }}
          />
        </div>

        {/* Mobile Menu */}
        <button className="lg:hidden text-white">
          <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;