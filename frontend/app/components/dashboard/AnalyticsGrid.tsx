'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileStack, ShieldCheck, AlertCircle, TrendingUp } from 'lucide-react';
import { cn } from '../../lib/utils'; // Assuming you have a utils file, if not I'll create/find it. 
// Wait, I saw cn function in the dashboard page. I should check if there is a global utils file or if I need to create one.
// The original file had a local cn function. I should probably move that to a utility file if one doesn't exist, 
// or I can just include clsx and tailwind-merge here. 
// Let's check for lib/utils.ts first. I'll stick to local implementation for now to avoid breaking things 
// if utils doesn't exist, but I'll check file list again.
// Actually, looking at file list from step 4, there is `frontend/lib`.
// Let's assume I should put `cn` there if it's not. 
// But for now, I will include the dependencies directly.

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const AnalyticsGrid = () => {
    const stats = [
        { label: 'Total Issued', value: '1,284', icon: FileStack, color: 'text-green-500', trend: '+12%' },
        { label: 'Active Certificates', value: '1,240', icon: ShieldCheck, color: 'text-blue-500', trend: '+8%' },
        { label: 'Revocations', value: '44', icon: AlertCircle, color: 'text-red-500', trend: '-2%' },
        { label: 'Verification Queries', value: '8.4k', icon: TrendingUp, color: 'text-purple-500', trend: '+24%' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-card p-6 rounded-3xl group hover:border-white/10 transition-all duration-300"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className={cn("p-3 rounded-2xl bg-white/5 group-hover:scale-110 transition-transform duration-300", stat.color)}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-full">{stat.trend}</span>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1 tracking-tight">{stat.value}</div>
                    <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{stat.label}</div>
                </motion.div>
            ))}
        </div>
    );
};

export default AnalyticsGrid;
