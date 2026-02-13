import React from 'react';

interface LogoProps {
    variant?: 'full' | 'icon';
    className?: string;
    size?: number;
}

const Logo: React.FC<LogoProps> = ({ variant = 'full', className = '', size }) => {
    if (variant === 'icon') {
        return (
            <svg
                width={size || 40}
                height={size || 40}
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={className}
            >
                <defs>
                    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0F1729" />
                        <stop offset="100%" stopColor="#D4AF37" />
                    </linearGradient>
                </defs>

                {/* Outer Circle */}
                <circle cx="20" cy="20" r="18" fill="url(#logoGradient)" opacity="0.1" />

                {/* Strategic Axis - Horizontal */}
                <line x1="8" y1="20" x2="32" y2="20" stroke="url(#logoGradient)" strokeWidth="2.5" strokeLinecap="round" />

                {/* Strategic Axis - Vertical */}
                <line x1="20" y1="8" x2="20" y2="32" stroke="url(#logoGradient)" strokeWidth="2.5" strokeLinecap="round" />

                {/* Building/Growth Elements - Ascending bars */}
                <rect x="13" y="24" width="3" height="8" fill="#D4AF37" rx="0.5" />
                <rect x="18.5" y="21" width="3" height="11" fill="#D4AF37" rx="0.5" />
                <rect x="24" y="17" width="3" height="15" fill="#D4AF37" rx="0.5" />

                {/* Center Point - Strategic Focus */}
                <circle cx="20" cy="20" r="3" fill="#D4AF37" />
                <circle cx="20" cy="20" r="1.5" fill="#0F1729" />
            </svg>
        );
    }

    return (
        <svg
            width={size || 160}
            height={size || 40}
            viewBox="0 0 160 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id="logoGradientFull" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0F1729" />
                    <stop offset="100%" stopColor="#D4AF37" />
                </linearGradient>
            </defs>

            {/* Icon Part */}
            <g>
                {/* Outer Circle */}
                <circle cx="20" cy="20" r="18" fill="url(#logoGradientFull)" opacity="0.1" />

                {/* Strategic Axis - Horizontal */}
                <line x1="8" y1="20" x2="32" y2="20" stroke="url(#logoGradientFull)" strokeWidth="2.5" strokeLinecap="round" />

                {/* Strategic Axis - Vertical */}
                <line x1="20" y1="8" x2="20" y2="32" stroke="url(#logoGradientFull)" strokeWidth="2.5" strokeLinecap="round" />

                {/* Building/Growth Elements - Ascending bars */}
                <rect x="13" y="24" width="3" height="8" fill="#D4AF37" rx="0.5" />
                <rect x="18.5" y="21" width="3" height="11" fill="#D4AF37" rx="0.5" />
                <rect x="24" y="17" width="3" height="15" fill="#D4AF37" rx="0.5" />

                {/* Center Point - Strategic Focus */}
                <circle cx="20" cy="20" r="3" fill="#D4AF37" />
                <circle cx="20" cy="20" r="1.5" fill="#0F1729" />
            </g>

            {/* Text Part */}
            <g className="logo-text">
                {/* StratAxis Text */}
                <text
                    x="48"
                    y="26"
                    fontFamily="system-ui, -apple-system, sans-serif"
                    fontSize="20"
                    fontWeight="700"
                    fill="currentColor"
                    letterSpacing="-0.5"
                >
                    StratAxis
                </text>
            </g>
        </svg>
    );
};

export default Logo;
