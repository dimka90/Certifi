'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  PlusCircle,
  Search,
  FileStack,
  XCircle,
  LogOut,
  Settings,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  {
    name: 'Dashboard',
    description: 'Overview & Stats',
    icon: LayoutDashboard,
    href: '/institution/dashboard',
  },
  {
    name: 'Issue Certificate',
    description: 'Single student issuance',
    icon: PlusCircle,
    href: '/institution/issue-certificate',
  },
  {
    name: 'Bulk Issuance',
    description: 'Upload CSV records',
    icon: FileStack,
    href: '/institution/issue-multiple-certificates',
  },
  {
    name: 'View Certificates',
    description: 'Browse & Search',
    icon: Search,
    href: '/institution/view-certificates',
  },
  {
    name: 'Revoke Access',
    description: 'Manage revocations',
    icon: XCircle,
    href: '/institution/revoke-certificate',
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <motion.aside
        initial={false}
        animate={{
          x: isOpen ? 0 : -300,
          opacity: 1
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={cn(
          "fixed top-0 left-0 bottom-0 w-[280px] z-50 lg:translate-x-0",
          "bg-zinc-950/80 backdrop-blur-2xl border-r border-white/5",
          "flex flex-col h-full overflow-hidden"
        )}
      >
        {/* Logo Section */}
        <div className="p-8 border-b border-white/5">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-950/20 group-hover:scale-110 transition-transform duration-300">
              <ShieldCheck className="w-6 h-6 text-black" />
            </div>
            <div>
              <span className="text-xl font-bold text-white tracking-tighter">Certifi</span>
              <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest leading-none mt-1">Institutional</p>
            </div>
          </Link>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center p-3 rounded-2xl transition-all duration-300 relative overflow-hidden",
                  isActive
                    ? "bg-green-500/10 text-white"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute left-0 top-2 bottom-2 w-1 bg-green-500 rounded-full"
                  />
                )}

                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center mr-4 transition-all duration-300",
                  isActive ? "bg-green-500 text-black shadow-lg shadow-green-950/20" : "bg-zinc-900/50 group-hover:bg-zinc-800"
                )}>
                  <item.icon className="w-5 h-5" />
                </div>

                <div className="flex-1">
                  <div className="text-sm font-bold tracking-tight">{item.name}</div>
                  <div className="text-[10px] text-zinc-500 font-medium group-hover:text-zinc-400 transition-colors uppercase tracking-wider mt-0.5">
                    {item.description}
                  </div>
                </div>

                {isActive && <ChevronRight className="w-4 h-4 text-green-500" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer Section */}
        <div className="p-6 border-t border-white/5 space-y-4">
          <button className="flex items-center w-full p-3 text-zinc-500 hover:text-white hover:bg-white/5 rounded-2xl transition-colors group">
            <div className="w-10 h-10 bg-zinc-900/50 rounded-xl flex items-center justify-center mr-4 group-hover:bg-zinc-800 transition-colors">
              <Settings className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold tracking-tight">Settings</span>
          </button>

          <button className="flex items-center w-full p-4 bg-zinc-900/40 border border-white/5 hover:bg-red-500/10 hover:border-red-500/20 rounded-2xl transition-all group text-zinc-400 hover:text-red-400">
            <LogOut className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-bold tracking-tight">Disconnect</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
};
