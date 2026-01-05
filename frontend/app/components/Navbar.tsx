'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Gavel, ShieldCheck, ChevronDown, LayoutDashboard } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Container } from './ui/Container';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_LINKS = [
  { label: 'Verify', href: '/verify', icon: ShieldCheck },
  { label: 'Institution Portal', href: '/institution/dashboard', icon: LayoutDashboard },
];

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled
          ? 'py-3 bg-black/60 backdrop-blur-2xl border-b border-white/10'
          : 'py-6 bg-transparent border-b border-transparent'
        }`}
    >
      <Container>
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group relative">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
              <ShieldCheck className="w-6 h-6 text-black stroke-[2.5px]" />
            </div>
            <div className="flex flex-col">
              <span className="text-white text-xl font-bold tracking-tighter leading-none">Certifi</span>
              <span className="text-[10px] text-green-500 font-bold uppercase tracking-[0.2em] mt-0.5 opacity-80">Protocol</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-zinc-400 hover:text-white rounded-full hover:bg-white/5 transition-all duration-300 group"
              >
                <link.icon className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:text-green-500 transition-all shadow-green-500/0" />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Action Area */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              <ConnectButton
                chainStatus="icon"
                showBalance={false}
                accountStatus="address"
              />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden text-zinc-400 hover:text-white transition-all h-11 w-11 flex items-center justify-center rounded-2xl bg-white/5 border border-white/5 hover:border-white/10"
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                    <X className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                    <Menu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden bg-zinc-950/90 backdrop-blur-3xl rounded-[2rem] border border-white/10 mt-4 shadow-2xl"
            >
              <div className="p-6 space-y-2">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="flex items-center justify-between px-6 py-4 text-lg font-bold text-zinc-400 hover:text-white hover:bg-white/5 rounded-[1.5rem] transition-all group"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="flex items-center gap-4">
                      <link.icon className="w-6 h-6 text-green-500" />
                      {link.label}
                    </div>
                    <ChevronDown className="w-5 h-5 -rotate-90 opacity-20 group-hover:opacity-100" />
                  </Link>
                ))}
                <div className="pt-6 border-t border-white/10 mt-6 px-4">
                  <ConnectButton.Custom>
                    {({ openConnectModal }) => (
                      <Button
                        onClick={openConnectModal}
                        className="w-full h-14 bg-green-500 text-black font-bold text-lg rounded-2xl"
                      >
                        Connect Wallet
                      </Button>
                    )}
                  </ConnectButton.Custom>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </nav>
  );
};

export default Navbar;