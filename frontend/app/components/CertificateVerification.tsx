'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';

const CertificateVerification = () => {
  const [certificateId, setCertificateId] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certificateId.trim()) return;
    
    setIsSearching(true);

    setTimeout(() => {
      setIsSearching(false);
     
      window.location.href = `/verify/${certificateId}`;
    }, 1000);
  };

  return (
    <section className="py-20 bg-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-zinc-900/60 to-zinc-950/80 backdrop-blur-sm rounded-2xl p-8 border border-zinc-800/50">
          <div className="text-center pb-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Verify Certificate
            </h2>
            <p className="text-gray-300 text-lg">
              Enter a certificate ID to verify its authenticity and view details
            </p>
          </div>
          
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Enter Certificate ID"
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800/60 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>
              <button 
                type="submit" 
                disabled={!certificateId.trim() || isSearching}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-black font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSearching ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Verify Certificate
                  </>
                )}
              </button>
            </div>
            
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                Certificate verification is powered by blockchain technology for maximum security and authenticity.
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default CertificateVerification;
