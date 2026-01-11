
import React from 'react';
import { Inbox, FileSearch, SearchX } from 'lucide-react';

interface EmptyStateProps {
    title: string;
    description: string;
    type?: 'search' | 'list' | 'inbox';
    action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    title,
    description,
    type = 'list',
    action
}) => {
    const Icon = type === 'search' ? SearchX : type === 'inbox' ? Inbox : FileSearch;

    return (
        <div className="flex flex-col items-center justify-center p-12 text-center space-y-6">
            <div className="w-20 h-20 bg-zinc-900/50 border border-white/5 rounded-full flex items-center justify-center text-zinc-600 shadow-xl">
                <Icon className="w-10 h-10" />
            </div>
            <div className="space-y-2 max-w-sm mx-auto">
                <h3 className="text-xl font-bold text-white">{title}</h3>
                <p className="text-zinc-400">{description}</p>
            </div>
            {action && (
                <div className="pt-4">
                    {action}
                </div>
            )}
        </div>
    );
};
