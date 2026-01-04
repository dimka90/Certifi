'use client';

import React from 'react';
import Link from 'next/link';
import { Home, AlertCircle } from 'lucide-react';
import { Button } from './components/ui/Button';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[120px] -z-10" />

            <div className="text-center space-y-8 relative z-10">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-zinc-900 border border-white/5 shadow-2xl mb-4 group hover:scale-110 transition-transform duration-500">
                    <AlertCircle className="w-12 h-12 text-zinc-500 group-hover:text-red-500 transition-colors" />
                </div>

                <div className="space-y-4">
                    <h1 className="text-7xl md:text-9xl font-black text-white tracking-tighter">404</h1>
                    <h2 className="text-2xl md:text-3xl font-bold text-zinc-400">Page Not Found</h2>
                    <p className="text-zinc-500 max-w-md mx-auto leading-relaxed">
                        The page you are looking for doesn't exist or has been moved to another quadrant of the blockchain.
                    </p>
                </div>

                <div className="pt-8">
                    <Link href="/">
                        <Button variant="secondary" size="xl" className="group h-16 px-10 rounded-2xl">
                            <Home className="w-5 h-5 mr-3 group-hover:-translate-y-0.5 transition-transform" />
                            Back to Home
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="absolute bottom-12 left-0 right-0 text-center">
                <p className="text-zinc-700 text-xs font-mono tracking-widest uppercase">
                    Certifi // Error Protocol 0x404
                </p>
            </div>
        </div>
    );
}
