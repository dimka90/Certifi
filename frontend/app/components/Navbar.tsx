'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Container } from './ui/Container';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '#' },
  { label: 'Services', href: '#' },
  { label: 'Blog', href: '#' },
  { label: 'Contact', href: '#' },
];

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/50 backdrop-blur-xl border-b border-white/5">
      <Container>
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20 group-hover:scale-110 transition-transform duration-300">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-black">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span className="text-white text-xl font-bold tracking-tight">Certifi</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-10">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-semibold text-zinc-400 hover:text-green-400 transition-all duration-300 relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-500 transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* Wallet Connect & Mobile Menu */}
          <div className="flex items-center gap-6">
            <div className="hidden sm:block">
              <ConnectButton
                label="Connect"
                chainStatus={{
                  largeScreen: 'name',
                  smallScreen: 'icon',
                }}
                showBalance={false}
                accountStatus={{
                  largeScreen: 'full',
                  smallScreen: 'address',
                }}
              />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden text-zinc-400 hover:text-white transition-colors h-10 w-10 flex items-center justify-center rounded-xl bg-white/5"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden border-t border-white/5 py-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="block text-base font-medium text-zinc-400 hover:text-green-400 px-4 py-2 hover:bg-white/5 rounded-xl transition-all"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="px-4 pt-4 border-t border-white/5">
              <ConnectButton
                label="Connect Wallet"
                chainStatus="none"
                showBalance={false}
              />
            </div>
          </div>
        )}
      </Container>
    </nav>
  );
};

export default Navbar;