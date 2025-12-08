import React from 'react';
import Hero from './Hero';
import Services from './Services';
import Testimonials from './Testimonials';
import CertificateVerification from './CertificateVerification';

const HomePage = () => {
  return (
    <div className="bg-black flex flex-col gap-32 pb-32">
      <Hero />
      <Services />
      <CertificateVerification />
      <Testimonials />
    </div>
  );
};

export default HomePage;
