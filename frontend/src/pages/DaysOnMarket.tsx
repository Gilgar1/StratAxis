import React from 'react';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import { Clock, TrendingDown, MapPin, Calendar } from 'lucide-react';
import ExportBar from '../components/common/ExportBar';
import WatchlistButton from '../components/common/WatchlistButton';

const DaysOnMarket: React.FC = () => {
    const marketData = [
        {
            city: 'Douala',
            avgDays: 42,
            medianDays: 38,
            trend: -5,
            fastestSales: 18,
            neighborhoods: [
                { name: 'Akwa', avgDays: 28, medianDays: 25, speed: 'Fast' },
                { name: 'Bonanjo', avgDays: 32, medianDays: 29, speed: 'Fast' },
                { name: 'Bonapriso', avgDays: 35, medianDays: 32, speed: 'Average' },
                { name: 'Logbaba', avgDays: 48, medianDays: 45, speed: 'Average' },
                { name: 'Makepe', avgDays: 52, medianDays: 49, speed: 'Slow' },
                { name: 'Kotto', avgDays: 58, medianDays: 54, speed: 'Slow' },
            ]
        },
        {
            city: 'Yaoundé',
            avgDays: 46,
            medianDays: 41,
            trend: -3,
            fastestSales: 21,
            neighborhoods: [
                { name: 'Bastos', avgDays: 25, medianDays: 22, speed: 'Fast' },
                { name: 'Nlongkak', avgDays: 39, medianDays: 36, speed: 'Average' },
                { name: 'Essos', avgDays: 47, medianDays: 43, speed: 'Average' },
                { name: 'Mvan', avgDays: 51, medianDays: 48, speed: 'Slow' },
                { name: 'Odza', avgDays: 56, medianDays: 52, speed: 'Slow' },
                { name: 'Mokolo', avgDays: 62, medianDays: 58, speed: 'Slow' },
            ]
        }
    ];

    const getSpeedColor = (speed: string) => {
        switch (speed) {
            case 'Fast':
                return 'bg-semantic-success/20 text-semantic-success';
            case 'Average':
                return 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400';
            case 'Slow':
                return 'bg-red-500/20 text-red-600 dark:text-red-400';
            default:
                return 'bg-primary-500/20 text-primary-600';
        }
    };

    const csvRows: Record<string, unknown>[] = [];
    marketData.forEach(city => {
        city.neighborhoods.forEach(n => {
            csvRows.push({
                City: city.city,
                Neighborhood: n.name,
                'Avg Days on Market': n.avgDays,
                'Median Days on Market': n.medianDays,
                'Market Speed': n.speed,
                'City Avg Days': city.avgDays,
                'Fastest Sales (city)': city.fastestSales,
            });
        });
    });

    return (
        <AuthenticatedLayout>
            <div className="p-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-primary-900 dark:text-white mb-2 flex items-center">
                            <Clock className="w-8 h-8 mr-3 text-accent-gold" />
                            Days on Market
                        </h1>
                        <p className="text-primary-600 dark:text-primary-300">
                            Average time properties spend on the market before selling
                        </p>
                    </div>
                    <ExportBar
                        csvRows={csvRows}
                        csvFilename={`StratAxis_Days_On_Market_${new Date().toISOString().slice(0, 10)}`}
                        pdfTitle="StratAxis – Days on Market Report"
                    />
                </div>

                {marketData.map((city) => (
                    <div key={city.city} className="mb-8">
                        {/* City Overview */}
                        <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm mb-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <MapPin className="w-6 h-6 text-accent-gold mr-2" />
                                    <h2 className="text-2xl font-bold text-primary-900 dark:text-white">{city.city}</h2>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-primary-500 dark:text-primary-400">Average Days</p>
                                    <p className="text-4xl font-bold text-primary-900 dark:text-white">{city.avgDays}</p>
                                    <div className="flex items-center justify-end text-sm mt-1">
                                        <TrendingDown className="w-4 h-4 text-semantic-success mr-1" />
                                        <span className="text-semantic-success font-semibold">
                                            {Math.abs(city.trend)} days vs last month
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-primary-50 dark:bg-primary-800 p-4 rounded-lg">
                                    <div className="flex items-center text-primary-500 dark:text-primary-400 mb-1">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        <p className="text-sm">Median Days</p>
                                    </div>
                                    <p className="text-2xl font-bold text-primary-900 dark:text-white">{city.medianDays}</p>
                                </div>
                                <div className="bg-primary-50 dark:bg-primary-800 p-4 rounded-lg">
                                    <p className="text-sm text-primary-500 dark:text-primary-400 mb-1">Fastest Sales</p>
                                    <p className="text-2xl font-bold text-semantic-success">{city.fastestSales} days</p>
                                </div>
                                <div className="bg-primary-50 dark:bg-primary-800 p-4 rounded-lg">
                                    <p className="text-sm text-primary-500 dark:text-primary-400 mb-1">Market Speed</p>
                                    <p className="text-2xl font-bold text-semantic-success">Moderate</p>
                                </div>
                            </div>
                        </div>

                        {/* Neighborhood Breakdown */}
                        <h3 className="text-lg font-bold text-primary-900 dark:text-white mb-4">Neighborhood Timeline</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                            {city.neighborhoods.map((neighborhood) => (
                                <div
                                    key={neighborhood.name}
                                    className="bg-white dark:bg-primary-900 p-4 rounded-lg border border-primary-200 dark:border-primary-800 hover:border-accent-gold/50 transition-colors"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="font-semibold text-primary-900 dark:text-white">{neighborhood.name}</h4>
                                        <WatchlistButton
                                            compact
                                            neighborhood={neighborhood.name}
                                            city={city.city}
                                            type="Days on Market"
                                            currentPrice={0}
                                            change="—"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-primary-500 dark:text-primary-400">Average</p>
                                            <p className="text-xl font-bold text-primary-900 dark:text-white">
                                                {neighborhood.avgDays} days
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-primary-500 dark:text-primary-400">Median</p>
                                            <p className="text-lg font-semibold text-primary-700 dark:text-primary-200">
                                                {neighborhood.medianDays} days
                                            </p>
                                        </div>
                                        <div>
                                            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold w-full text-center ${getSpeedColor(neighborhood.speed)}`}>
                                                {neighborhood.speed} Moving
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="bg-primary-50 dark:bg-primary-800 p-6 rounded-xl border border-primary-200 dark:border-primary-700">
                    <h3 className="font-semibold text-primary-900 dark:text-white mb-3">What Days on Market Reveals</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <strong className="text-semantic-success">Under 30 Days:</strong>
                            <p className="text-primary-600 dark:text-primary-300 mt-1">
                                Hot market with high demand. Properties sell quickly, often with multiple offers.
                            </p>
                        </div>
                        <div>
                            <strong className="text-yellow-600 dark:text-yellow-400">30-60 Days:</strong>
                            <p className="text-primary-600 dark:text-primary-300 mt-1">
                                Normal market conditions. Standard timeframe for property transactions.
                            </p>
                        </div>
                        <div>
                            <strong className="text-red-600 dark:text-red-400">Over 60 Days:</strong>
                            <p className="text-primary-600 dark:text-primary-300 mt-1">
                                Slower market. May indicate overpricing or lower demand in the area.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default DaysOnMarket;
