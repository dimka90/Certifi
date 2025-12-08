'use client';

import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Section } from './ui/Section';
import { Container } from './ui/Container';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';

const CertificateVerification: React.FC = () => {
  const [certificateId, setCertificateId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certificateId.trim()) return;

    setIsSearching(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    router.push(`/verify/${certificateId}`);
  };

  return (
    <Section padding="xl" className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-[100px] -z-10" />

      <div className="w-full px-4 sm:px-6 lg:px-8 mx-auto max-w-4xl">
        <Card className="border-green-500/20 bg-zinc-900/40 backdrop-blur-xl shadow-2xl">
          <CardContent className="space-y-12 pt-16 pb-16 px-6 sm:px-12">
            <div className="text-center space-y-6">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">
                Verify a Certificate
              </h2>
              <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
                Enter a certificate ID below to instantly verify its authenticity on the blockchain.
              </p>
            </div>

            <form onSubmit={handleSearch} className="space-y-8 max-w-3xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4 p-2 bg-zinc-800/50 rounded-2xl border border-zinc-700/50 hover:border-green-500/30 transition-colors">
                <div className="relative flex-1">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter Certificate ID (e.g., CRT-12345678)"
                    value={certificateId}
                    onChange={(e) => setCertificateId(e.target.value)}
                    disabled={isSearching}
                    className="w-full h-14 pl-12 pr-4 bg-transparent border-none text-white placeholder-gray-500 focus:outline-none focus:ring-0 text-lg"
                    aria-label="Certificate ID"
                  />
                </div>
                <Button
                  type="submit"
                  variant="secondary"
                  size="lg"
                  disabled={!certificateId.trim() || isSearching}
                  className="h-14 px-8 min-w-[140px] rounded-xl text-lg font-semibold shadow-lg shadow-green-900/20"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Checking...
                    </>
                  ) : (
                    'Verify Now'
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>Powered by secure blockchain technology</span>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Section>
  );
};

export default CertificateVerification;
