'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Shield, Wallet, Save } from 'lucide-react';
import { Sidebar } from '../../components/Sidebar';
import { motion } from 'framer-motion';

const InstitutionSettings = () => {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('notifications');

    // Mocks for state
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [pushNotifs, setPushNotifs] = useState(false);
    const [twoFactor, setTwoFactor] = useState(true);

    return (
        <div className="h-screen bg-black flex overflow-hidden">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col overflow-hidden min-h-[600px] relative">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[120px] -z-10" />

                <header className="bg-zinc-950/50 backdrop-blur-md border-b border-white/5 z-20">
                    <div className="flex items-center justify-between h-16 px-6">
                        <h1 className="text-2xl font-bold text-white">Settings</h1>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8 custom-scrollbar relative z-10">
                    <div className="max-w-4xl mx-auto space-y-8">

                        {/* Navigation Tabs */}
                        <div className="flex space-x-4 border-b border-white/10 pb-4">
                            <button
                                onClick={() => setActiveSection('notifications')}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${activeSection === 'notifications' ? 'bg-green-500/10 text-green-500 font-medium' : 'text-zinc-400 hover:text-white'}`}
                            >
                                <Bell className="w-4 h-4" />
                                <span>Notifications</span>
                            </button>
                            <button
                                onClick={() => setActiveSection('security')}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${activeSection === 'security' ? 'bg-green-500/10 text-green-500 font-medium' : 'text-zinc-400 hover:text-white'}`}
                            >
                                <Shield className="w-4 h-4" />
                                <span>Security</span>
                            </button>
                        </div>

                        {/* Content */}
                        <motion.div
                            key={activeSection}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                        >
                            {activeSection === 'notifications' && (
                                <div className="glass-card p-8 rounded-2xl space-y-8">
                                    <div>
                                        <h2 className="text-xl font-bold text-white mb-2">Notification Preferences</h2>
                                        <p className="text-sm text-zinc-500">Manage how you receive alerts and updates.</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                            <div>
                                                <h3 className="text-white font-medium">Email Notifications</h3>
                                                <p className="text-xs text-zinc-500">Receive summaries and important alerts via email</p>
                                            </div>
                                            <div
                                                onClick={() => setEmailNotifs(!emailNotifs)}
                                                className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${emailNotifs ? 'bg-green-500' : 'bg-zinc-700'}`}
                                            >
                                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${emailNotifs ? 'translate-x-6' : 'translate-x-0'}`} />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                            <div>
                                                <h3 className="text-white font-medium">Push Notifications</h3>
                                                <p className="text-xs text-zinc-500">Real-time alerts on your browser</p>
                                            </div>
                                            <div
                                                onClick={() => setPushNotifs(!pushNotifs)}
                                                className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${pushNotifs ? 'bg-green-500' : 'bg-zinc-700'}`}
                                            >
                                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${pushNotifs ? 'translate-x-6' : 'translate-x-0'}`} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeSection === 'security' && (
                                <div className="glass-card p-8 rounded-2xl space-y-8">
                                    <div>
                                        <h2 className="text-xl font-bold text-white mb-2">Security Settings</h2>
                                        <p className="text-sm text-zinc-500">Protect your account and assets.</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                            <div className="flex items-center space-x-4">
                                                <div className="p-2 bg-green-500/10 rounded-lg">
                                                    <Wallet className="w-5 h-5 text-green-500" />
                                                </div>
                                                <div>
                                                    <h3 className="text-white font-medium">Connected Wallet</h3>
                                                    <p className="text-xs text-zinc-500 font-mono">0x123...abc</p>
                                                </div>
                                            </div>
                                            <button className="text-xs bg-white/5 hover:bg-white/10 text-white px-3 py-2 rounded-lg transition-colors">
                                                Disconnect
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                            <div>
                                                <h3 className="text-white font-medium">Two-Factor Authentication</h3>
                                                <p className="text-xs text-zinc-500">Require approval for sensitive actions</p>
                                            </div>
                                            <div
                                                onClick={() => setTwoFactor(!twoFactor)}
                                                className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${twoFactor ? 'bg-green-500' : 'bg-zinc-700'}`}
                                            >
                                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${twoFactor ? 'translate-x-6' : 'translate-x-0'}`} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>

                        <div className="flex justify-end pt-4">
                            <button className="flex items-center space-x-2 bg-green-500 text-black font-bold px-6 py-3 rounded-xl hover:bg-green-400 transition-all shadow-lg shadow-green-900/20">
                                <Save className="w-4 h-4" />
                                <span>Save Changes</span>
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default InstitutionSettings;
