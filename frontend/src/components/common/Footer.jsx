import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/images/logo.png';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative bg-brand-black border-t border-white/5 overflow-hidden">
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 grid-pattern opacity-30"></div>

            <div className="relative container-custom py-20">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Column 1: Brand */}
                    <div className="lg:col-span-1">
                        <Link to="/" className="flex items-center space-x-3 mb-6 group">
                            <img
                                src={logo}
                                alt="StratAxis Logo"
                                className="h-10 w-auto transition-transform duration-300 group-hover:scale-110"
                            />
                            <span className="text-xl font-display font-bold tracking-tight text-white">
                                Strat<span className="gradient-text">Axis</span>
                            </span>
                        </Link>
                        <p className="text-brand-mediumGrey text-sm leading-relaxed mb-6">
                            Institutional-grade intelligence for property market decision-making in Cameroon's primary markets.
                        </p>
                        {/* Social Links */}
                        <div className="flex items-center space-x-4">
                            <a
                                href="#"
                                className="w-10 h-10 rounded-full bg-white/5 hover:bg-brand-gold/20 border border-white/10 hover:border-brand-gold/50 flex items-center justify-center transition-all duration-300 group"
                                aria-label="LinkedIn"
                            >
                                <svg className="w-5 h-5 text-brand-mediumGrey group-hover:text-brand-gold transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                </svg>
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 rounded-full bg-white/5 hover:bg-brand-gold/20 border border-white/10 hover:border-brand-gold/50 flex items-center justify-center transition-all duration-300 group"
                                aria-label="Twitter"
                            >
                                <svg className="w-5 h-5 text-brand-mediumGrey group-hover:text-brand-gold transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Column 2: Platform */}
                    <div>
                        <h4 className="text-white text-sm font-bold uppercase tracking-widest mb-6">Platform</h4>
                        <ul className="space-y-4">
                            <li>
                                <Link to="/" className="text-brand-mediumGrey hover:text-brand-gold transition-colors text-sm">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/analytics" className="text-brand-mediumGrey hover:text-brand-gold transition-colors text-sm">
                                    Analytics
                                </Link>
                            </li>
                            <li>
                                <Link to="/insights" className="text-brand-mediumGrey hover:text-brand-gold transition-colors text-sm">
                                    Insights
                                </Link>
                            </li>
                            <li>
                                <Link to="/booking" className="text-brand-mediumGrey hover:text-brand-gold transition-colors text-sm">
                                    Booking
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Company */}
                    <div>
                        <h4 className="text-white text-sm font-bold uppercase tracking-widest mb-6">Company</h4>
                        <ul className="space-y-4">
                            <li>
                                <Link to="/about" className="text-brand-mediumGrey hover:text-brand-gold transition-colors text-sm">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="text-brand-mediumGrey hover:text-brand-gold transition-colors text-sm">
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <a href="#" className="text-brand-mediumGrey hover:text-brand-gold transition-colors text-sm">
                                    Careers
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-brand-mediumGrey hover:text-brand-gold transition-colors text-sm">
                                    Press Kit
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Resources */}
                    <div>
                        <h4 className="text-white text-sm font-bold uppercase tracking-widest mb-6">Resources</h4>
                        <ul className="space-y-4">
                            <li>
                                <a href="#" className="text-brand-mediumGrey hover:text-brand-gold transition-colors text-sm">
                                    Documentation
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-brand-mediumGrey hover:text-brand-gold transition-colors text-sm">
                                    API Reference
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-brand-mediumGrey hover:text-brand-gold transition-colors text-sm">
                                    Help Center
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-brand-mediumGrey hover:text-brand-gold transition-colors text-sm">
                                    Blog
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="divider mb-8"></div>
                <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    <p className="text-brand-mediumGrey text-xs">
                        © {currentYear} StratAxis. Institutional Grade Analytics. All rights reserved.
                    </p>
                    <div className="flex items-center space-x-6">
                        <Link to="/privacy" className="text-brand-mediumGrey text-xs hover:text-brand-gold transition-colors">
                            Privacy Policy
                        </Link>
                        <Link to="/terms" className="text-brand-mediumGrey text-xs hover:text-brand-gold transition-colors">
                            Terms of Service
                        </Link>
                        <Link to="/cookies" className="text-brand-mediumGrey text-xs hover:text-brand-gold transition-colors">
                            Cookie Policy
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
