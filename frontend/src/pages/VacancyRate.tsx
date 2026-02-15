import React from 'react';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import { Home, TrendingDown, MapPin, AlertCircle } from 'lucide-react';

const VacancyRate: React.FC = () => {
    const cityData = [
        {
            city: 'Douala',
            currentRate: 5.8,
            trend: -0.3,
            avgDaysVacant: 28,
            neighborhoods: [
                { name: 'Akwa', rate: 3.2, demand: 'High' },
                { name: 'Bonanjo', rate: 4.1, demand: 'High' },
                { name: 'Bonapriso', rate: 3.8, demand: 'High' },
                { name: 'Logbaba', rate: 6.5, demand: 'Medium' },
                { name: 'Makepe', rate: 7.2, demand: 'Medium' },
                { name: 'Kotto', rate: 8.1, demand: 'Medium' },
            ]
        },
        {
            city: 'Yaoundé',
            currentRate: 6.2,
            trend: -0.5,
            avgDaysVacant: 32,
            neighborhoods: [
                { name: 'Bastos', rate: 2.9, demand: 'High' },
                { name: 'Nlongkak', rate: 5.3, demand: 'Medium' },
                { name: 'Essos', rate: 6.8, demand: 'Medium' },
                { name: 'Mvan', rate: 7.5, demand: 'Medium' },
                { name: 'Odza', rate: 7.9, demand: 'Medium' },
                { name: 'Mokolo', rate: 9.2, demand: 'Low' },
            ]
        }
    ];

    return (
        <AuthenticatedLayout>
            <div className="p-8 max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-primary-900 dark:text-white mb-2 flex items-center">
                        <Home className="w-8 h-8 mr-3 text-accent-gold" />
                        Vacancy Rate
                    </h1>
                    <p className="text-primary-600 dark:text-primary-300">
                        Current vacancy rates and rental market health indicators
                    </p>
                </div>

                {cityData.map((city) => (
                    <div key={city.city} className="mb-8">
                        {/* City Overview */}
                        <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm mb-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <MapPin className="w-6 h-6 text-accent-gold mr-2" />
                                    <h2 className="text-2xl font-bold text-primary-900 dark:text-white">{city.city}</h2>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-primary-500 dark:text-primary-400">Current Vacancy Rate</p>
                                    <p className="text-4xl font-bold text-semantic-success">{city.currentRate}%</p>
                                    <div className="flex items-center justify-end text-sm mt-1">
                                        <TrendingDown className="w-4 h-4 text-semantic-success mr-1" />
                                        <span className="text-semantic-success font-semibold">{Math.abs(city.trend)}% vs last quarter</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-primary-50 dark:bg-primary-800 p-4 rounded-lg">
                                    <p className="text-sm text-primary-500 dark:text-primary-400 mb-1">Average Days Vacant</p>
                                    <p className="text-2xl font-bold text-primary-900 dark:text-white">{city.avgDaysVacant} days</p>
                                </div>
                                <div className="bg-primary-50 dark:bg-primary-800 p-4 rounded-lg">
                                    <p className="text-sm text-primary-500 dark:text-primary-400 mb-1">Market Health</p>
                                    <p className="text-2xl font-bold text-semantic-success">Strong</p>
                                </div>
                            </div>
                        </div>

                        {/* Neighborhood Breakdown */}
                        <h3 className="text-lg font-bold text-primary-900 dark:text-white mb-4">Neighborhood Breakdown</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                            {city.neighborhoods.map((neighborhood) => (
                                <div
                                    key={neighborhood.name}
                                    className="bg-white dark:bg-primary-900 p-4 rounded-lg border border-primary-200 dark:border-primary-800"
                                >
                                    <h4 className="font-semibold text-primary-900 dark:text-white mb-2">{neighborhood.name}</h4>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-primary-500 dark:text-primary-400">Vacancy</p>
                                            <p className="text-xl font-bold text-primary-900 dark:text-white">{neighborhood.rate}%</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-primary-500 dark:text-primary-400">Demand</p>
                                            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${neighborhood.demand === 'High'
                                                    ? 'bg-semantic-success/20 text-semantic-success'
                                                    : neighborhood.demand === 'Medium'
                                                        ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                                                        : 'bg-red-500/20 text-red-600 dark:text-red-400'
                                                }`}>
                                                {neighborhood.demand}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start">
                        <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">What's a Healthy Vacancy Rate?</h3>
                            <p className="text-sm text-blue-700 dark:text-blue-200">
                                A vacancy rate between 5-8% is generally considered healthy, indicating balanced supply and demand.
                                Rates below 5% suggest a landlord's market with strong demand, while rates above 8% may indicate oversupply.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default VacancyRate;
