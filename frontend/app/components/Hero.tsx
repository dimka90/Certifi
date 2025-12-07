'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Shield, Zap, Globe } from 'lucide-react';
import { Button } from './ui/Button';
import { Container } from './ui/Container';

const Hero: React.FC = () => {
  const router = useRouter();

  return (
    <section className="relative bg-black overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-400/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full">
        <Container>
          <div className="min-h-screen flex flex-col items-center justify-center py-20 space-y-12">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-green-400">
                Blockchain-Powered Verification
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-6 text-center max-w-4xl">
              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold text-white leading-tight">
                Instant
                <span className="block bg-gradient-to-r from-green-400 to-green-500 bg-clip-text text-transparent">
                  Credential Verification
                </span>
              </h1>
              <p className="text-gray-400 text-xl sm:text-2xl leading-relaxed max-w-3xl mx-auto">
                Stop certificate fraud. Verify academic credentials in seconds with blockchain-powered immutability.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
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
            <div className="grid grid-cols-3 gap-8 pt-12 border-t border-zinc-800 w-full max-w-2xl">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400">3s</div>
                <p className="text-sm text-gray-400 mt-3">Verification Time</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400">100%</div>
                <p className="text-sm text-gray-400 mt-3">Tamper-Proof</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400">24/7</div>
                <p className="text-sm text-gray-400 mt-3">Global Access</p>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
};

export default Hero;