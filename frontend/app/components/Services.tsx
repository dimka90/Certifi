import React from 'react';
import { Lock, Zap, Globe } from 'lucide-react';
import { Section } from './ui/Section';
import { Container } from './ui/Container';
import { Card, CardContent } from './ui/Card';

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

const ServiceCard: React.FC<{ service: Service }> = ({ service }) => {
  const Icon = service.icon;
  return (
    <Card className="group hover:border-green-500/50 transition-all duration-300 h-full">
      <CardContent className="pt-10 flex flex-col h-full">
        <div className="w-16 h-16 bg-green-500/10 rounded-xl flex items-center justify-center mb-8 group-hover:bg-green-500/20 transition-colors mx-auto">
          <Icon className="w-8 h-8 text-green-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-4 text-center">{service.title}</h3>
        <p className="text-gray-400 text-base leading-relaxed flex-grow text-center">{service.description}</p>
      </CardContent>
    </Card>
  );
};

const Services: React.FC = () => {
  return (
    <Section padding="lg">
      <Container>
        <div className="text-center mb-20">
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6">
            Why Choose
            <span className="block text-green-400">Certifi?</span>
          </h2>
          <p className="text-gray-400 text-lg sm:text-xl max-w-3xl mx-auto">
            Built on blockchain technology for maximum security, speed, and reliability
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {SERVICES.map((service, index) => (
            <ServiceCard key={index} service={service} />
          ))}
        </div>
      </Container>
    </Section>
  );
};

export default Services;