'use client';

import React from 'react';
import { Building2, MapPin } from 'lucide-react';
import { InstitutionData } from '../../lib/institutionStore';

interface InstitutionProfileProps {
    data: InstitutionData;
}

const InstitutionProfile: React.FC<InstitutionProfileProps> = ({ data }) => {
    return (
        <div className="glass-card rounded-2xl p-8 hover:scale-[1.01] transition-all duration-300">
            <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-green-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Institution Overview</h2>
                    <p className="text-sm text-zinc-500">Your registered identification details</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-10">
                <div>
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Institution Name</h3>
                    <p className="text-lg text-white font-semibold">{data.institutionName}</p>
                </div>

                <div>
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Institution ID</h3>
                    <p className="text-lg text-white font-mono bg-white/5 px-2 py-1 rounded inline-block">{data.institutionID}</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-10 mt-10">
                <div>
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center">
                        <MapPin className="w-3 h-3 mr-2 text-green-500" />
                        Country
                    </h3>
                    <p className="text-lg text-white font-medium">{data.country}</p>
                </div>
                <div>
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Institution Type</h3>
                    <div className="inline-flex items-center px-3 py-1 bg-green-500/10 text-green-400 rounded-lg text-sm font-bold border border-green-500/20 mt-1">
                        {data.institutionType === 0 ? 'University' :
                            data.institutionType === 1 ? 'College' :
                                data.institutionType === 2 ? 'School' :
                                    data.institutionType === 3 ? 'Training Center' : 'Other'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstitutionProfile;
