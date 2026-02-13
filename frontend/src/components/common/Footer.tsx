import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import Logo from './Logo';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-primary-950 text-primary-100 border-t border-primary-800">
            <div className="container-custom py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1">
                        <div className="mb-4">
                            <Logo variant="full" size={140} className="text-white" />
                        </div>
                        <p className="text-sm text-primary-400 leading-relaxed">
                            The trusted intelligence for real estate insights in Cameroon.
                        </p>
                        <p className="text-sm text-primary-400 mt-2">
                            Intelligence décisionnelle pour l'immobilier au Cameroun.
                        </p>
                    </div>

                    {/* Product */}
                    <div>
                        <h3 className="font-semibold text-white mb-4">Product</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    to="/pricing"
                                    className="text-sm text-primary-400 hover:text-accent-gold transition-colors"
                                >
                                    Pricing
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/methodology"
                                    className="text-sm text-primary-400 hover:text-accent-gold transition-colors"
                                >
                                    Methodology
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/blog"
                                    className="text-sm text-primary-400 hover:text-accent-gold transition-colors"
                                >
                                    Market Insights
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/book-consultation"
                                    className="text-sm text-primary-400 hover:text-accent-gold transition-colors"
                                >
                                    Book Consultation
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Intelligence */}
                    <div>
                        <h3 className="font-semibold text-white mb-4">Intelligence</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    to="/land-intelligence"
                                    className="text-sm text-primary-400 hover:text-accent-gold transition-colors"
                                >
                                    Land Prices
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/rent-intelligence"
                                    className="text-sm text-primary-400 hover:text-accent-gold transition-colors"
                                >
                                    Rent Prices
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/maps"
                                    className="text-sm text-primary-400 hover:text-accent-gold transition-colors"
                                >
                                    Interactive Maps
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/insights"
                                    className="text-sm text-primary-400 hover:text-accent-gold transition-colors"
                                >
                                    Smart Insights
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-semibold text-white mb-4">Contact</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start space-x-2">
                                <MapPin className="w-4 h-4 text-accent-gold mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-primary-400">
                                    Douala & Yaoundé, Cameroon
                                </span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <Mail className="w-4 h-4 text-accent-gold mt-0.5 flex-shrink-0" />
                                <a
                                    href="mailto:contact@strataxis.cm"
                                    className="text-sm text-primary-400 hover:text-accent-gold transition-colors"
                                >
                                    contact@strataxis.cm
                                </a>
                            </li>
                            <li className="flex items-start space-x-2">
                                <Phone className="w-4 h-4 text-accent-gold mt-0.5 flex-shrink-0" />
                                <a
                                    href="tel:+237600000000"
                                    className="text-sm text-primary-400 hover:text-accent-gold transition-colors"
                                >
                                    +237 6XX XXX XXX
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-primary-800">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <p className="text-sm text-primary-500">
                            © {currentYear} StratAxis. All rights reserved.
                        </p>
                        <div className="flex items-center space-x-6">
                            <Link
                                to="/privacy"
                                className="text-sm text-primary-500 hover:text-accent-gold transition-colors"
                            >
                                Privacy Policy
                            </Link>
                            <Link
                                to="/terms"
                                className="text-sm text-primary-500 hover:text-accent-gold transition-colors"
                            >
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
