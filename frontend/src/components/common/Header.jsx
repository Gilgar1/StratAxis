import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/images/logo.png';

const Header = () => {
    return (
        <header className="bg-brand-black py-6">
            <div className="container-custom flex items-center justify-between">
                <Link to="/" className="flex items-center space-x-4">
                    <img src={logo} alt="StratAxis Logo" className="h-20 w-auto" />
                    <span className="text-2xl font-bold tracking-tight text-white">StratAxis</span>
                </Link>

                <nav className="hidden md:flex items-center space-x-8">
                    <Link to="/about" className="nav-link">About Us</Link>
                    <Link to="/login" className="nav-link">Sign In</Link>
                    <Link to="/register" className="nav-link border-1 border-brand-gold/50 px-5 py-2 text-brand-gold hover:border-brand-gold hover:bg-brand-gold hover:text-brand-black transition-all">Sign Up</Link>
                </nav>
            </div>
        </header>
    );
};

export default Header;
