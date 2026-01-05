'use client';

import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

const ScrollToTop: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    if (!isVisible) return null;

    return (
        <button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 p-4 rounded-2xl bg-green-500/10 backdrop-blur-xl border border-green-500/20 text-green-400 shadow-2xl hover:bg-green-500/20 hover:scale-110 transition-all duration-300 group"
            aria-label="Scroll to top"
        >
            <ChevronUp className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
        </button>
    );
};

export default ScrollToTop;
