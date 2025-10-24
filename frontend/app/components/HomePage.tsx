import React from 'react';
import Hero from './Hero';
import Services from './Services';
import Testimonials from './Testimonials';

const HomePage = () => {
  return (
    <div className="bg-black">
      <Hero />
      <Services />
      <Testimonials />
    </div>
  );
};

export default HomePage;
