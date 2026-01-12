import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white py-12 mt-auto">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                    <div>
                        <h3 className="text-xl font-bold mb-4">StratAxis</h3>
                        <p className="text-gray-400">
                            Advanced Real Estate Analytics and Prediction Platform for the Cameroonian market.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li><a href="/analytics" className="hover:text-white transition">Analytics</a></li>
                            <li><a href="/insights" className="hover:text-white transition">Insights</a></li>
                            <li><a href="/booking" className="hover:text-white transition">Consultation</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Contact</h4>
                        <p className="text-gray-400">support@strataxis.com</p>
                    </div>
                </div>
                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
                    <p>&copy; {new Date().getFullYear()} StratAxis. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
