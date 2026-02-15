import React from 'react';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import { Home, MapPin } from 'lucide-react';

const AverageRent: React.FC = () => {
    return (
        <AuthenticatedLayout>
            <div className="p-8 max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-primary-900 dark:text-white mb-2 flex items-center">
                        <Home className="w-8 h-8 mr-3 text-accent-gold" />
                        Average Rent
                    </h1>
                    <p className="text-primary-600 dark:text-primary-300">
                        City-level average rental prices
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
                                <p className="text-sm text-primary-500 dark:text-primary-400">Average Monthly Rent</p>
                                <p className="text-3xl font-bold text-primary-900 dark:text-white">285,000 FCFA</p>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <p className="text-xs text-primary-500 dark:text-primary-400">Studio</p>
                                    <p className="text-sm font-semibold text-primary-700 dark:text-primary-200">150K</p>
                                </div>
                                <div>
                                    <p className="text-xs text-primary-500 dark:text-primary-400">2BR</p>
                                    <p className="text-sm font-semibold text-primary-700 dark:text-primary-200">285K</p>
                                </div>
                                <div>
                                    <p className="text-xs text-primary-500 dark:text-primary-400">3BR+</p>
                                    <p className="text-sm font-semibold text-primary-700 dark:text-primary-200">450K</p>
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
                                <p className="text-sm text-primary-500 dark:text-primary-400">Average Monthly Rent</p>
                                <p className="text-3xl font-bold text-primary-900 dark:text-white">310,000 FCFA</p>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <p className="text-xs text-primary-500 dark:text-primary-400">Studio</p>
                                    <p className="text-sm font-semibold text-primary-700 dark:text-primary-200">165K</p>
                                </div>
                                <div>
                                    <p className="text-xs text-primary-500 dark:text-primary-400">2BR</p>
                                    <p className="text-sm font-semibold text-primary-700 dark:text-primary-200">310K</p>
                                </div>
                                <div>
                                    <p className="text-xs text-primary-500 dark:text-primary-400">3BR+</p>
                                    <p className="text-sm font-semibold text-primary-700 dark:text-primary-200">485K</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-primary-50 dark:bg-primary-800 p-6 rounded-xl border border-primary-200 dark:border-primary-700">
                    <h3 className="font-semibold text-primary-900 dark:text-white mb-2">About Average Rent</h3>
                    <p className="text-sm text-primary-600 dark:text-primary-300">
                        These averages represent city-wide rental rates across all property types.
                        For detailed neighborhood-specific rental data, property type breakdowns, and historical trends,
                        upgrade to our Premium plan.
                    </p>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default AverageRent;
