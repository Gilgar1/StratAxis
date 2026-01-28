import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <header className="bg-primary text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-xl font-bold">StratAxis</h1>
                <nav>
                    <ul className="flex space-x-4">
                        <li><Link to="/" className="hover:underline">Home</Link></li>
                        <li><Link to="/dashboard" className="hover:underline">Dashboard</Link></li>
                        <li><Link to="/analytics" className="hover:underline">Analytics</Link></li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;
