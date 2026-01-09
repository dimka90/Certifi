'use client';

import React from 'react';
import { FileText, Hash } from 'lucide-react';
import { InstitutionData } from '../../lib/institutionStore';

interface LegalDocsProps {
    data: InstitutionData;
}

const LegalDocs: React.FC<LegalDocsProps> = ({ data }) => {
    if (!data.registrationDocument) return null;

    return (
        <div className="glass-card rounded-2xl p-8 hover:scale-[1.01] transition-all duration-300">
            <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-green-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Legal Documentation</h2>
                    <p className="text-sm text-zinc-500">Your institution verification files</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-8">
                    <div>
                        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Filename</h3>
                        <p className="text-lg text-white font-medium truncate">{data.registrationDocument.name}</p>
                    </div>

                    <div>
                        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center">
                            <Hash className="w-3 h-3 mr-2 text-green-500" />
                            IPFS CONTENT ID
                        </h3>
                        <p className="text-[10px] text-zinc-400 font-mono bg-zinc-950/50 border border-white/5 px-3 py-2 rounded break-all">
                            {data.registrationDocument.hash}
                        </p>
                    </div>
                </div>

                <div className="space-y-8 flex flex-col justify-between">
                    <div>
                        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Storage Footprint</h3>
                        <p className="text-lg text-white font-medium">
                            {(data.registrationDocument.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                    </div>

                    <div>
                        <a
                            href={data.registrationDocument.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full inline-flex items-center justify-center px-6 py-4 bg-green-500 text-black font-bold rounded-xl hover:bg-green-400 transition-all shadow-lg shadow-green-950/20 group"
                        >
                            <FileText className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                            Inspect Source Document
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LegalDocs;
