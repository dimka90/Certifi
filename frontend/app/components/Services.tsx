import React from 'react';
import { Shield, Zap, Users } from 'lucide-react';
import { Section } from './ui/Section';
import { Container } from './ui/Container';
import { Card, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';

interface Service {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SERVICES: Service[] = [
  {
    title: 'Tamper-Proof',
    description: 'Certificates stored on Base blockchain - impossible to forge or alter',
    icon: Shield,
  },
  {
    title: 'Instant Verification',
    description: 'Verify any certificate in under 3 seconds via ID or QR code',
    icon: Zap,
  },
  {
    title: 'Complete Ecosystem',
    description: 'Institutions issue, students own, employers verify - seamlessly',
    icon: Users,
  },
];

const ServiceCard: React.FC<{ service: Service }> = ({ service }) => {
  const Icon = service.icon;
  return (
    <Card className="relative overflow-hidden group hover:border-green-500/50 transition-all duration-300">
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center z-10 group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-6 h-6 text-black" />
      </div>
      <CardContent className="pt-12">
        <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{service.description}</p>
      </CardContent>
    </Card>
  );
};

const Services: React.FC = () => {
  return (
    <Section padding="lg">
      <Container>
        <div className="text-center mb-12">
          <Badge variant="default" className="mb-4 justify-center w-full sm:w-auto">
            OUR SOLUTION
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-6">
            Blockchain-Powered
            <span className="block text-green-400">Credential Verification</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {SERVICES.map((service, index) => (
            <ServiceCard key={index} service={service} />
          ))}
        </div>
      </Container>
    </Section>
  );
};

export default Services;