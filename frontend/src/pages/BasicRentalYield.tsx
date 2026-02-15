import React from 'react';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import { Percent, MapPin, Info } from 'lucide-react';

const BasicRentalYield: React.FC = () => {
    return (
        <AuthenticatedLayout>
            <div className="p-8 max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-primary-900 dark:text-white mb-2 flex items-center">
                        <Percent className="w-8 h-8 mr-3 text-accent-gold" />
                        Basic Rental Yield
                    </h1>
                    <p className="text-primary-600 dark:text-primary-300">
                        City average rental yield calculations
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm">
                        <div className="flex items-center mb-4">
                            <MapPin className="w-6 h-6 text-accent-gold mr-2" />
                            <h2 className="text-xl font-bold text-primary-900 dark:text-white">Douala</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-primary-500 dark:text-primary-400">Average Gross Yield</p>
                                <p className="text-4xl font-bold text-semantic-success">7.2%</p>
                            </div>
                            <div className="pt-3 border-t border-primary-100 dark:border-primary-700">
                                <p className="text-xs text-primary-500 dark:text-primary-400 mb-2">Calculation Basis</p>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-primary-600 dark:text-primary-300">Avg. Property Value:</span>
                                        <span className="font-semibold text-primary-900 dark:text-white">47.5M FCFA</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-primary-600 dark:text-primary-300">Avg. Annual Rent:</span>
                                        <span className="font-semibold text-primary-900 dark:text-white">3.42M FCFA</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm">
                        <div className="flex items-center mb-4">
                            <MapPin className="w-6 h-6 text-accent-gold mr-2" />
                            <h2 className="text-xl font-bold text-primary-900 dark:text-white">Yaoundé</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-primary-500 dark:text-primary-400">Average Gross Yield</p>
                                <p className="text-4xl font-bold text-semantic-success">6.8%</p>
                            </div>
                            <div className="pt-3 border-t border-primary-100 dark:border-primary-700">
                                <p className="text-xs text-primary-500 dark:text-primary-400 mb-2">Calculation Basis</p>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-primary-600 dark:text-primary-300">Avg. Property Value:</span>
                                        <span className="font-semibold text-primary-900 dark:text-white">54.8M FCFA</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-primary-600 dark:text-primary-300">Avg. Annual Rent:</span>
                                        <span className="font-semibold text-primary-900 dark:text-white">3.72M FCFA</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800 mb-6">
                    <div className="flex items-start">
                        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">How Basic Yield is Calculated</h3>
                            <p className="text-sm text-blue-700 dark:text-blue-200">
                                Basic Rental Yield = (Annual Rental Income / Property Value) × 100
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-300 mt-2">
                                Note: This is a gross yield calculation and does not account for expenses, taxes, or vacancy rates.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-primary-50 dark:bg-primary-800 p-6 rounded-xl border border-primary-200 dark:border-primary-700">
                    <h3 className="font-semibold text-primary-900 dark:text-white mb-2">Unlock Advanced Yield Analysis</h3>
                    <p className="text-sm text-primary-600 dark:text-primary-300">
                        Upgrade to Premium to access net yield calculations, neighborhood-specific yields,
                        property type comparisons, and ROI projections with our advanced scenario modeling tools.
                    </p>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default BasicRentalYield;
