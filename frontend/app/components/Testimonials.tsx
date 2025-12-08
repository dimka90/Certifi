'use client';

import React from 'react';
import { Star, Quote } from 'lucide-react';
import { Section } from './ui/Section';
import { Card, CardContent } from './ui/Card';
import { motion } from 'framer-motion';

interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Prof. Chukwuma Okonkwo',
    role: 'Registrar, University of Lagos',
    content: 'Certifi eliminated our verification backlog completely. We now issue certificates in minutes instead of weeks. Our reputation for authentic credentials has never been stronger.',
    rating: 5,
  },
  {
    name: 'Adaobi Nwosu',
    role: 'HR Director, FirstBank Nigeria',
    content: 'Verification time dropped from 3-6 weeks to seconds. This cut our hiring time by 40% and eliminated fake certificate risks entirely.',
    rating: 5,
  },
  {
    name: 'Dr. Ibrahim Musa',
    role: 'Vice Chancellor, Ahmadu Bello University',
    content: 'In our first month, we issued 5,000 tamper-proof certificates. The blockchain verification gives our graduates global credibility.',
    rating: 5,
  },
];

const TestimonialCard: React.FC<{ testimonial: Testimonial; index: number }> = ({ testimonial, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.2 }}
    className="h-full"
  >
    <Card className="h-full flex flex-col hover:border-green-500/50 hover:bg-zinc-900/50 transition-all duration-500 group relative overflow-hidden border-white/5">
      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
        <Quote className="w-24 h-24 text-green-500 transform rotate-12" />
      </div>

      <CardContent className="flex-1 flex flex-col justify-between pt-10 relative z-10">
        <div>
          <div className="flex gap-1 mb-6 justify-center">
            {Array.from({ length: testimonial.rating }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + (i * 0.1) }}
              >
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              </motion.div>
            ))}
          </div>
          <p className="text-gray-300 text-lg leading-relaxed text-center font-light italic">
            "{testimonial.content}"
          </p>
        </div>
        <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
          <p className="font-bold text-white text-lg group-hover:text-green-400 transition-colors">{testimonial.name}</p>
          <p className="text-sm text-gray-500 mt-2 font-medium uppercase tracking-wide">{testimonial.role}</p>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const Testimonials: React.FC = () => {
  return (
    <Section padding="xl" className="relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-green-900/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-900/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full px-4 sm:px-6 lg:px-8 mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
            Trusted by
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">Institutions & Employers</span>
          </h2>
          <p className="text-gray-400 text-lg sm:text-xl max-w-3xl mx-auto">
            See how Certifi is transforming credential verification across Africa
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {TESTIMONIALS.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} index={index} />
          ))}
        </div>
      </div>
    </Section>
  );
};

export default Testimonials;