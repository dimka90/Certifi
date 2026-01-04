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
  X,
  Building2,
  MapPin,
  Mail,
  FileText,
  Hash
} from 'lucide-react';
import { institutionStore, InstitutionData } from '../../lib/institutionStore';

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

      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-zinc-950 border-r border-white/5 text-white transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col shadow-2xl shadow-green-950/20`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl sm:text-xl md:text-2xl lg:text-2xl xl:text-2xl xl:text-5xl font-bold leading-[1.1] tracking-tight">
              <span className="bg-gradient-to-r from-green-300 via-green-400 to-green-500 bg-clip-text text-transparent">
                Certifi
              </span>
            </h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 flex flex-col justify-between px-4 py-6 ">
          <div className="flex-1 flex flex-col justify-between ">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="flex-1 flex items-center">
                  <button
                    onClick={() => handleNavigation(item.route)}
                    className={`w-full flex items-center space-x-3 px-4 py-4 rounded-lg text-left transition-all ${activeTab === item.id
                      ? 'bg-green-500 text-black font-bold shadow-lg shadow-green-500/20'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </div>
              );
            })}
          </div>


          <div className="pt-6 border-t border-white/5">
            <button className="w-full flex items-center space-x-3 px-4 py-4 rounded-lg text-left transition-colors text-red-400 hover:bg-red-500/10 hover:text-red-300">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </nav>
      </div>


      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}


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

        <main className="flex-1 overflow-y-auto bg-black relative">
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-green-500/5 rounded-full blur-[100px] -z-10" />

          <div className="px-8 py-8 pt-16 flex items-center justify-center relative z-10">
            <div className="w-full max-w-6xl">
              {institutionData ? (
                <div className="space-y-6">

                  <div className="glass-card rounded-2xl p-8 hover:scale-[1.01] transition-all duration-300">
                    <div className="flex items-center space-x-4 mb-8">
                      <div className="w-12 h-12 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-green-400" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Institution Overview</h2>
                        <p className="text-sm text-zinc-500">Your registered identification details</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-10">
                      <div>
                        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Institution Name</h3>
                        <p className="text-lg text-white font-semibold">{institutionData.institutionName}</p>
                      </div>

                      <div>
                        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Institution ID</h3>
                        <p className="text-lg text-white font-mono bg-white/5 px-2 py-1 rounded inline-block">{institutionData.institutionID}</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-10 mt-10">
                      <div>
                        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center">
                          <MapPin className="w-3 h-3 mr-2 text-green-500" />
                          Country
                        </h3>
                        <p className="text-lg text-white font-medium">{institutionData.country}</p>
                      </div>
                      <div>
                        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Institution Type</h3>
                        <div className="inline-flex items-center px-3 py-1 bg-green-500/10 text-green-400 rounded-lg text-sm font-bold border border-green-500/20 mt-1">
                          {institutionData.institutionType === 0 ? 'University' :
                            institutionData.institutionType === 1 ? 'College' :
                              institutionData.institutionType === 2 ? 'School' :
                                institutionData.institutionType === 3 ? 'Training Center' : 'Other'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card rounded-2xl p-8 hover:scale-[1.01] transition-all duration-300">
                    <div className="flex items-center space-x-4 mb-8">
                      <div className="w-12 h-12 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center">
                        <Mail className="w-6 h-6 text-green-400" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Contact Information</h2>
                        <p className="text-sm text-zinc-500">How we reach out to you</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-10">
                      <div>
                        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center">
                          <Mail className="w-3 h-3 mr-2 text-green-500" />
                          Email Address
                        </h3>
                        <p className="text-lg text-white font-medium break-all underline decoration-green-500/30 underline-offset-4">{institutionData.email}</p>
                      </div>

                      <div>
                        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center">
                          <Hash className="w-3 h-3 mr-2 text-green-500" />
                          Settlement Wallet
                        </h3>
                        <p className="text-xs text-white font-mono bg-zinc-950/80 border border-white/5 px-4 py-3 rounded-xl break-all shadow-inner">
                          {institutionData.walletAddress || 'Not available'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {institutionData.registrationDocument && (
                    <div className="glass-card rounded-2xl p-8 hover:scale-[1.01] transition-all duration-300">
                      <div className="flex items-center space-x-4 mb-8">
                        <div className="w-12 h-12 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center">
                          <FileText className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white tracking-tight">Legal Documentation</h2>
                          <p className="text-sm text-zinc-500">Your institution verification files</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-10">
                        <div className="space-y-8">
                          <div>
                            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Filename</h3>
                            <p className="text-lg text-white font-medium truncate">{institutionData.registrationDocument.name}</p>
                          </div>

                          <div>
                            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center">
                              <Hash className="w-3 h-3 mr-2 text-green-500" />
                              IPFS CONTENT ID
                            </h3>
                            <p className="text-[10px] text-zinc-400 font-mono bg-zinc-950/50 border border-white/5 px-3 py-2 rounded break-all">
                              {institutionData.registrationDocument.hash}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-8 flex flex-col justify-between">
                          <div>
                            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Storage Footprint</h3>
                            <p className="text-lg text-white font-medium">
                              {(institutionData.registrationDocument.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>

                          <div>
                            <a
                              href={institutionData.registrationDocument.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full inline-flex items-center justify-center px-6 py-4 bg-green-500 text-black font-bold rounded-xl hover:bg-green-400 transition-all shadow-lg shadow-green-950/20 group"
                            >
                              <FileText className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                              Inspect Source Document
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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