'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, Circle, Clock, AlertCircle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export type StepStatus = 'idle' | 'loading' | 'complete' | 'error';

interface Step {
    id: string;
    label: string;
    description: string;
    status: StepStatus;
}

interface TransactionStepperProps {
    steps: Step[];
    currentStepIndex: number;
}

export const TransactionStepper: React.FC<TransactionStepperProps> = ({ steps, currentStepIndex }) => {
    return (
        <div className="w-full py-8">
            <div className="relative">
                {/* Progress Line */}
                <div className="absolute top-[22px] left-[40px] right-[40px] h-[2px] bg-zinc-800 lg:block hidden">
                    <motion.div
                        className="h-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                        initial={{ width: '0%' }}
                        animate={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>

                <div className="relative flex justify-between items-start">
                    {steps.map((step, index) => {
                        const isCompleted = index < currentStepIndex || step.status === 'complete';
                        const isActive = index === currentStepIndex;
                        const isPending = index > currentStepIndex;

                        return (
                            <div key={step.id} className="flex flex-col items-center flex-1 relative z-10">
                                {/* Icon Container */}
                                <motion.div
                                    initial={false}
                                    animate={{
                                        scale: isActive ? 1.2 : 1,
                                        backgroundColor: isCompleted ? '#22c55e' : isActive ? '#18181b' : '#09090b',
                                        borderColor: isCompleted ? '#22c55e' : isActive ? '#22c55e' : '#27272a',
                                    }}
                                    className={cn(
                                        "w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all duration-500",
                                        isActive && "shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                                    )}
                                >
                                    <AnimatePresence mode="wait">
                                        {step.status === 'loading' ? (
                                            <motion.div
                                                key="loading"
                                                initial={{ opacity: 0, scale: 0.5 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.5 }}
                                            >
                                                <Loader2 className="w-5 h-5 animate-spin text-green-500" />
                                            </motion.div>
                                        ) : step.status === 'complete' || isCompleted ? (
                                            <motion.div
                                                key="complete"
                                                initial={{ opacity: 0, scale: 0.5 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.5 }}
                                            >
                                                <Check className="w-5 h-5 text-black font-bold" />
                                            </motion.div>
                                        ) : step.status === 'error' ? (
                                            <motion.div
                                                key="error"
                                                initial={{ opacity: 0, scale: 0.5 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.5 }}
                                            >
                                                <AlertCircle className="w-5 h-5 text-red-500" />
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="idle"
                                                initial={{ opacity: 0, scale: 0.5 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.5 }}
                                            >
                                                <Circle className={cn("w-5 h-5", isActive ? "text-green-500" : "text-zinc-700")} />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>

                                {/* Label & Description */}
                                <div className="mt-4 text-center px-2">
                                    <div className={cn(
                                        "text-xs font-bold uppercase tracking-widest transition-colors duration-300",
                                        isActive ? "text-white" : isCompleted ? "text-green-500/80" : "text-zinc-600"
                                    )}>
                                        {step.label}
                                    </div>
                                    <div className={cn(
                                        "text-[10px] mt-1 font-medium transition-colors duration-300 max-w-[120px] mx-auto",
                                        isActive ? "text-zinc-400" : "text-zinc-700"
                                    )}>
                                        {step.description}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
