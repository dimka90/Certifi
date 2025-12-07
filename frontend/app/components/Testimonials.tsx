  import React from 'react';
import { Star } from 'lucide-react';
import { Section } from './ui/Section';
import { Card, CardContent } from './ui/Card';

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

const TestimonialCard: React.FC<{ testimonial: Testimonial }> = ({ testimonial }) => (
  <Card className="h-full flex flex-col hover:border-green-500/50 transition-all duration-300">
    <CardContent className="flex-1 flex flex-col justify-between pt-10">
      <div>
        <div className="flex gap-1 mb-6 justify-center">
          {Array.from({ length: testimonial.rating }).map((_, i) => (
            <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
        <p className="text-gray-300 text-base leading-relaxed text-center">
          "{testimonial.content}"
        </p>
      </div>
      <div className="mt-8 pt-6 border-t border-zinc-700 text-center">
        <p className="font-semibold text-white text-lg">{testimonial.name}</p>
        <p className="text-sm text-gray-400 mt-2">{testimonial.role}</p>
      </div>
    </CardContent>
  </Card>
);

const Testimonials: React.FC = () => {
  return (
    <Section padding="lg">
      <div className="w-full px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6">
            Trusted by
            <span className="block text-green-400">Institutions & Employers</span>
          </h2>
          <p className="text-gray-400 text-lg sm:text-xl max-w-3xl mx-auto">
            See how Certifi is transforming credential verification across Africa
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {TESTIMONIALS.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </Section>
  );
};

export default Testimonials;