import React from 'react';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import { TrendingUp, MapPin } from 'lucide-react';

const AnnualAppreciation: React.FC = () => {
    return (
        <AuthenticatedLayout>
            <div className="p-8 max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-primary-900 dark:text-white mb-2 flex items-center">
                        <TrendingUp className="w-8 h-8 mr-3 text-accent-gold" />
                        Annual Appreciation
                    </h1>
                    <p className="text-primary-600 dark:text-primary-300">
                        City-level annual property appreciation rates
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
                                <p className="text-sm text-primary-500 dark:text-primary-400">Annual Appreciation Rate</p>
                                <p className="text-4xl font-bold text-semantic-success">+12.3%</p>
                            </div>
                            <div>
                                <p className="text-sm text-primary-500 dark:text-primary-400">5-Year Average</p>
                                <p className="text-xl font-semibold text-primary-700 dark:text-primary-200">+9.8%</p>
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
                                <p className="text-sm text-primary-500 dark:text-primary-400">Annual Appreciation Rate</p>
                                <p className="text-4xl font-bold text-semantic-success">+8.1%</p>
                            </div>
                            <div>
                                <p className="text-sm text-primary-500 dark:text-primary-400">5-Year Average</p>
                                <p className="text-xl font-semibold text-primary-700 dark:text-primary-200">+7.5%</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm mb-6">
                    <h3 className="font-semibold text-primary-900 dark:text-white mb-4">Historical Trends</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-primary-50 dark:bg-primary-800 rounded-lg">
                            <p className="text-xs text-primary-500 dark:text-primary-400">2024</p>
                            <p className="text-lg font-bold text-semantic-success">+11.2%</p>
                        </div>
                        <div className="text-center p-3 bg-primary-50 dark:bg-primary-800 rounded-lg">
                            <p className="text-xs text-primary-500 dark:text-primary-400">2023</p>
                            <p className="text-lg font-bold text-semantic-success">+9.5%</p>
                        </div>
                        <div className="text-center p-3 bg-primary-50 dark:bg-primary-800 rounded-lg">
                            <p className="text-xs text-primary-500 dark:text-primary-400">2022</p>
                            <p className="text-lg font-bold text-semantic-success">+8.7%</p>
                        </div>
                        <div className="text-center p-3 bg-primary-50 dark:bg-primary-800 rounded-lg">
                            <p className="text-xs text-primary-500 dark:text-primary-400">2021</p>
                            <p className="text-lg font-bold text-semantic-success">+7.9%</p>
                        </div>
                    </div>
                </div>

                <div className="bg-primary-50 dark:bg-primary-800 p-6 rounded-xl border border-primary-200 dark:border-primary-700">
                    <h3 className="font-semibold text-primary-900 dark:text-white mb-2">About Appreciation Rates</h3>
                    <p className="text-sm text-primary-600 dark:text-primary-300">
                        Annual appreciation represents the year-over-year percentage increase in property values.
                        These city-level rates provide a general overview. Upgrade to Premium for neighborhood-specific
                        appreciation data and predictive analytics.
                    </p>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default AnnualAppreciation;
