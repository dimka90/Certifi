"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';

const Hero = () => {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/institution/register');
  };

  const handleExploreSolution = () => {
    router.push('/institution/register');
  };

  return (
    <section className="relative min-h-screen bg-black overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-green-500/20 to-transparent blur-3xl"></div>
        <div className="absolute top-[10%] right-[-10%] w-[600px] h-[800px]">
          <div className="absolute inset-0 bg-gradient-to-bl from-green-400/15 via-green-500/10 to-transparent rounded-[40%] blur-2xl transform rotate-12"></div>
        </div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-green-600/20 via-green-500/15 to-transparent blur-3xl"></div>
      </div>
      <div className="relative z-10 flex flex-col items-center min-h-screen px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-24">
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30">
              <svg width="14" height="14" className="sm:w-4 sm:h-4" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M5 8l3-3 3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black"/>
              </svg>
            </div>
            <span className="text-gray-200 text-xs sm:text-sm md:text-base font-medium tracking-wide">
            Stop Certificate Fraud.
            </span>
          </div>
          <div className="text-center mb-6 sm:mb-8 max-w-6xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-white leading-[1.1] tracking-tight mb-2 sm:mb-3">
            Stop Certificate Fraud.
            </h1>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold leading-[1.1] tracking-tight">
              <span className="bg-gradient-to-r from-green-300 via-green-400 to-green-500 bg-clip-text text-transparent">
                Verify in 3 Seconds.
              </span>
            </h1>
          </div>
          <p className="text-gray-400 text-sm sm:text-base md:text-lg lg:text-xl text-center max-w-4xl mb-8 sm:mb-12 leading-relaxed px-2 sm:px-4">
          Certifi is the blockchain-powered platform that helps various Institutions issue unforgeable 
          digital certificates and enables employers to instantly verify credentials. No more fake certificates. 
          No more weeks of waiting. Just instant, immutable proof.  
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pb-12 sm:pb-16 lg:pb-20 w-full max-w-4xl mx-auto "  style={{ paddingBottom: '150px' }} >
          <button 
            onClick={handleGetStarted}
            className="w-full sm:w-auto px-8 sm:px-10 md:px-12 lg:px-16 py-10 sm:py-5 md:py-6 lg:py-16 lg:px-16 bg-black border-2 border-green-500 rounded-full text-white font-semibold text-2xl sm:text-2xl lg:text-5xl hover:bg-green-500/5 transition-all duration-300 shadow-lg shadow-green-500/10 hover:shadow-green-500/30 cursor-pointer"
          >
            Get Started
          </button>
          <button 
            onClick={handleExploreSolution}
            className="w-full sm:w-auto px-8 sm:px-10 md:px-12 lg:px-16 py-4 sm:py-5 md:py-6 bg-black border-2 border-green-500 rounded-full text-white font-semibold text-2xl sm:text-2xl lg:text-5xl hover:bg-green-500/5 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-green-500/10 hover:shadow-green-500/30 cursor-pointer"
          >
            Explore Our Solution
            <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;