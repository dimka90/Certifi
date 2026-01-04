'use client';

import React, { useState } from 'react';
import { Search, Loader2, ArrowUpRight } from 'lucide-react';
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
    await new Promise((resolve) => setTimeout(resolve, 800));
    router.push(`/verify/${certificateId}`);
  };

  return (
    <Section padding="xl" className="relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-green-500/5 rounded-full blur-[120px] -z-10 animate-pulse" />

      <div className="w-full px-4 sm:px-6 lg:px-8 mx-auto max-w-5xl">
        <div className="glass-card rounded-[2.5rem] p-1 md:p-2 shadow-2xl overflow-hidden group">
          <div className="bg-zinc-950/40 backdrop-blur-3xl rounded-[2.2rem] p-8 md:p-16 space-y-12 relative overflow-hidden">
            {/* Inner Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -z-10 group-hover:bg-green-500/20 transition-colors duration-700" />

            <div className="text-center space-y-6 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4">
                Verify Credential
              </div>
              <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tighter">
                Proof of <span className="text-gradient-green">Authenticity</span>
              </h2>
              <p className="text-zinc-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                Connect to the immutable ledger to validate academic and professional certificates in real-time.
              </p>
            </div>

            <form onSubmit={handleSearch} className="max-w-3xl mx-auto relative z-10">
              <div className="relative group/input">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-[1.5rem] opacity-20 group-hover/input:opacity-40 blur transition duration-1000 group-focus-within/input:opacity-100 group-focus-within/input:duration-200" />

                <div className="relative flex flex-col sm:flex-row gap-3 p-3 bg-zinc-950 rounded-[1.4rem] border border-white/5 ring-1 ring-white/10">
                  <div className="relative flex-1">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600">
                      <Search className="w-5 h-5 group-focus-within/input:text-green-500 transition-colors" />
                    </div>
                    <input
                      type="text"
                      placeholder="Paste Certificate ID..."
                      value={certificateId}
                      onChange={(e) => setCertificateId(e.target.value)}
                      disabled={isSearching}
                      className="w-full h-14 pl-14 pr-4 bg-transparent border-none text-white placeholder-zinc-700 focus:outline-none focus:ring-0 text-lg font-mono"
                      aria-label="Certificate ID"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!certificateId.trim() || isSearching}
                    className="h-14 px-10 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:hover:bg-green-600 text-black font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-green-950/20 active:scale-[0.98]"
                  >
                    {isSearching ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Validating...
                      </>
                    ) : (
                      <>
                        Validate
                        <ArrowUpRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
                {[
                  { label: "Instant Validation", icon: "⚡" },
                  { label: "Blockchain Protocol", icon: "⛓️" },
                  { label: "Zero Fraud", icon: "🛡️" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-bold text-zinc-600 uppercase tracking-widest">
                    <span className="text-base">{item.icon}</span>
                    {item.label}
                  </div>
                ))}
              </div>
            </form>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default CertificateVerification;
