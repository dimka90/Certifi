'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, TrendingUp } from 'lucide-react';
import { Button } from './ui/Button';
import { Container } from './ui/Container';

const Hero: React.FC = () => {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/institution/register');
  };

  return (
    <section className="relative min-h-screen bg-black overflow-hidden flex flex-col items-center justify-center pt-20 pb-12">
      {/* Gradient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-green-500/20 to-transparent blur-3xl" />
        <div className="absolute top-[10%] right-[-10%] w-[600px] h-[800px] bg-gradient-to-bl from-green-400/15 via-green-500/10 to-transparent rounded-[40%] blur-2xl transform rotate-12" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-green-600/20 via-green-500/15 to-transparent blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full">
        <Container>
          <div className="flex flex-col items-center text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-br from-zinc-800/60 to-zinc-900/60 border border-green-500/50">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-green-400">
                Stop Certificate Fraud
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-4 max-w-4xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight">
                Stop Certificate Fraud.
              </h1>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold bg-gradient-to-r from-green-300 via-green-400 to-green-500 bg-clip-text text-transparent leading-tight">
                Verify in 3 Seconds.
              </h2>
            </div>

            {/* Description */}
            <p className="text-gray-400 text-base sm:text-lg lg:text-xl max-w-3xl leading-relaxed">
              Certifi is the blockchain-powered platform that helps institutions issue unforgeable digital certificates and enables employers to instantly verify credentials. No more fake certificates. No more weeks of waiting. Just instant, immutable proof.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8">
              <Button
                variant="primary"
                size="lg"
                onClick={handleGetStarted}
                className="text-lg"
              >
                Get Started
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={handleGetStarted}
                className="text-lg"
              >
                Explore Solution
                <ArrowUpRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
};

export default Hero;