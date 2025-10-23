import React from 'react';
import { ArrowUpRight } from 'lucide-react';

const Services = () => {
  const services = [
    { 
      title: 'Certificate Issuance', 
      description: 'Issue tamper-proof digital certificates on the blockchain. Bulk upload hundreds of credentials at once or create individual certificates with our intuitive platform.' 
    },
    { 
      title: 'Instant Verification', 
      description: 'Verify any credential in under 3 seconds. Search by certificate ID, scan QR codes, or search by student name—get blockchain-verified results instantly.' 
    },
    { 
      title: 'Institution Onboarding', 
      description: 'Get your university, polytechnic, or college verified and onboarded in days. We handle the setup so you can start issuing certificates immediately.' 
    },
    { 
      title: 'Employer Dashboard', 
      description: 'Access powerful verification tools built for HR teams. Track verification history, perform bulk checks via API, and eliminate hiring risks.' 
    },
    { 
      title: 'Student Digital Wallet', 
      description: 'Students receive secure digital credentials they can share instantly with employers. Download certificates, generate QR codes, and control who sees your credentials.' 
    },
    { 
      title: 'Custom Integration & API', 
      description: 'Integrate CredChain into your existing systems. Our robust API connects with HR platforms, background check services, and student management systems.' 
    },
  ];

  return (
    <section className="relative bg-black overflow-hidden min-h-screen justify-center items-center flex py-12 sm:py-16 lg:py-20">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-15%] left-[-10%] w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] lg:w-[700px] lg:h-[700px]">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-green-600/10 to-transparent blur-3xl transform -rotate-45"></div>
        </div>
        <div className="absolute top-[-5%] right-[-15%] w-[500px] h-[400px] sm:w-[600px] sm:h-[500px] lg:w-[800px] lg:h-[600px]">
          <div className="absolute inset-0 bg-gradient-to-bl from-green-400/25 via-green-500/15 to-transparent rounded-[40%] blur-2xl transform rotate-12"></div>
        </div>
      </div>
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <div className="inline-block bg-gradient-to-br from-zinc-800/60 to-zinc-900/60 border border-green-500/50 rounded-lg px-4 sm:px-6 py-2 mb-6 sm:mb-8">
            <span className="text-white text-xs sm:text-sm font-medium tracking-wide">Our Solutions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
            <span className="text-green-400">End Certificate Fraud with</span><br />
            <span className="text-green-400">Blockchain-Powered Verification</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto mt-12 sm:mt-16 lg:mt-20">
          {services.map((service, index) => (
            <div key={index} className="bg-gradient-to-br from-zinc-900/70 to-black/90 border border-zinc-800/60 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 hover:border-green-500/40 transition-all duration-300 flex flex-col">
              <div className="mb-6 sm:mb-8 flex-1">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">{service.title}</h3>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">{service.description}</p>
              </div>
              <div className="flex justify-center">
                <button className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-zinc-800/70 border border-zinc-700/60 rounded-full text-white font-medium text-xs sm:text-sm hover:border-green-500/60 hover:bg-zinc-800 transition-all duration-300">
                  See More
                  <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                    <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 text-black" />
                  </div>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;