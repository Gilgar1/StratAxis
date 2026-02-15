import React from 'react';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import { DollarSign, FileText, Users, Building2, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const GettingFunded: React.FC = () => {
    return (
        <AuthenticatedLayout>
            <div className="p-8 max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-primary-900 dark:text-white mb-2 flex items-center">
                        <DollarSign className="w-8 h-8 mr-3 text-accent-gold" />
                        Getting Funded
                    </h1>
                    <p className="text-primary-600 dark:text-primary-300">
                        Resources and guidance for financing your real estate projects
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm">
                        <Building2 className="w-12 h-12 text-accent-gold mb-4" />
                        <h3 className="text-lg font-bold text-primary-900 dark:text-white mb-2">Bank Financing</h3>
                        <p className="text-sm text-primary-600 dark:text-primary-300 mb-4">
                            Traditional mortgage loans and commercial property financing options
                        </p>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-start">
                                <CheckCircle className="w-4 h-4 text-semantic-success mr-2 mt-0.5 flex-shrink-0" />
                                <span className="text-primary-700 dark:text-primary-200">Typical rates: 8-12% APR</span>
                            </li>
                            <li className="flex items-start">
                                <CheckCircle className="w-4 h-4 text-semantic-success mr-2 mt-0.5 flex-shrink-0" />
                                <span className="text-primary-700 dark:text-primary-200">Down payment: 20-30%</span>
                            </li>
                            <li className="flex items-start">
                                <CheckCircle className="w-4 h-4 text-semantic-success mr-2 mt-0.5 flex-shrink-0" />
                                <span className="text-primary-700 dark:text-primary-200">Term: 10-25 years</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm">
                        <Users className="w-12 h-12 text-accent-gold mb-4" />
                        <h3 className="text-lg font-bold text-primary-900 dark:text-white mb-2">Private Investors</h3>
                        <p className="text-sm text-primary-600 dark:text-primary-300 mb-4">
                            Connect with private investors and equity partners
                        </p>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-start">
                                <CheckCircle className="w-4 h-4 text-semantic-success mr-2 mt-0.5 flex-shrink-0" />
                                <span className="text-primary-700 dark:text-primary-200">Equity partnerships</span>
                            </li>
                            <li className="flex items-start">
                                <CheckCircle className="w-4 h-4 text-semantic-success mr-2 mt-0.5 flex-shrink-0" />
                                <span className="text-primary-700 dark:text-primary-200">Hard money loans</span>
                            </li>
                            <li className="flex items-start">
                                <CheckCircle className="w-4 h-4 text-semantic-success mr-2 mt-0.5 flex-shrink-0" />
                                <span className="text-primary-700 dark:text-primary-200">Flexible terms</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm">
                        <FileText className="w-12 h-12 text-accent-gold mb-4" />
                        <h3 className="text-lg font-bold text-primary-900 dark:text-white mb-2">Government Programs</h3>
                        <p className="text-sm text-primary-600 dark:text-primary-300 mb-4">
                            Explore government-backed financing and incentive programs
                        </p>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-start">
                                <CheckCircle className="w-4 h-4 text-semantic-success mr-2 mt-0.5 flex-shrink-0" />
                                <span className="text-primary-700 dark:text-primary-200">First-time buyer programs</span>
                            </li>
                            <li className="flex items-start">
                                <CheckCircle className="w-4 h-4 text-semantic-success mr-2 mt-0.5 flex-shrink-0" />
                                <span className="text-primary-700 dark:text-primary-200">Tax incentives</span>
                            </li>
                            <li className="flex items-start">
                                <CheckCircle className="w-4 h-4 text-semantic-success mr-2 mt-0.5 flex-shrink-0" />
                                <span className="text-primary-700 dark:text-primary-200">Development grants</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="bg-accent-gold/10 border border-accent-gold/30 p-6 rounded-xl mb-6">
                    <h3 className="font-bold text-primary-900 dark:text-white mb-3 flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-accent-gold" />
                        Financing Checklist
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-accent-gold mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-primary-700 dark:text-primary-200">Credit score and history</span>
                        </div>
                        <div className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-accent-gold mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-primary-700 dark:text-primary-200">Proof of income and assets</span>
                        </div>
                        <div className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-accent-gold mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-primary-700 dark:text-primary-200">Business plan or investment proposal</span>
                        </div>
                        <div className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-accent-gold mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-primary-700 dark:text-primary-200">Property valuation and market data</span>
                        </div>
                        <div className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-accent-gold mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-primary-700 dark:text-primary-200">Legal documentation</span>
                        </div>
                        <div className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-accent-gold mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-primary-700 dark:text-primary-200">Down payment funds ready</span>
                        </div>
                    </div>
                </div>

                <div className="bg-primary-50 dark:bg-primary-800 p-6 rounded-xl border border-primary-200 dark:border-primary-700">
                    <h3 className="font-semibold text-primary-900 dark:text-white mb-2">Need Expert Consultation?</h3>
                    <p className="text-sm text-primary-600 dark:text-primary-300 mb-4">
                        Our team can help you navigate the financing landscape, prepare your application,
                        and connect you with the right funding sources for your project.
                    </p>
                    <Link to="/book-consultation" className="btn btn-primary inline-flex items-center">
                        Book a Consultation
                    </Link>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default GettingFunded;
