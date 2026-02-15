import React from 'react';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import { TrendingUp, MapPin } from 'lucide-react';

const MedianPropertyPrice: React.FC = () => {
    return (
        <AuthenticatedLayout>
            <div className="p-8 max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-primary-900 dark:text-white mb-2 flex items-center">
                        <TrendingUp className="w-8 h-8 mr-3 text-accent-gold" />
                        Median Property Price
                    </h1>
                    <p className="text-primary-600 dark:text-primary-300">
                        View median property prices across Douala and Yaoundé
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
                                <p className="text-sm text-primary-500 dark:text-primary-400">Median Land Price</p>
                                <p className="text-2xl font-bold text-primary-900 dark:text-white">97,500 FCFA/m²</p>
                            </div>
                            <div>
                                <p className="text-sm text-primary-500 dark:text-primary-400">Sample Size</p>
                                <p className="text-lg font-semibold text-primary-700 dark:text-primary-200">250+ listings</p>
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
                                <p className="text-sm text-primary-500 dark:text-primary-400">Median Land Price</p>
                                <p className="text-2xl font-bold text-primary-900 dark:text-white">108,000 FCFA/m²</p>
                            </div>
                            <div>
                                <p className="text-sm text-primary-500 dark:text-primary-400">Sample Size</p>
                                <p className="text-lg font-semibold text-primary-700 dark:text-primary-200">260+ listings</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-primary-50 dark:bg-primary-800 p-6 rounded-xl border border-primary-200 dark:border-primary-700">
                    <h3 className="font-semibold text-primary-900 dark:text-white mb-2">About Median Prices</h3>
                    <p className="text-sm text-primary-600 dark:text-primary-300">
                        Median prices represent the middle value in our dataset, providing a more accurate representation
                        of typical property prices by reducing the impact of outliers and extreme values.
                    </p>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default MedianPropertyPrice;
