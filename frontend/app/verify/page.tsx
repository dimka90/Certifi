'use client';

import React from 'react';
import Layout from '../components/Layout';
import CertificateVerification from '../components/CertificateVerification';
import { motion } from 'framer-motion';

export default function VerifyPortal() {
    return (
        <Layout>
            <div className="min-h-[80vh] flex flex-col items-center justify-center relative py-20 overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.1, 0.15, 0.1],
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[120px]"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.05, 0.1, 0.05],
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear", delay: 2 }}
                        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-400/10 rounded-full blur-[100px]"
                    />
                </div>

                <div className="relative z-10 w-full">
                    <CertificateVerification />
                </div>
            </div>
        </Layout>
    );
}
