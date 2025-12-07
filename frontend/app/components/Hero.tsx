'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Shield } from 'lucide-react';
import { Button } from './ui/Button';

const Hero: React.FC = () => {
  const router = useRouter();

  return (
    <section className="relative bg-black overflow-hidden w-full">
      {/* Gradient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/15 rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 mb-8">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-green-400">
              Blockchain-Powered Verification
            </span>
          </div>

          {/* Main Headline */}
          <div className="space-y-8 text-center max-w-5xl mb-12">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-tight tracking-tight">
              Instant
              <span className="block bg-gradient-to-r from-green-400 via-green-500 to-emerald-400 bg-clip-text text-transparent">
                Credential Verification
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 leading-relaxed">
              Stop certificate fraud. Verify academic credentials in seconds with blockchain-powered immutability. Trusted by institutions and employers worldwide.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-20">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => router.push('/institution/register')}
            >
              Get Started
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push('/verify')}
            >
              Verify Certificate
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 sm:gap-12 pt-12 border-t border-zinc-800/50 max-w-2xl">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-green-400">3s</div>
              <p className="text-xs sm:text-sm text-gray-400 mt-3 font-medium">Verification Time</p>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-green-400">100%</div>
              <p className="text-xs sm:text-sm text-gray-400 mt-3 font-medium">Tamper-Proof</p>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-green-400">24/7</div>
              <p className="text-xs sm:text-sm text-gray-400 mt-3 font-medium">Global Access</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;