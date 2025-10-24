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
    <div className="h-screen bg-gray-100 flex">
     
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700 flex-shrink-0">
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
                    className={`w-full flex items-center space-x-3 px-4 py-4 rounded-lg text-left transition-colors ${
                      activeTab === item.id
                        ? 'bg-green-500 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </div>
              );
            })}
          </div>

         
          <div className="pt-6 border-t border-gray-700">
            <button className="w-full flex items-center space-x-3 px-4 py-4 rounded-lg text-left transition-colors text-red-400 hover:bg-red-900/20 hover:text-red-300">
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

    
      <div className="flex-1 flex flex-col overflow-hidden min-h-[600px] mx-8 rounded-lg">
      
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6 ">
            <div className="flex  items-center space-x-4">
              <h1 className="text-xl sm:text-xl md:text-2xl lg:text-2xl xl:text-2xl xl:text-5xl font-bold leading-[1.1] tracking-tight">
                <span className="bg-gradient-to-r from-green-300 via-green-400 to-green-500 bg-clip-text text-transparent">
                  Dashboard
                </span>
              </h1>
            </div>
            
          
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50" style={{ marginTop: '28px' }}>
          <div className="px-8 py-8 pt-16 flex items-center justify-center">
            <div className="w-full max-w-6xl">
              {institutionData ? (
                <div className="space-y-6">
               
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Institution Overview</h2>
                        <p className="text-base text-gray-600">Your registered institution details</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Institution Name</h3>
                        <p className="text-base text-gray-700">{institutionData.institutionName}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Institution ID</h3>
                        <p className="text-base text-gray-700">{institutionData.institutionID}</p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                        <MapPin className="w-5 h-5 mr-2 text-green-500" />
                        Country
                      </h3>
                      <p className="text-base text-gray-700">{institutionData.country}</p>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Institution Type</h3>
                      <p className="text-base text-gray-700">
                        {institutionData.institutionType === 0 ? 'University' :
                         institutionData.institutionType === 1 ? 'College' :
                         institutionData.institutionType === 2 ? 'School' :
                         institutionData.institutionType === 3 ? 'Training Center' : 'Other'}
                      </p>
                    </div>
                  </div>

              
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Mail className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
                        <p className="text-base text-gray-600">Your institution contact details</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                          <Mail className="w-5 h-5 mr-2 text-green-500" />
                          Email
                        </h3>
                        <p className="text-base text-gray-700">{institutionData.email}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                          <Hash className="w-5 h-5 mr-2 text-green-500" />
                          Wallet Address
                        </h3>
                        <p className="text-base text-gray-700 font-mono bg-gray-100 px-3 py-2 rounded">
                          {institutionData.walletAddress || 'Not available'}
                        </p>
                      </div>
                    </div>

                  </div>

              
                  {institutionData.registrationDocument && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                          <FileText className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">Registration Document</h2>
                          <p className="text-base text-gray-600">Your uploaded registration document</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Document Name</h3>
                          <p className="text-base text-gray-700">{institutionData.registrationDocument.name}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                            <Hash className="w-5 h-5 mr-2 text-green-500" />
                            IPFS Hash
                          </h3>
                          <p className="text-base text-gray-700 font-mono bg-gray-100 px-3 py-2 rounded">
                            {institutionData.registrationDocument.hash}
                          </p>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Document Size</h3>
                          <p className="text-base text-gray-700">
                            {(institutionData.registrationDocument.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>

                        <div>
                          <a 
                            href={institutionData.registrationDocument.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            View Document
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center" >
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-8 h-8 text-gray-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">No Institution Data</h2>
                  <p className="text-base text-gray-600 mb-10">
                    Please register your institution first to view your dashboard.
                  </p>
                  <button 
                    onClick={() => router.push('/institution/register')}
                    className="bg-gradient-to-r from-green-300 via-green-400 to-green-500 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition-colors text-lg font-medium"
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