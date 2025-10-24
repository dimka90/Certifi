import React from 'react';
import { ArrowUpRight, Shield, Zap, Users } from 'lucide-react';

const Services = () => {
  const services = [
    { 
      title: 'Tamper-Proof', 
      description: 'Certificates stored on Base blockchain - impossible to forge or alter',
      icon: Shield
    },
    { 
      title: 'Instant Verification', 
      description: 'Verify any certificate in under 3 seconds via ID or QR code',
      icon: Zap
    },
    { 
      title: 'Complete Ecosystem', 
      description: 'Institutions issue, students own, employers verify - seamlessly',
      icon: Users
    },
  ];

  return (
    <section className="relative bg-black flex items-center justify-center py-8 sm:py-16">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8">
        {/* Section Title */}
        <div className="flex justify-center items-center mb-4 sm:mb-6 lg:mb-8">
          <div className="bg-gradient-to-br from-zinc-800/60 to-zinc-900/60 border border-green-500/50 rounded-lg px-3 sm:px-4 lg:px-6 py-1 sm:py-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-green-500 uppercase tracking-wide">
              OUR SOLUTION
            </h2>
          </div>
        </div>
        
        {/* Cards Grid - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 justify-items-center mt-8 sm:mt-12 lg:mt-16" style={{ marginTop: '40px' }}>
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div key={index} className="relative bg-gradient-to-br from-zinc-800/60 to-zinc-900/60 rounded-xl p-4 sm:p-6 lg:p-8 w-full max-w-sm sm:w-80 h-80 sm:h-96 flex flex-col items-center text-center shadow-lg">
                {/* Icon Container - Overlapping Circle */}
                <div className="absolute -top-4 sm:-top-6 w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center z-10">
                  <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" />
                </div>
                
                {/* Card Content */}
                <div className="pt-6 sm:pt-8 flex-1 flex flex-col justify-center">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-3 sm:mb-4">
                    {service.title}
                  </h3>
                  <p className="text-gray-200 text-sm sm:text-base leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;