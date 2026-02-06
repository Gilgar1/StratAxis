import React from 'react';
import clsx from 'clsx';

interface LoadingProps {
    fullScreen?: boolean;
    size?: 'sm' | 'md' | 'lg';
    text?: string;
}

const Loading: React.FC<LoadingProps> = ({
    fullScreen = false,
    size = 'md',
    text
}) => {
    const sizeClasses = {
        sm: 'w-6 h-6 border-2',
        md: 'w-12 h-12 border-3',
        lg: 'w-16 h-16 border-4',
    };

    const spinner = (
        <div className="flex flex-col items-center justify-center gap-4">
            <div
                className={clsx(
                    'animate-spin rounded-full border-primary-200 border-t-accent-gold',
                    sizeClasses[size]
                )}
            />
            {text && (
                <p className="text-sm text-primary-600 dark:text-primary-400 animate-pulse-slow">
                    {text}
                </p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-primary-950 z-50">
                {spinner}
            </div>
        );
    }

    return <div className="flex items-center justify-center p-8">{spinner}</div>;
};

export default Loading;
