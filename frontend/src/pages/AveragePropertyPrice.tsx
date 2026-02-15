import React from 'react';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import { BarChart3, MapPin } from 'lucide-react';

const AveragePropertyPrice: React.FC = () => {
    return (
        <AuthenticatedLayout>
            <div className="p-8 max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-primary-900 dark:text-white mb-2 flex items-center">
                        <BarChart3 className="w-8 h-8 mr-3 text-accent-gold" />
                        Average Property Price
                    </h1>
                    <p className="text-primary-600 dark:text-primary-300">
                        View average property prices across Douala and Yaoundé
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm">
                        <div className="flex items-center mb-4">
                            <MapPin className="w-6 h-6 text-accent-gold mr-2" />
                            <h2 className="text-xl font-bold text-primary-900 dark:text-white">Douala</h2>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-primary-500 dark:text-primary-400">Average Land Price</p>
                                <p className="text-2xl font-bold text-primary-900 dark:text-white">102,300 FCFA/m²</p>
                            </div>
                            <div>
                                <p className="text-sm text-primary-500 dark:text-primary-400">YoY Change</p>
                                <p className="text-lg font-semibold text-semantic-success">+12.3%</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm">
                        <div className="flex items-center mb-4">
                            <MapPin className="w-6 h-6 text-accent-gold mr-2" />
                            <h2 className="text-xl font-bold text-primary-900 dark:text-white">Yaoundé</h2>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-primary-500 dark:text-primary-400">Average Land Price</p>
                                <p className="text-2xl font-bold text-primary-900 dark:text-white">115,200 FCFA/m²</p>
                            </div>
                            <div>
                                <p className="text-sm text-primary-500 dark:text-primary-400">YoY Change</p>
                                <p className="text-lg font-semibold text-semantic-success">+8.1%</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-primary-50 dark:bg-primary-800 p-6 rounded-xl border border-primary-200 dark:border-primary-700">
                    <h3 className="font-semibold text-primary-900 dark:text-white mb-2">About Average Prices</h3>
                    <p className="text-sm text-primary-600 dark:text-primary-300">
                        Average prices are calculated by summing all property prices in our dataset and dividing by the
                        total number of properties. This metric can be influenced by high-end luxury properties.
                    </p>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default AveragePropertyPrice;
