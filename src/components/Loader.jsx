import React from 'react';

const Loader = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] w-full" aria-label="Loading">
            <div className="relative flex items-center justify-center">

                <div className="absolute w-16 h-16 rounded-full border-4 border-purple-500/30 animate-ping"></div>

                <div className="w-12 h-12 rounded-full border-4 border-t-purple-500 border-r-blue-500 border-b-purple-500 border-l-transparent animate-spin"></div>

                <div className="absolute w-full h-full rounded-full bg-purple-500/10 blur-xl"></div>
            </div>
            <p className="mt-4 text-sm font-medium text-gray-400 tracking-widest uppercase animate-pulse">Loading...</p>
        </div>
    );
};

export default Loader;
