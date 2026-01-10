'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, Smartphone, AlertTriangle } from 'lucide-react';

const RecentActivity = () => {
    const activities = [
        {
            id: 1,
            type: 'issue',
            title: 'Certificate Issued',
            description: 'Bachelor of Computer Science for John Doe',
            time: '2 hours ago',
            icon: CheckCircle,
            color: 'text-green-500',
            bgColor: 'bg-green-500/10'
        },
        {
            id: 2,
            type: 'login',
            title: 'New Login Detected',
            description: 'Login from Mac OS (Chrome)',
            time: '5 hours ago',
            icon: Smartphone,
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10'
        },
        {
            id: 3,
            type: 'revoke',
            title: 'Certificate Revoked',
            description: 'Diploma in Graphic Design for Jane Smith',
            time: '1 day ago',
            icon: AlertTriangle,
            color: 'text-red-500',
            bgColor: 'bg-red-500/10'
        }
    ];

    return (
        <div className="glass-card rounded-2xl p-8 hover:scale-[1.01] transition-all duration-300">
            <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Recent Activity</h2>
                    <p className="text-sm text-zinc-500">Latest actions on your account</p>
                </div>
            </div>

            <div className="space-y-4">
                {activities.map((activity, i) => (
                    <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start space-x-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                    >
                        <div className={`p-2 rounded-lg ${activity.bgColor} ${activity.color}`}>
                            <activity.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h3 className="text-sm font-bold text-white">{activity.title}</h3>
                                <span className="text-xs text-zinc-500">{activity.time}</span>
                            </div>
                            <p className="text-xs text-zinc-400 mt-1">{activity.description}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default RecentActivity;
