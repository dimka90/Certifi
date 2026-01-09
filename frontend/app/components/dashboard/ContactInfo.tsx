'use client';

import React from 'react';
import { Mail, Hash, Copy, Check } from 'lucide-react';
import { InstitutionData } from '../../lib/institutionStore';
import { useToast } from '../../providers/ToastProvider';
import { useState } from 'react';

interface ContactInfoProps {
    data: InstitutionData;
}

const ContactInfo: React.FC<ContactInfoProps> = ({ data }) => {
    const { addToast } = useToast();
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (data.walletAddress) {
            navigator.clipboard.writeText(data.walletAddress);
            addToast('Wallet address copied to clipboard', 'success');
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="glass-card rounded-2xl p-8 hover:scale-[1.01] transition-all duration-300">
            <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center">
                    <Mail className="w-6 h-6 text-green-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Contact Information</h2>
                    <p className="text-sm text-zinc-500">How we reach out to you</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-10">
                <div>
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center">
                        <Mail className="w-3 h-3 mr-2 text-green-500" />
                        Email Address
                    </h3>
                    <p className="text-lg text-white font-medium break-all underline decoration-green-500/30 underline-offset-4">{data.email}</p>
                </div>

                <div>
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center">
                        <Hash className="w-3 h-3 mr-2 text-green-500" />
                        Settlement Wallet
                    </h3>
                    <div
                        onClick={handleCopy}
                        className="group relative cursor-pointer"
                    >
                        <p className="text-xs text-white font-mono bg-zinc-950/80 border border-white/5 px-4 py-3 rounded-xl break-all shadow-inner group-hover:border-green-500/30 transition-colors pr-10">
                            {data.walletAddress || 'Not available'}
                        </p>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 group-hover:text-green-500 transition-colors">
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactInfo;
