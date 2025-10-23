'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  Bookmark, 
  Award, 
  XCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useState } from 'react';

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className }: SidebarProps) => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/institution/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Issue Single Certificate',
      href: '/institution/dashboard/issue-single',
      icon: FileText,
    },
    {
      name: 'Issue Batch Certificates',
      href: '/institution/dashboard/issue-batch',
      icon: FileText,
    },
    {
      name: 'View All Certificates',
      href: '/institution/dashboard/certificates',
      icon: Bookmark,
    },
    {
      name: 'View Single Certificate',
      href: '/institution/dashboard/certificate',
      icon: Award,
    },
    {
      name: 'Revoke Certificates',
      href: '/institution/dashboard/revoke',
      icon: XCircle,
    },
  ];

  return (
    <div className={cn(
      'bg-dark-800 border-r border-dark-300 flex flex-col transition-all duration-300',
      isCollapsed ? 'w-16' : 'w-64',
      className
    )}>
      {/* Header */}
      <div className="p-4 border-b border-dark-300">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="text-white font-bold text-lg">DeSci Agent Network</h2>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded hover:bg-dark-700 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-white" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors group',
                    isActive 
                      ? 'bg-primary-500 text-white' 
                      : 'text-gray-300 hover:bg-dark-700 hover:text-white'
                  )}
                >
                  <Icon className={cn(
                    'w-5 h-5 flex-shrink-0',
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                  )} />
                  {!isCollapsed && (
                    <span className="text-sm font-medium">{item.name}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-dark-300">
          <div className="text-xs text-gray-400">
            Institution Dashboard
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
