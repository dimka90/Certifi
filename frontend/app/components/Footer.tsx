import React from 'react';
import Link from 'next/link';
import { Container } from './ui/Container';
import { ShieldCheck, Twitter, Github, Linkedin, Mail } from 'lucide-react';

const FOOTER_LINKS = {
  company: [
    { label: 'Verify Portal', href: '/verify' },
    { label: 'Institution Login', href: '/institution/dashboard' },
  ],
  legal: [
    { label: 'Privacy Protocol', href: '#' },
    { label: 'Internal Governance', href: '#' },
  ],
};

const Footer: React.FC = () => {
  return (
    <footer className="bg-black border-t border-white/5 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-px bg-gradient-to-r from-transparent via-green-500/20 to-transparent" />

      <Container>
        <div className="py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8">
            {/* Brand Identity */}
            <div className="lg:col-span-6 space-y-8">
              <Link href="/" className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center transition-all group-hover:border-green-500/30">
                  <ShieldCheck className="w-6 h-6 text-green-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-white tracking-tighter">Certifi</span>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-0.5">Anchored Integrity</span>
                </div>
              </Link>
              <p className="max-w-md text-zinc-500 text-base leading-relaxed font-medium">
                The global infrastructure for cryptographically secured academic credentials.
                Built on blockchain to eliminate forgery and streamline verification.
              </p>
              <div className="flex items-center gap-3">
                {[Twitter, Github, Linkedin, Mail].map((Icon, i) => (
                  <Link
                    key={i}
                    href="#"
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-white hover:border-white/10 transition-all hover:scale-110"
                  >
                    <Icon className="w-4.5 h-4.5" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Navigation Sections */}
            <div className="lg:col-span-6 grid grid-cols-2 md:grid-cols-3 gap-8">
              <div className="space-y-6">
                <p className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Application</p>
                <ul className="space-y-4">
                  {FOOTER_LINKS.company.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-zinc-500 hover:text-green-500 font-medium transition-colors text-sm">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-6">
                <p className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Governance</p>
                <ul className="space-y-4">
                  {FOOTER_LINKS.legal.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-zinc-500 hover:text-white font-medium transition-colors text-sm">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="col-span-2 md:col-span-1 space-y-6">
                <p className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Status</p>
                <div className="flex flex-col space-y-4">
                  <div className="px-4 py-2 bg-green-500/5 border border-green-500/10 rounded-xl inline-flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Mainnet Live</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Infrastructure Disclaimer */}
          <div className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs text-zinc-600 font-medium">
              © 2025 Certifi protocol. All cryptographic proofs strictly enforced.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-xs text-zinc-700 font-mono tracking-tighter">BUILD VERSION: 1.0.4-STABLE</span>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
