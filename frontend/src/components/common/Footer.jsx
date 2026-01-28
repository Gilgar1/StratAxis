import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/images/logo.png';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-secondary text-white p-4 mt-8">
            <div className="container mx-auto text-center">
                <p>&copy; {currentYear} StratAxis. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
