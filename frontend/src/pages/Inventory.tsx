import React from 'react';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import { Package, TrendingDown, TrendingUp, MapPin, Download, FileText } from 'lucide-react';
import { exportToCSV, downloadAsPDF } from '../utils/exportUtils';
import WatchlistButton from '../components/common/WatchlistButton';

const inventoryData = [
    {
        city: 'Douala',
        monthsOfSupply: 4.2,
        trend: -0.3,
        totalListings: 1247,
        newListings30Days: 184,
        marketStatus: 'Balanced',
        neighborhoods: [
            { name: 'Akwa', months: 2.8, status: "Seller's Market", price: 118500 },
            { name: 'Bonanjo', months: 3.1, status: "Seller's Market", price: 108200 },
            { name: 'Bonapriso', months: 3.5, status: 'Balanced', price: 97632 },
            { name: 'Logbaba', months: 5.2, status: 'Balanced', price: 41000 },
            { name: 'Makepe', months: 5.8, status: 'Balanced', price: 52932 },
            { name: 'Kotto', months: 6.1, status: "Buyer's Market", price: 35000 },
        ],
    },
    {
        city: 'Yaoundé',
        monthsOfSupply: 4.7,
        trend: -0.2,
        totalListings: 1163,
        newListings30Days: 172,
        marketStatus: 'Balanced',
        neighborhoods: [
            { name: 'Bastos', months: 2.5, status: "Seller's Market", price: 124229 },
            { name: 'Nlongkak', months: 4.2, status: 'Balanced', price: 68000 },
            { name: 'Essos', months: 5.1, status: 'Balanced', price: 55000 },
            { name: 'Mvan', months: 5.6, status: 'Balanced', price: 42000 },
            { name: 'Odza', months: 6.3, status: "Buyer's Market", price: 38000 },
            { name: 'Mokolo', months: 6.8, status: "Buyer's Market", price: 31000 },
        ],
    },
];

const Inventory: React.FC = () => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case "Seller's Market":
                return 'bg-red-500/20 text-red-600 dark:text-red-400';
            case 'Balanced':
                return 'bg-semantic-success/20 text-semantic-success';
            case "Buyer's Market":
                return 'bg-blue-500/20 text-blue-600 dark:text-blue-400';
            default:
                return 'bg-primary-500/20 text-primary-600';
        }
    };

    const handleExportCSV = () => {
        const rows: Record<string, unknown>[] = [];
        inventoryData.forEach(city => {
            city.neighborhoods.forEach(n => {
                rows.push({
                    City: city.city,
                    Neighborhood: n.name,
                    'Months of Supply': n.months,
                    'Market Status': n.status,
                    'Approx. Median Price/m² (XAF)': n.price,
                    'City Total Listings': city.totalListings,
                    'New Listings (30d)': city.newListings30Days,
                });
            });
        });
        exportToCSV(rows, `StratAxis_Inventory_${new Date().toISOString().slice(0, 10)}`);
    };

    const handleDownloadPDF = () => {
        downloadAsPDF('StratAxis – Inventory & Market Supply Report');
    };

    return (
        <AuthenticatedLayout>
            <div className="p-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-primary-900 dark:text-white mb-2 flex items-center">
                            <Package className="w-8 h-8 mr-3 text-accent-gold" />
                            Inventory (Months of Supply)
                        </h1>
                        <p className="text-primary-600 dark:text-primary-300">
                            Property inventory and market supply analysis
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={handleDownloadPDF} className="btn btn-outline flex items-center">
                            <FileText className="w-4 h-4 mr-2" /> Download PDF
                        </button>
                        <button onClick={handleExportCSV} className="btn btn-outline flex items-center">
                            <Download className="w-4 h-4 mr-2" /> Export CSV
                        </button>
                    </div>
                </div>

                {inventoryData.map((city) => (
                    <div key={city.city} className="mb-8">
                        {/* City Overview */}
                        <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm mb-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <MapPin className="w-6 h-6 text-accent-gold mr-2" />
                                    <h2 className="text-2xl font-bold text-primary-900 dark:text-white">{city.city}</h2>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-primary-500 dark:text-primary-400">Months of Supply</p>
                                    <p className="text-4xl font-bold text-primary-900 dark:text-white">{city.monthsOfSupply}</p>
                                    <div className="flex items-center justify-end text-sm mt-1">
                                        {city.trend < 0 ? (
                                            <>
                                                <TrendingDown className="w-4 h-4 text-semantic-success mr-1" />
                                                <span className="text-semantic-success font-semibold">
                                                    {Math.abs(city.trend)} vs last month
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <TrendingUp className="w-4 h-4 text-red-500 mr-1" />
                                                <span className="text-red-500 font-semibold">
                                                    +{city.trend} vs last month
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-primary-50 dark:bg-primary-800 p-4 rounded-lg">
                                    <p className="text-sm text-primary-500 dark:text-primary-400 mb-1">Total Listings</p>
                                    <p className="text-2xl font-bold text-primary-900 dark:text-white">
                                        {city.totalListings.toLocaleString()}
                                    </p>
                                </div>
                                <div className="bg-primary-50 dark:bg-primary-800 p-4 rounded-lg">
                                    <p className="text-sm text-primary-500 dark:text-primary-400 mb-1">New (30 Days)</p>
                                    <p className="text-2xl font-bold text-primary-900 dark:text-white">
                                        {city.newListings30Days}
                                    </p>
                                </div>
                                <div className="bg-primary-50 dark:bg-primary-800 p-4 rounded-lg">
                                    <p className="text-sm text-primary-500 dark:text-primary-400 mb-1">Market Status</p>
                                    <p className="text-2xl font-bold text-semantic-success">{city.marketStatus}</p>
                                </div>
                            </div>
                        </div>

                        {/* Neighborhood Breakdown */}
                        <h3 className="text-lg font-bold text-primary-900 dark:text-white mb-4">Neighborhood Supply</h3>
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
                                            type="Land"
                                            currentPrice={neighborhood.price}
                                            change="+0%"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-primary-500 dark:text-primary-400">Supply</p>
                                            <p className="text-xl font-bold text-primary-900 dark:text-white">
                                                {neighborhood.months} mo
                                            </p>
                                        </div>
                                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold w-full text-center ${getStatusColor(neighborhood.status)}`}>
                                            {neighborhood.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="bg-primary-50 dark:bg-primary-800 p-6 rounded-xl border border-primary-200 dark:border-primary-700">
                    <h3 className="font-semibold text-primary-900 dark:text-white mb-3">Understanding Months of Supply</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <strong className="text-red-600 dark:text-red-400">0-4 Months:</strong>
                            <p className="text-primary-600 dark:text-primary-300 mt-1">
                                Seller's Market — Low inventory, strong demand, rising prices
                            </p>
                        </div>
                        <div>
                            <strong className="text-semantic-success">4-6 Months:</strong>
                            <p className="text-primary-600 dark:text-primary-300 mt-1">
                                Balanced Market — Supply and demand in equilibrium
                            </p>
                        </div>
                        <div>
                            <strong className="text-blue-600 dark:text-blue-400">6+ Months:</strong>
                            <p className="text-primary-600 dark:text-primary-300 mt-1">
                                Buyer's Market — High inventory, negotiating power for buyers
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default Inventory;
