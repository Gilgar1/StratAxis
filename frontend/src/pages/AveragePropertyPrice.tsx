import React from 'react';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import { BarChart3, MapPin } from 'lucide-react';
import ExportBar from '../components/common/ExportBar';
import WatchlistButton from '../components/common/WatchlistButton';

const PRICE_DATA = [
    { city: 'Douala', avgPrice: 102300, yoy: 12.3 },
    { city: 'Yaoundé', avgPrice: 115200, yoy: 8.1 },
];

const AveragePropertyPrice: React.FC = () => {
    const csvRows = PRICE_DATA.map(r => ({
        City: r.city,
        'Avg Land Price (XAF/m²)': r.avgPrice,
        'YoY Change (%)': r.yoy,
    }));

    return (
        <AuthenticatedLayout>
            <div className="p-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-primary-900 dark:text-white mb-2 flex items-center">
                            <BarChart3 className="w-8 h-8 mr-3 text-accent-gold" />
                            Average Property Price
                        </h1>
                        <p className="text-primary-600 dark:text-primary-300">View average property prices across Douala and Yaoundé</p>
                    </div>
                    <ExportBar
                        csvRows={csvRows}
                        csvFilename={`StratAxis_Avg_Property_Price_${new Date().toISOString().slice(0, 10)}`}
                        pdfTitle="StratAxis – Average Property Price Report"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {PRICE_DATA.map(row => (
                        <div key={row.city} className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                    <MapPin className="w-6 h-6 text-accent-gold mr-2" />
                                    <h2 className="text-xl font-bold text-primary-900 dark:text-white">{row.city}</h2>
                                </div>
                                <WatchlistButton compact neighborhood={row.city} city={row.city} type="Avg Price" currentPrice={row.avgPrice} change={`+${row.yoy}%`} />
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-primary-500 dark:text-primary-400">Average Land Price</p>
                                    <p className="text-2xl font-bold text-primary-900 dark:text-white">{row.avgPrice.toLocaleString()} FCFA/m²</p>
                                </div>
                                <div>
                                    <p className="text-sm text-primary-500 dark:text-primary-400">YoY Change</p>
                                    <p className="text-lg font-semibold text-semantic-success">+{row.yoy}%</p>
                                </div>
                            </div>
                        </div>
                    ))}
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
