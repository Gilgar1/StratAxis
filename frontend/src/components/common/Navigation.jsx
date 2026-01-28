import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import logo from '../../assets/images/logo.png';

const Navigation = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { path: '/', label: 'Home', public: true },
        { path: '/analytics', label: 'Analytics', public: true },
        { path: '/insights', label: 'Insights', public: false },
        { path: '/booking', label: 'Booking', public: false },
    ];

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <nav className="bg-primary text-white">
            <div className="container mx-auto flex justify-between items-center p-4">
                <Link to="/" className="flex items-center space-x-3 group">
                    <img
                        src={logo}
                        alt="StratAxis Logo"
                        className="h-12 w-auto transition-transform duration-300 group-hover:scale-110"
                    />
                    <span className="text-2xl font-display font-bold tracking-tight text-white">
                        Strat<span className="gradient-text">Axis</span>
                    </span>
                </Link>
                <button
                    className="md:hidden text-white focus:outline-none"
                    onClick={toggleMobileMenu}
                >
                    {isMobileMenuOpen ? 'Close' : 'Menu'}
                </button>
                <ul
                    className={`md:flex md:space-x-4 absolute md:static bg-primary w-full md:w-auto transition-transform transform ${
                        isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
                    }`}
                >
                    {navLinks.map((link) => (
                        (!link.public && !user) ? null : (
                            <li key={link.path}>
                                <Link
                                    to={link.path}
                                    className={`block p-2 hover:underline ${isActive(link.path) ? 'text-white' : ''}`}
                                >
                                    {link.label}
                                </Link>
                            </li>
                        )
                    ))}
                </ul>
            </div>
        </nav>
    );
};

export default Navigation;
