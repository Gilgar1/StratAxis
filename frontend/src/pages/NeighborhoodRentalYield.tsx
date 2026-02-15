import React, { useState } from 'react';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import { Percent, MapPin, TrendingUp, Filter } from 'lucide-react';

const NeighborhoodRentalYield: React.FC = () => {
    const [selectedCity, setSelectedCity] = useState<'douala' | 'yaounde'>('douala');

    const doualaNeighborhoods = [
        { name: 'Akwa', grossYield: 8.2, netYield: 6.1, avgRent: 450000, avgPrice: 65800000 },
        { name: 'Bonanjo', grossYield: 7.8, netYield: 5.9, avgRent: 420000, avgPrice: 64600000 },
        { name: 'Bonapriso', grossYield: 7.5, netYield: 5.6, avgRent: 520000, avgPrice: 83200000 },
        { name: 'Logbaba', grossYield: 9.1, netYield: 7.2, avgRent: 280000, avgPrice: 36900000 },
        { name: 'Kotto', grossYield: 8.8, netYield: 6.9, avgRent: 310000, avgPrice: 42300000 },
        { name: 'Makepe', grossYield: 8.5, netYield: 6.6, avgRent: 295000, avgPrice: 41600000 },
    ];

    const yaoundeNeighborhoods = [
        { name: 'Bastos', grossYield: 6.9, netYield: 5.1, avgRent: 580000, avgPrice: 100800000 },
        { name: 'Nlongkak', grossYield: 7.6, netYield: 5.8, avgRent: 380000, avgPrice: 60000000 },
        { name: 'Essos', grossYield: 8.3, netYield: 6.4, avgRent: 320000, avgPrice: 46200000 },
        { name: 'Mvan', grossYield: 8.7, netYield: 6.8, avgRent: 285000, avgPrice: 39300000 },
        { name: 'Odza', grossYield: 8.4, netYield: 6.5, avgRent: 295000, avgPrice: 42100000 },
        { name: 'Mokolo', grossYield: 9.2, netYield: 7.3, avgRent: 240000, avgPrice: 31300000 },
    ];

    const neighborhoods = selectedCity === 'douala' ? doualaNeighborhoods : yaoundeNeighborhoods;

    return (
        <AuthenticatedLayout>
            <div className="p-8 max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-primary-900 dark:text-white mb-2 flex items-center">
                        <Percent className="w-8 h-8 mr-3 text-accent-gold" />
                        Neighborhood Rental Yield
                    </h1>
                    <p className="text-primary-600 dark:text-primary-300">
                        Detailed rental yield analysis by neighborhood
                    </p>
                </div>

                {/* City Selector */}
                <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm mb-6">
                    <div className="flex items-center mb-4">
                        <Filter className="w-5 h-5 text-accent-gold mr-2" />
                        <h3 className="font-semibold text-primary-900 dark:text-white">Select City</h3>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setSelectedCity('douala')}
                            className={`px-6 py-3 rounded-lg font-semibold transition-all ${selectedCity === 'douala'
                                    ? 'bg-accent-gold text-white shadow-lg'
                                    : 'bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-700'
                                }`}
                        >
                            Douala
                        </button>
                        <button
                            onClick={() => setSelectedCity('yaounde')}
                            className={`px-6 py-3 rounded-lg font-semibold transition-all ${selectedCity === 'yaounde'
                                    ? 'bg-accent-gold text-white shadow-lg'
                                    : 'bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-700'
                                }`}
                        >
                            Yaoundé
                        </button>
                    </div>
                </div>

                {/* Neighborhood Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {neighborhoods.map((neighborhood) => (
                        <div
                            key={neighborhood.name}
                            className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-center mb-4">
                                <MapPin className="w-5 h-5 text-accent-gold mr-2" />
                                <h3 className="text-lg font-bold text-primary-900 dark:text-white">{neighborhood.name}</h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-primary-500 dark:text-primary-400">Gross Yield</p>
                                    <p className="text-3xl font-bold text-semantic-success">{neighborhood.grossYield}%</p>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-primary-100 dark:border-primary-700">
                                    <div>
                                        <p className="text-xs text-primary-500 dark:text-primary-400">Net Yield</p>
                                        <p className="text-lg font-semibold text-primary-700 dark:text-primary-200">{neighborhood.netYield}%</p>
                                    </div>
                                    <TrendingUp className="w-5 h-5 text-semantic-success" />
                                </div>

                                <div className="pt-3 border-t border-primary-100 dark:border-primary-700">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-primary-600 dark:text-primary-400">Avg. Rent/mo</span>
                                        <span className="font-semibold text-primary-900 dark:text-white">
                                            {neighborhood.avgRent.toLocaleString()} FCFA
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-primary-600 dark:text-primary-400">Avg. Price</span>
                                        <span className="font-semibold text-primary-900 dark:text-white">
                                            {(neighborhood.avgPrice / 1000000).toFixed(1)}M FCFA
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-primary-50 dark:bg-primary-800 p-6 rounded-xl border border-primary-200 dark:border-primary-700 mt-8">
                    <h3 className="font-semibold text-primary-900 dark:text-white mb-2">Understanding Yields</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-primary-600 dark:text-primary-300">
                        <div>
                            <strong>Gross Yield:</strong> Annual rental income divided by property purchase price (before expenses)
                        </div>
                        <div>
                            <strong>Net Yield:</strong> Gross yield minus operating expenses, taxes, and vacancy allowance
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default NeighborhoodRentalYield;
