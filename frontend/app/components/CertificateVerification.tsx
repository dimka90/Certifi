'use client';

import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Section } from './ui/Section';
import { Container } from './ui/Container';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';

const CertificateVerification: React.FC = () => {
  const [certificateId, setCertificateId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certificateId.trim()) return;

    setIsSearching(true);
    // Simulate verification delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    router.push(`/verify/${certificateId}`);
  };

  return (
    <Section padding="lg">
      <Container size="md">
        <Card>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Verify Certificate
              </h2>
              <p className="text-gray-400">
                Enter a certificate ID to verify its authenticity and view details
              </p>
            </div>

            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Enter Certificate ID"
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value)}
                  disabled={isSearching}
                  className="flex-1 px-4 py-3 bg-zinc-800/60 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors disabled:opacity-50"
                  aria-label="Certificate ID"
                />
                <Button
                  type="submit"
                  variant="secondary"
                  size="md"
                  disabled={!certificateId.trim() || isSearching}
                  className="whitespace-nowrap"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Verify
                    </>
                  )}
                </Button>
              </div>

              <p className="text-center text-xs text-gray-400">
                Certificate verification is powered by blockchain technology for maximum security and authenticity.
              </p>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Section>
  );
};

export default CertificateVerification;
