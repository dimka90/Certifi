'use client';

import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
    placeholder?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder = 'Search...', value, onChange }) => {
    return (
        <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-500 w-5 h-5" />
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="w-full bg-zinc-900/50 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all placeholder-zinc-600"
            />
        </div>
    );
};

export default SearchBar;
