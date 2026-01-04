'use client';

import React from 'react';
import { Lock, Zap, Globe } from 'lucide-react';
import { Section } from './ui/Section';
import { Card, CardContent } from './ui/Card';
import { motion } from 'framer-motion';

interface Service {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SERVICES: Service[] = [
  {
    title: 'Immutable Records',
    description: 'Certificates stored on blockchain cannot be forged, altered, or deleted. Permanent, cryptographically secured records.',
    icon: Lock,
  },
  {
    title: 'Instant Verification',
    description: 'Verify any credential in under 3 seconds. No waiting, no manual processes, just instant blockchain verification.',
    icon: Zap,
  },
  {
    title: 'Global Access',
    description: 'Available 24/7 worldwide with no geographic restrictions. Accessible from anywhere, anytime.',
    icon: Globe,
  },
];

const ServiceCard: React.FC<{ service: Service; index: number }> = ({ service, index }) => {
  const Icon = service.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="group hover:border-green-500/50 hover:bg-zinc-900/50 transition-all duration-300 h-full backdrop-blur-sm border-white/5">
        <CardContent className="pt-10 flex flex-col h-full">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 mx-auto ring-1 ring-green-500/20 group-hover:ring-green-500/50">
            <Icon className="w-8 h-8 text-green-400 group-hover:text-green-300 transition-colors" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4 text-center group-hover:text-green-400 transition-colors">{service.title}</h3>
          <p className="text-gray-400 text-base leading-relaxed flex-grow text-center group-hover:text-gray-300 transition-colors">{service.description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const Services: React.FC = () => {
  return (
    <Section padding="xl" className="relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] -z-10" />

      <div className="w-full px-4 sm:px-6 lg:px-8 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-24 relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium mb-8">
            Our Platform Pillars
          </div>
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
            Trust at <span className="text-gradient-green">Internet Scale</span>
          </h2>
          <p className="text-zinc-500 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Revolutionizing academic and professional credentials with immutable blockchain technology.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-7xl mx-auto">
          {SERVICES.map((service, index) => (
            <ServiceCard key={index} service={service} index={index} />
          ))}
        </div>
      </div>
    </Section>
  );
};

export default Services;