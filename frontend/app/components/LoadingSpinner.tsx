import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="relative w-12 h-12">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-emerald-500/20 rounded-full animate-pulse blur-sm"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-t-emerald-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
