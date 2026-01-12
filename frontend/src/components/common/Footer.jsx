import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/images/logo.png';

const Footer = () => {
    return (
        <footer className="bg-brand-black border-t border-white/5 py-16">
            <div className="container-custom">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="md:col-span-1">
                        <Link to="/" className="flex items-center space-x-3 mb-6">
                            <img src={logo} alt="StratAxis Logo" className="h-8 w-auto" />
                            <span className="text-lg font-bold tracking-widest text-white uppercase">StratAxis</span>
                        </Link>
                        <p className="text-brand-mediumGrey text-sm leading-relaxed">
                            Precision data intelligence for institutional real estate decision-making.
                        </p>
                    </div>

                    <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8">
                        <div>
                            <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-6">Platform</h4>
                            <ul className="space-y-4">
                                <li><Link to="/" className="text-brand-mediumGrey hover:text-white transition text-sm">Home</Link></li>
                                <li><Link to="/insights" className="text-brand-mediumGrey hover:text-white transition text-sm">Insights</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-6">Company</h4>
                            <ul className="space-y-4">
                                <li><Link to="/contact" className="text-brand-mediumGrey hover:text-white transition text-sm">Contact</Link></li>
                                <li><Link to="/login" className="text-brand-mediumGrey hover:text-white transition text-sm">Login</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-brand-mediumGrey text-xs">
                        &copy; {new Date().getFullYear()} StratAxis. Institutional Grade Analytics.
                    </p>
                    <div className="mt-4 md:mt-0 space-x-6">
                        <span className="text-brand-mediumGrey text-xs hover:text-white cursor-pointer transition">Privacy Policy</span>
                        <span className="text-brand-mediumGrey text-xs hover:text-white cursor-pointer transition">Terms of Service</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
