
import React from 'react';

export const LoadingSkeleton = ({ className }: { className?: string }) => {
    return (
        <div className={`animate-pulse bg-zinc-800/50 rounded-lg ${className}`} />
    );
};

export const CardSkeleton = () => (
    <div className="bg-zinc-950/40 border border-white/5 rounded-xl p-6 space-y-4">
        <div className="flex justify-between items-center">
            <LoadingSkeleton className="h-6 w-32" />
            <LoadingSkeleton className="h-10 w-10 rounded-full" />
        </div>
        <div className="space-y-2">
            <LoadingSkeleton className="h-8 w-full" />
            <LoadingSkeleton className="h-4 w-2/3" />
        </div>
    </div>
);

export const TableRowSkeleton = () => (
    <div className="flex items-center space-x-4 py-4 px-6 border-b border-white/5">
        <LoadingSkeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
            <LoadingSkeleton className="h-4 w-48" />
            <LoadingSkeleton className="h-3 w-32" />
        </div>
        <LoadingSkeleton className="h-6 w-24" />
        <LoadingSkeleton className="h-8 w-8 rounded-lg" />
    </div>
);
