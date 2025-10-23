import React from 'react';
import Hero from './Hero';
import Services from './Services';
import Testimonials from './Testimonials';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-black">
      <Hero />
      <div className=" ">
        <Services />
        <Testimonials />
      </div>
    </div>
  );
};

export default HomePage;
