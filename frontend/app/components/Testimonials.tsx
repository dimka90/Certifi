  import React from 'react';
import { Star } from 'lucide-react';
import { Section } from './ui/Section';
import { Container } from './ui/Container';
import { Card, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';

interface Testimonial {
  name: string;
  position: string;
  content: string;
  rating: number;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Prof. Chukwuma Okonkwo',
    position: 'Registrar, University of Lagos',
    content: 'Certifi eliminated our verification backlog completely. We now issue certificates in minutes, and employers verify them instantly.',
    rating: 5,
  },
  {
    name: 'Adaobi Nwosu',
    position: 'HR Director, FirstBank Nigeria',
    content: 'We verify candidates in seconds instead of 3-6 weeks. This has cut our hiring time by 40% and eliminated fake certificate risks.',
    rating: 5,
  },
  {
    name: 'Dr. Ibrahim Musa',
    position: 'Vice Chancellor, Ahmadu Bello University',
    content: 'In our first month, we issued 5,000 tamper-proof certificates. The blockchain verification gives our graduates global credibility.',
    rating: 5,
  },
];

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex gap-1">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-gray-600'
        }`}
      />
    ))}
  </div>
);

const TestimonialCard: React.FC<{ testimonial: Testimonial }> = ({ testimonial }) => (
  <Card className="h-full flex flex-col">
    <CardContent className="flex-1 flex flex-col justify-between">
      <div>
        <StarRating rating={testimonial.rating} />
        <p className="text-gray-300 mt-4 leading-relaxed text-sm">
          &quot;{testimonial.content}&quot;
        </p>
      </div>
      <div className="mt-6 pt-6 border-t border-zinc-700">
        <p className="font-semibold text-white">{testimonial.name}</p>
        <p className="text-xs text-gray-400 mt-1">{testimonial.position}</p>
      </div>
    </CardContent>
  </Card>
);

const Testimonials: React.FC = () => {
  return (
    <Section padding="lg">
      <Container>
        <div className="text-center mb-12">
          <Badge variant="default" className="mb-4 justify-center w-full sm:w-auto">
            Success Stories
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-6">
            Why Institutions and Employers
            <span className="block text-green-400">Choose Certifi</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {TESTIMONIALS.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </div>
      </Container>
    </Section>
  );
};

export default Testimonials;