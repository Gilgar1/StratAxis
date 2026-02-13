import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, X, Sun, Moon } from 'lucide-react';
import clsx from 'clsx';
import Logo from './Logo';

const Header: React.FC = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('strataxis_theme', !darkMode ? 'dark' : 'light');
    };

    const publicLinks = [
        { name: 'Home', href: '/' },
        { name: 'Blog', href: '/blog' },
        { name: 'Methodology', href: '/methodology' },
        { name: 'Pricing', href: '/pricing' },
        { name: 'Book Consultation', href: '/book-consultation' },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <header className="sticky top-0 z-40 bg-white/95 dark:bg-primary-950/95 backdrop-blur-sm border-b border-primary-200 dark:border-primary-800">
            <nav className="container-custom">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
                        <Logo variant="full" size={140} className="text-primary-900 dark:text-white" />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {!isAuthenticated ? (
                            <>
                                {publicLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        to={link.href}
                                        className={clsx(
                                            'text-sm font-medium transition-colors',
                                            isActive(link.href)
                                                ? 'text-accent-gold'
                                                : 'text-primary-700 dark:text-primary-300 hover:text-accent-gold'
                                        )}
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                                <Link to="/login" className="btn btn-outline btn-sm">
                                    Login
                                </Link>
                                <Link to="/register" className="btn btn-gold btn-sm">
                                    Get Started
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/dashboard"
                                    className={clsx(
                                        'text-sm font-medium transition-colors',
                                        isActive('/dashboard')
                                            ? 'text-accent-gold'
                                            : 'text-primary-700 dark:text-primary-300 hover:text-accent-gold'
                                    )}
                                >
                                    Dashboard
                                </Link>
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm text-primary-600 dark:text-primary-400">
                                        {user?.email}
                                    </span>
                                    <button
                                        onClick={logout}
                                        className="btn btn-outline btn-sm"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Dark Mode Toggle */}
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors"
                            aria-label="Toggle dark mode"
                        >
                            {darkMode ? (
                                <Sun className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            ) : (
                                <Moon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            )}
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-800"
                    >
                        {mobileMenuOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-primary-200 dark:border-primary-800">
                        <div className="flex flex-col space-y-4">
                            {!isAuthenticated ? (
                                <>
                                    {publicLinks.map((link) => (
                                        <Link
                                            key={link.href}
                                            to={link.href}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={clsx(
                                                'text-sm font-medium transition-colors',
                                                isActive(link.href)
                                                    ? 'text-accent-gold'
                                                    : 'text-primary-700 dark:text-primary-300'
                                            )}
                                        >
                                            {link.name}
                                        </Link>
                                    ))}
                                    <Link
                                        to="/login"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="btn btn-outline w-full"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="btn btn-gold w-full"
                                    >
                                        Get Started
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/dashboard"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="text-sm font-medium text-primary-700 dark:text-primary-300"
                                    >
                                        Dashboard
                                    </Link>
                                    <button
                                        onClick={() => {
                                            logout();
                                            setMobileMenuOpen(false);
                                        }}
                                        className="btn btn-outline w-full"
                                    >
                                        Logout
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
};

export default Header;
