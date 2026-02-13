import React from 'react';
import Logo from './Logo';

interface LoadingSpinnerProps {
    size?: number;
    message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 60, message = 'Loading...' }) => {
    return (
        <div className="flex flex-col items-center justify-center p-8">
            <div className="relative">
                {/* Spinning outer ring */}
                <div
                    className="absolute inset-0 rounded-full border-4 border-primary-200 dark:border-primary-800 border-t-accent-gold animate-spin"
                    style={{ width: size + 20, height: size + 20, top: -10, left: -10 }}
                />

                {/* Logo in center */}
                <div className="animate-pulse">
                    <Logo variant="icon" size={size} className="text-primary-900 dark:text-white" />
                </div>
            </div>

            {message && (
                <p className="mt-6 text-sm font-medium text-primary-600 dark:text-primary-400 animate-pulse">
                    {message}
                </p>
            )}
        </div>
    );
};

export default LoadingSpinner;
