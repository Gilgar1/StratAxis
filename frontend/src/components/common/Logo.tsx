import React from 'react';
import logoImg from '../../assets/logo.png';

interface LogoProps {
    variant?: 'full' | 'icon';
    className?: string;
    size?: number;
}

const Logo: React.FC<LogoProps> = ({ variant = 'full', className = '', size }) => {
    if (variant === 'icon') {
        const iconSize = size || 40;
        return (
            <img
                src={logoImg}
                alt="StratAxis"
                width={iconSize}
                height={iconSize}
                className={className}
                style={{ objectFit: 'contain' }}
            />
        );
    }

    // Full variant: logo image + text
    const logoHeight = size ? Math.round(size * 0.3) : 36;
    const fontSize = size ? Math.round(size * 0.14) : 20;

    return (
        <div className={`flex items-center gap-2.5 ${className}`}>
            <img
                src={logoImg}
                alt="StratAxis"
                height={logoHeight}
                style={{ height: logoHeight, width: 'auto', objectFit: 'contain' }}
            />
            <span
                style={{
                    fontSize,
                    fontWeight: 700,
                    letterSpacing: '-0.5px',
                    lineHeight: 1,
                }}
                className="text-current"
            >
                StratAxis
            </span>
        </div>
    );
};

export default Logo;
