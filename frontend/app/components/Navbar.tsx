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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-zinc-800">
      <Container>
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 2L3 7v6l7 5 7-5V7l-7-5z"
                  fill="currentColor"
                  className="text-black/80"
                />
              </svg>
            </div>
            <span className="text-white text-lg font-semibold tracking-tight">Certifi</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Wallet Connect & Mobile Menu */}
          <div className="flex items-center gap-4">
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
              className="lg:hidden text-white p-2"
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
          <div className="lg:hidden border-t border-zinc-800 py-4 space-y-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="block text-sm font-medium text-gray-300 hover:text-white transition-colors px-4 py-2"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="px-4 pt-2">
              <ConnectButton
                label="Connect Wallet"
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
          </div>
        )}
      </Container>
    </nav>
  );
};

export default Navbar;