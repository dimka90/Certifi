'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Shield } from 'lucide-react';
import { Button } from './ui/Button';
import { motion } from 'framer-motion';

const Hero: React.FC = () => {
  const router = useRouter();

  return (
    <section className="relative bg-black overflow-hidden w-full min-h-screen flex items-center justify-center">
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
            rotate: [0, 90, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-500 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.2, 0.1],
            x: [0, 100, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 2 }}
          className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-emerald-400 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.15, 0.1],
            y: [0, -50, 0]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear", delay: 5 }}
          className="absolute bottom-0 left-1/3 w-[600px] h-[600px] bg-green-600 rounded-full blur-[140px]"
        />
      </div>

      {/* Grid Overlay for texture */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_90%)] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 flex flex-col items-center space-y-12">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 backdrop-blur-md"
        >
          <Shield className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium text-green-400">
            Blockchain-Powered Verification
          </span>
        </motion.div>

        {/* Main Headline */}
        <div className="space-y-6 text-center max-w-5xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.1] tracking-tight"
          >
            Instant
            <span className="block bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 bg-clip-text text-transparent pb-2">
              Credential Verification
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="text-lg sm:text-xl md:text-2xl text-gray-400 leading-relaxed max-w-3xl mx-auto"
          >
            Stop certificate fraud. Verify academic credentials in seconds with blockchain-powered immutability. Trusted by institutions and employers worldwide.
          </motion.p>
        </div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto justify-center"
        >
          <Button
            variant="secondary"
            size="xl"
            onClick={() => router.push('/institution/register')}
            className="min-w-[180px]"
          >
            Get Started
          </Button>
          <Button
            variant="primary"
            size="xl"
            onClick={() => router.push('/verify')}
            className="group min-w-[180px]"
          >
            Verify Certificate
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="grid grid-cols-3 gap-8 sm:gap-16 pt-12 border-t border-white/5 max-w-4xl w-full"
        >
          <div className="text-center group">
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-br from-green-400 to-emerald-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">3s</div>
            <p className="text-sm text-gray-500 mt-2 font-medium uppercase tracking-wider">Verification Time</p>
          </div>
          <div className="text-center group">
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-br from-green-400 to-emerald-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">100%</div>
            <p className="text-sm text-gray-500 mt-2 font-medium uppercase tracking-wider">Tamper-Proof</p>
          </div>
          <div className="text-center group">
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-br from-green-400 to-emerald-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">24/7</div>
            <p className="text-sm text-gray-500 mt-2 font-medium uppercase tracking-wider">Global Access</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;