import React from 'react';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import { Building2, TrendingUp, MapPin, HardHat, FileCheck } from 'lucide-react';
import ExportBar from '../components/common/ExportBar';
import WatchlistButton from '../components/common/WatchlistButton';

const constructionData = [
    {
        city: 'Douala',
        totalPermits2024: 1842,
        residentialPermits: 1245,
        commercialPermits: 597,
        yoyGrowth: 18.5,
        avgProcessingDays: 45,
        neighborhoods: [
            { name: 'Akwa', permits: 142, type: 'Mixed', growth: 12 },
            { name: 'Bonanjo', permits: 98, type: 'Commercial', growth: 8 },
            { name: 'Bonapriso', permits: 176, type: 'Residential', growth: 22 },
            { name: 'Logbaba', permits: 284, type: 'Residential', growth: 35 },
            { name: 'Makepe', permits: 312, type: 'Residential', growth: 28 },
            { name: 'Kotto', permits: 198, type: 'Mixed', growth: 15 },
        ],
    },
    {
        city: 'Yaoundé',
        totalPermits2024: 1654,
        residentialPermits: 1124,
        commercialPermits: 530,
        yoyGrowth: 15.2,
        avgProcessingDays: 52,
        neighborhoods: [
            { name: 'Bastos', permits: 165, type: 'Residential', growth: 20 },
            { name: 'Nlongkak', permits: 224, type: 'Mixed', growth: 18 },
            { name: 'Essos', permits: 268, type: 'Residential', growth: 25 },
            { name: 'Mvan', permits: 189, type: 'Residential', growth: 12 },
            { name: 'Odza', permits: 242, type: 'Mixed', growth: 16 },
            { name: 'Mokolo', permits: 156, type: 'Commercial', growth: 9 },
        ],
    },
];

