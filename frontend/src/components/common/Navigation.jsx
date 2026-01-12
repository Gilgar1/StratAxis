import React from 'react';
import { NavLink } from 'react-router-dom';

const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/analytics', label: 'Analytics' },
    { path: '/insights', label: 'Insights' },
    { path: '/booking', label: 'Consultation' },
];

const Navigation = () => {
    return (
        <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
                <NavLink
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) =>
                        `font-medium transition hover:text-primary-600 ${isActive ? 'text-primary-600' : 'text-gray-600'
                        }`
                    }
                >
                    {link.label}
                </NavLink>
            ))}
        </nav>
    );
};

export default Navigation;
