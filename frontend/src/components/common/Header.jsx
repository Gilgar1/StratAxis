import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from './Navigation';

const Header = () => {
    return (
        <header className="bg-white border-b sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/" className="text-2xl font-bold text-primary-600">
                    StratAxis
                </Link>
                <Navigation />
                <div className="flex items-center space-x-4">
                    <Link to="/login" className="text-gray-600 hover:text-primary-600 transition">
                        Login
                    </Link>
                    <Link to="/register" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition">
                        Register
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Header;
