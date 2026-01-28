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
        <>
            {/* Desktop & Mobile Header */}
            <header className="fixed top-0 left-0 right-0 z-40 glass-card border-b border-white/10">
                <div className="container-custom">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
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

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex items-center space-x-8">
                            {navLinks.map((link) => (
                                (!link.public && !user) ? null : (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className={`nav-link ${isActive(link.path) ? 'text-white' : ''}`}
                                    >
                                        {link.label}
                                    </Link>
                                )
                            ))}
                        </nav>

                        {/* Desktop Auth Buttons */}
                        <div className="hidden lg:flex items-center space-x-4">
                            {user ? (
                                <>
                                    <Link to="/profile" className="btn-ghost">
                                        Profile
                                    </Link>
                                    {user.role === 'ADMIN' && (
                                        <Link to="/admin" className="btn-ghost">
                                            Admin
                                        </Link>
                                    )}
                                    <button onClick={logout} className="btn-outline-gold">
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="btn-ghost">
                                        Sign In
                                    </Link>
                                    <Link to="/register" className="btn-primary">
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={toggleMobileMenu}
                            className="lg:hidden p-2 text-white hover:text-brand-gold transition-colors"
                            aria-label="Toggle menu"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                {isMobileMenuOpen ? (
                                    <path d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Sheet */}
            {isMobileMenuOpen && (
                <div
                    className="mobile-sheet"
                    style={{ transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(100%)' }}
                >
                    <div className="container-custom py-24">
                        <nav className="flex flex-col space-y-6 mb-12">
                            {navLinks.map((link) => (
                                (!link.public && !user) ? null : (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        onClick={toggleMobileMenu}
                                        className={`text-2xl font-display font-semibold transition-colors ${isActive(link.path) ? 'text-brand-gold' : 'text-white hover:text-brand-gold'
                                            }`}
                                    >
                                        {link.label}
                                    </Link>
                                )
                            ))}
                        </nav>

                        <div className="flex flex-col space-y-4 pt-8 border-t border-white/10">
                            {user ? (
                                <>
                                    <Link
                                        to="/profile"
                                        onClick={toggleMobileMenu}
                                        className="btn-ghost text-center"
                                    >
                                        Profile
                                    </Link>
                                    {user.role === 'ADMIN' && (
                                        <Link
                                            to="/admin"
                                            onClick={toggleMobileMenu}
                                            className="btn-ghost text-center"
                                        >
                                            Admin
                                        </Link>
                                    )}
                                    <button
                                        onClick={() => {
                                            logout();
                                            toggleMobileMenu();
                                        }}
                                        className="btn-outline-gold w-full"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        onClick={toggleMobileMenu}
                                        className="btn-ghost text-center"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        to="/register"
                                        onClick={toggleMobileMenu}
                                        className="btn-primary w-full text-center"
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Spacer to prevent content from hiding under fixed header */}
            <div className="h-20"></div>
        </>
    );
};

export default Navigation;
