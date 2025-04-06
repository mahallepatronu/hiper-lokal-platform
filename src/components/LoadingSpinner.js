import React from 'react';

const LoadingSpinner = ({ size = 'medium', color = 'primary' }) => {
    const sizeClasses = {
        small: 'w-4 h-4',
        medium: 'w-8 h-8',
        large: 'w-12 h-12'
    };

    const colorClasses = {
        primary: 'text-primary',
        secondary: 'text-secondary',
        white: 'text-white'
    };

    return (
        <div className="flex justify-center items-center">
            <div className={`animate-spin rounded-full border-4 border-t-transparent ${sizeClasses[size]} ${colorClasses[color]}`}>
                <span className="sr-only">Yükleniyor...</span>
            </div>
        </div>
    );
};

export default LoadingSpinner; 