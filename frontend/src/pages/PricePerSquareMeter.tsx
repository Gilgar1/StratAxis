import React from 'react';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import { Maximize2, MapPin } from 'lucide-react';

const PricePerSquareMeter: React.FC = () => {
    return (
        <AuthenticatedLayout>
            <div className="p-8 max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-primary-900 dark:text-white mb-2 flex items-center">
                        <Maximize2 className="w-8 h-8 mr-3 text-accent-gold" />
                        Price per Square Meter
                    </h1>
                    <p className="text-primary-600 dark:text-primary-300">
                        City-level price per square meter analysis
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
                                <p className="text-sm text-primary-500 dark:text-primary-400">Average Price/m²</p>
                                <p className="text-3xl font-bold text-primary-900 dark:text-white">97,632 FCFA</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs text-primary-500 dark:text-primary-400">Low Range</p>
                                    <p className="text-lg font-semibold text-primary-700 dark:text-primary-200">65,000</p>
                                </div>
                                <div>
                                    <p className="text-xs text-primary-500 dark:text-primary-400">High Range</p>
                                    <p className="text-lg font-semibold text-primary-700 dark:text-primary-200">145,000</p>
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
                                <p className="text-sm text-primary-500 dark:text-primary-400">Average Price/m²</p>
                                <p className="text-3xl font-bold text-primary-900 dark:text-white">108,000 FCFA</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs text-primary-500 dark:text-primary-400">Low Range</p>
                                    <p className="text-lg font-semibold text-primary-700 dark:text-primary-200">72,000</p>
                                </div>
                                <div>
                                    <p className="text-xs text-primary-500 dark:text-primary-400">High Range</p>
                                    <p className="text-lg font-semibold text-primary-700 dark:text-primary-200">165,000</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-primary-50 dark:bg-primary-800 p-6 rounded-xl border border-primary-200 dark:border-primary-700">
                    <h3 className="font-semibold text-primary-900 dark:text-white mb-2">City-Level Pricing</h3>
                    <p className="text-sm text-primary-600 dark:text-primary-300">
                        These are city-wide averages. For neighborhood-specific pricing, upgrade to our Premium plan
                        to access detailed granular data and interactive neighborhood comparisons.
                    </p>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default PricePerSquareMeter;