const ConstructionPermitVolume: React.FC = () => {
    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Residential': return 'bg-blue-500/20 text-blue-600 dark:text-blue-400';
            case 'Commercial': return 'bg-purple-500/20 text-purple-600 dark:text-purple-400';
            case 'Mixed': return 'bg-accent-gold/20 text-accent-gold';
            default: return 'bg-primary-500/20 text-primary-600';
        }
    };

    const csvRows: Record<string, unknown>[] = [];
    constructionData.forEach(city => {
        city.neighborhoods.forEach(n => {
            csvRows.push({
                City: city.city,
                Neighborhood: n.name,
                'Permits Issued (2024)': n.permits,
                'Development Type': n.type,
                'YoY Growth (%)': n.growth,
                'City Total Permits': city.totalPermits2024,
                'City YoY Growth (%)': city.yoyGrowth,
            });
        });
    });

    return (
        <AuthenticatedLayout>
            <div className="p-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-primary-900 dark:text-white mb-2 flex items-center">
                            <Building2 className="w-8 h-8 mr-3 text-accent-gold" />
                            Construction &amp; Permit Volume
                        </h1>
                        <p className="text-primary-600 dark:text-primary-300">
                            Construction permits and development activity tracking
                        </p>
                    </div>
                    <ExportBar
                        csvRows={csvRows}
                        csvFilename={`StratAxis_Construction_Permits_${new Date().toISOString().slice(0, 10)}`}
                        pdfTitle="StratAxis – Construction & Permit Volume Report"
                    />
                </div>

                {constructionData.map((city) => (
                    <div key={city.city} className="mb-8">
                        {/* City Overview */}
                        <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm mb-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <MapPin className="w-6 h-6 text-accent-gold mr-2" />
                                    <h2 className="text-2xl font-bold text-primary-900 dark:text-white">{city.city}</h2>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-primary-500 dark:text-primary-400">Total Permits (2024)</p>
                                    <p className="text-4xl font-bold text-primary-900 dark:text-white">
                                        {city.totalPermits2024.toLocaleString()}
                                    </p>
                                    <div className="flex items-center justify-end text-sm mt-1">
                                        <TrendingUp className="w-4 h-4 text-semantic-success mr-1" />
                                        <span className="text-semantic-success font-semibold">+{city.yoyGrowth}% vs 2023</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <div className="flex items-center text-blue-600 dark:text-blue-400 mb-1">
                                        <HardHat className="w-4 h-4 mr-1" />
                                        <p className="text-sm font-semibold">Residential</p>
                                    </div>
                                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                        {city.residentialPermits.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                        {((city.residentialPermits / city.totalPermits2024) * 100).toFixed(0)}% of total
                                    </p>
                                </div>
                                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                                    <div className="flex items-center text-purple-600 dark:text-purple-400 mb-1">
                                        <Building2 className="w-4 h-4 mr-1" />
                                        <p className="text-sm font-semibold">Commercial</p>
                                    </div>
                                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                                        {city.commercialPermits.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                                        {((city.commercialPermits / city.totalPermits2024) * 100).toFixed(0)}% of total
                                    </p>
                                </div>
                                <div className="bg-primary-50 dark:bg-primary-800 p-4 rounded-lg">
                                    <div className="flex items-center text-primary-600 dark:text-primary-400 mb-1">
                                        <FileCheck className="w-4 h-4 mr-1" />
                                        <p className="text-sm">Avg. Processing</p>
                                    </div>
                                    <p className="text-2xl font-bold text-primary-900 dark:text-white">
                                        {city.avgProcessingDays} days
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Neighborhood Activity */}
                        <h3 className="text-lg font-bold text-primary-900 dark:text-white mb-4">Neighborhood Development Activity</h3>
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
                                            type="Construction Activity"
                                            currentPrice={0}
                                            change={`+${neighborhood.growth}%`}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-primary-500 dark:text-primary-400">Permits Issued</p>
                                            <p className="text-2xl font-bold text-primary-900 dark:text-white">{neighborhood.permits}</p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-primary-500 dark:text-primary-400">YoY Growth</p>
                                            <div className="flex items-center">
                                                <TrendingUp className="w-4 h-4 text-semantic-success mr-1" />
                                                <p className="text-lg font-semibold text-semantic-success">+{neighborhood.growth}%</p>
                                            </div>
                                        </div>
                                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold w-full text-center ${getTypeColor(neighborhood.type)}`}>
                                            {neighborhood.type} Focus
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center">
                            <TrendingUp className="w-5 h-5 mr-2" />
                            What High Permit Volume Indicates
                        </h3>
                        <ul className="text-sm text-blue-700 dark:text-blue-200 space-y-1">
                            <li>• Strong developer confidence in the market</li>
                            <li>• Anticipated population growth and demand</li>
                            <li>• Economic expansion and investment activity</li>
                            <li>• Potential future supply increases</li>
                        </ul>
                    </div>
                    <div className="bg-accent-gold/10 p-6 rounded-xl border border-accent-gold/30">
                        <h3 className="font-semibold text-primary-900 dark:text-white mb-2 flex items-center">
                            <FileCheck className="w-5 h-5 mr-2 text-accent-gold" />
                            Investment Insights
                        </h3>
                        <ul className="text-sm text-primary-700 dark:text-primary-200 space-y-1">
                            <li>• High activity = growth but future competition</li>
                            <li>• Monitor ratio of residential vs commercial</li>
                            <li>• Track neighborhoods with sustained growth</li>
                            <li>• Consider entry before oversupply</li>
                        </ul>
                    </div>
                </div>

                <div className="bg-primary-50 dark:bg-primary-800 p-6 rounded-xl border border-primary-200 dark:border-primary-700">
                    <h3 className="font-semibold text-primary-900 dark:text-white mb-2">Data Sources</h3>
                    <p className="text-sm text-primary-600 dark:text-primary-300">
                        Permit data aggregated from municipal building departments, updated monthly.
                        Includes all residential, commercial, and mixed-use construction permits issued in 2024.
                    </p>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default ConstructionPermitVolume;
