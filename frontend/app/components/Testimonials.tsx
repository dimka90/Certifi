  /* eslint-disable react/no-unescaped-entities */
  import React from 'react';
  import { ArrowUpRight } from 'lucide-react';

  const Testimonials = () => {
    const testimonials = [
      { 
        name: 'Prof. Chukwuma Okonkwo', 
        position: 'Registrar, University of Lagos', 
        content: 'CredChain eliminated our verification backlog completely. We now issue certificates in minutes, and employers verify them instantly. Our reputation for authentic credentials has never been stronger.' 
      },
      { 
        name: 'Adaobi Nwosu', 
        position: 'HR Director, FirstBank Nigeria', 
        content: 'We used to wait 3-6 weeks for credential verification. With CredChain, we verify candidates in seconds. This has cut our hiring time by 40% and eliminated fake certificate risks entirely.' 
      },
      { 
        name: 'Dr. Ibrahim Musa', 
        position: 'Vice Chancellor, Ahmadu Bello University', 
        content: 'In our first month on CredChain, we issued 5,000 tamper-proof certificates. The blockchain verification gives our graduates credibility anywhere in the world. This is the future of credentials.' 
      },
    ];

    return (
    <section className="min-h-screen justify-center items-center flex pb-12 sm:pb-16 lg:pb-20 mx-auto bg-black py-12 sm:py-16 lg:py-20">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <div className="inline-block bg-gradient-to-br from-zinc-800/60 to-zinc-900/60 border border-green-500/50 rounded-lg px-4 sm:px-6 py-2 mb-6 sm:mb-8">
            <span className=" text-3xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-medium tracking-wide text-green-500">Success Stories</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-2xl lg:text-3xl xl:text-4xl font-bold py-12" style={{ marginTop: '16px' }}>
            <span className="text-green-400">Why Institutions and Employers<br className="sm:hidden" />
            Choose Certifi?</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16 lg:mb-20 max-w-6xl mx-auto mt-12 sm:mt-16 lg:mt-20" style={{ marginTop: '20px' }}>
          {testimonials.map((testimonial, index) => (
            <div key={index} className="relative bg-gradient-to-br from-zinc-900/60 to-zinc-950/80 border border-zinc-800/50 rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-10 w-full sm:w-80 h-96 flex flex-col items-center text-center shadow-lg">
              <div className="absolute top-2 left-2 sm:-top-3 sm:-left-6 lg:-top-6 lg:-left-12 w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center z-10">
                <span className="text-black text-sm sm:text-lg lg:text-2xl font-bold">"</span>
              </div>
              <div className="pt-2 sm:pt-2 lg:pt-4 flex-1 flex flex-col justify-center">
                <div className="mb-3 sm:mb-4">
                  <h4 className="text-white font-bold text-base sm:text-lg mb-1">{testimonial.name}</h4>
                  <p className="text-gray-400 text-xs sm:text-sm">{testimonial.position}</p>
                </div>
                <div className="flex gap-1 mb-4 sm:mb-6 justify-center">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-300 text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed">{testimonial.content}</p>
              </div>
              <div className="absolute bottom-2 right-2 sm:-bottom-3 sm:-right-6 lg:-bottom-6 lg:-right-2 w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center z-10">
                <span className="text-black text-sm sm:text-lg lg:text-2xl font-bold">"</span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mt-8 sm:mt-12" style={{ marginTop: '40px' }}>
          <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3 bg-background-card border-2 border-green-500 rounded-full text-white font-semibold text-xl sm:text-xl flex items-center justify-center gap-2 hover:border-green-400 transition-all duration-300">
            View More
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
              <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 text-black" />
            </div>
          </button>
        </div>
            
        </div>
      </section>
    );
  };

  export default Testimonials;