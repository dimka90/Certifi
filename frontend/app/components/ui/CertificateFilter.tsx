'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

interface CertificateFilterProps {
    options: string[];
    selected: string;
    onSelect: (option: string) => void;
}

const CertificateFilter: React.FC<CertificateFilterProps> = ({ options, selected, onSelect }) => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 bg-zinc-900/50 border border-white/5 rounded-xl px-4 py-3 text-white hover:bg-zinc-800 transition-colors"
            >
                <span className="text-sm font-medium">{selected}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full mt-2 w-48 bg-zinc-900 border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
                    {options.map((option) => (
                        <button
                            key={option}
                            onClick={() => {
                                onSelect(option);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 text-sm transition-colors ${selected === option ? 'bg-green-500/10 text-green-500' : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CertificateFilter;
