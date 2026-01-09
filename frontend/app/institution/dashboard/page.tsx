/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Award,
  Settings,
  Plus,
  User,
  LogOut,
  Eye,
  Users,
  XCircle,
  Building2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { institutionStore, InstitutionData } from '../../lib/institutionStore';
import { Sidebar } from '../../components/Sidebar';
import AnalyticsGrid from '../../components/dashboard/AnalyticsGrid';
import InstitutionProfile from '../../components/dashboard/InstitutionProfile';
import ContactInfo from '../../components/dashboard/ContactInfo';
import LegalDocs from '../../components/dashboard/LegalDocs';
import RecentActivity from '../../components/dashboard/RecentActivity';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const InstitutionDashboard = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('issue-certificates');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [institutionData, setInstitutionData] = useState<InstitutionData | null>(null);

  const sidebarItems = [
    { id: 'issue-certificates', label: 'Issue certificates', icon: Plus, route: '/institution/issue-certificate' },
    { id: 'view-certificates', label: 'View certificates details', icon: Eye, route: '/institution/view-certificates' },
    { id: 'issue-multiple', label: 'Issue multiple certificates', icon: Users, route: '/institution/issue-multiple-certificates' },
    { id: 'revoke-certificates', label: 'Revoke certificates', icon: XCircle, route: '/institution/revoke-certificate' },
    { id: 'settings', label: 'Settings', icon: Settings, route: '/institution/settings' },
  ];

  useEffect(() => {

    const data = institutionStore.getInstitutionData();
    setInstitutionData(data);
  }, []);

  const handleNavigation = (route: string) => {
    router.push(route);
  };


  return (
    <div className="h-screen bg-black flex overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />


      <div className="flex-1 flex flex-col overflow-hidden min-h-[600px]">

        <header className="bg-zinc-950/50 backdrop-blur-md border-b border-white/5">
          <div className="flex items-center justify-between h-16 px-6 ">
            <div className="flex  items-center space-x-4">
              <h1 className="text-xl sm:text-xl md:text-2xl lg:text-2xl xl:text-2xl xl:text-5xl font-bold leading-[1.1] tracking-tight">
                <span className="bg-gradient-to-r from-green-300 via-green-400 to-green-500 bg-clip-text text-transparent">
                  Dashboard
                </span>
              </h1>
            </div>


            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-black relative custom-scrollbar">
          {/* Background Decoration */}
          <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[120px] -z-10" />
          <div className="absolute bottom-1/4 left-0 w-[300px] h-[300px] bg-green-500/5 rounded-full blur-[100px] -z-10" />

          <div className="px-8 py-8 pt-10 flex items-center justify-center relative z-10">
            <div className="w-full max-w-6xl">
              {institutionData ? (
                <div className="space-y-8">
                  {/* Analytics Grid */}
                  <AnalyticsGrid />

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                      <InstitutionProfile data={institutionData} />
                      <ContactInfo data={institutionData} />
                    </div>
                    <div>
                      <RecentActivity />
                    </div>
                  </div>

                  <LegalDocs data={institutionData} />

                </div>
              ) : (
                <div className="bg-zinc-900/40 backdrop-blur-xl rounded-xl border border-white/5 p-12 text-center" >
                  <div className="w-20 h-20 bg-zinc-950/50 border border-white/5 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <Building2 className="w-10 h-10 text-zinc-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-3">No Institution Data</h2>
                  <p className="text-lg text-zinc-400 mb-10 max-w-sm mx-auto">
                    Please register your institution first to unlock your certificate management dashboard.
                  </p>
                  <button
                    onClick={() => router.push('/institution/register')}
                    className="bg-green-500 text-black px-10 py-4 rounded-lg hover:bg-green-400 transition-all text-lg font-bold shadow-lg shadow-green-900/20"
                  >
                    Register Institution
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default InstitutionDashboard;