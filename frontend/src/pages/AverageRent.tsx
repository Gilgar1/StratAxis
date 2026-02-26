import React from 'react';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import { Home, MapPin } from 'lucide-react';
import ExportBar from '../components/common/ExportBar';
import WatchlistButton from '../components/common/WatchlistButton';

const RENT_DATA = [
    {
        city: 'Douala',
        avgMonthly: 285000,
        studio: 150000,
        twoBedroom: 285000,
        threePlus: 450000,
    },
    {
        city: 'Yaoundé',
        avgMonthly: 310000,
        studio: 165000,
        twoBedroom: 310000,
        threePlus: 485000,
    },
];

const AverageRent: React.FC = () => {
    const csvRows = RENT_DATA.map(r => ({
        City: r.city,
        'Avg Monthly Rent (XAF)': r.avgMonthly,
        'Studio (XAF)': r.studio,
        '2 Bedroom (XAF)': r.twoBedroom,
        '3+ Bedroom (XAF)': r.threePlus,
    }));

    return (
        <AuthenticatedLayout>
            <div className="p-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-primary-900 dark:text-white mb-2 flex items-center">
                            <Home className="w-8 h-8 mr-3 text-accent-gold" />
                            Average Rent
                        </h1>
                        <p className="text-primary-600 dark:text-primary-300">City-level average rental prices</p>
                    </div>
                    <ExportBar
                        csvRows={csvRows}
                        csvFilename={`StratAxis_Average_Rent_${new Date().toISOString().slice(0, 10)}`}
                        pdfTitle="StratAxis – Average Rent Report"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {RENT_DATA.map(row => (
                        <div key={row.city} className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                    <MapPin className="w-6 h-6 text-accent-gold mr-2" />
                                    <h2 className="text-xl font-bold text-primary-900 dark:text-white">{row.city}</h2>
                                </div>
                                <WatchlistButton
                                    compact
                                    neighborhood={row.city}
                                    city={row.city}
                                    type="Avg Rent"
                                    currentPrice={row.avgMonthly}
                                    change="+0%"
                                />
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-primary-500 dark:text-primary-400">Average Monthly Rent</p>
                                    <p className="text-3xl font-bold text-primary-900 dark:text-white">
                                        {row.avgMonthly.toLocaleString()} FCFA
                                    </p>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="bg-primary-50 dark:bg-primary-800 p-3 rounded-lg">
                                        <p className="text-xs text-primary-500 dark:text-primary-400">Studio</p>
                                        <p className="text-sm font-bold text-primary-700 dark:text-primary-200">
                                            {(row.studio / 1000).toFixed(0)}K
                                        </p>
                                    </div>
                                    <div className="bg-primary-50 dark:bg-primary-800 p-3 rounded-lg">
                                        <p className="text-xs text-primary-500 dark:text-primary-400">2 Bedroom</p>
                                        <p className="text-sm font-bold text-primary-700 dark:text-primary-200">
                                            {(row.twoBedroom / 1000).toFixed(0)}K
                                        </p>
                                    </div>
                                    <div className="bg-primary-50 dark:bg-primary-800 p-3 rounded-lg">
                                        <p className="text-xs text-primary-500 dark:text-primary-400">3BR+</p>
                                        <p className="text-sm font-bold text-primary-700 dark:text-primary-200">
                                            {(row.threePlus / 1000).toFixed(0)}K
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-primary-50 dark:bg-primary-800 p-6 rounded-xl border border-primary-200 dark:border-primary-700">
                    <h3 className="font-semibold text-primary-900 dark:text-white mb-2">About Average Rent</h3>
                    <p className="text-sm text-primary-600 dark:text-primary-300">
                        These averages represent city-wide rental rates across all property types.
                        For detailed neighborhood-specific rental data, property type breakdowns, and historical trends,
                        explore the full Rental Intelligence page.
                    </p>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default AverageRent;
