import React from 'react';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import { Percent, MapPin, Info } from 'lucide-react';
import ExportBar from '../components/common/ExportBar';
import WatchlistButton from '../components/common/WatchlistButton';

const YIELD_DATA = [
    { city: 'Douala', grossYield: 7.2, propertyValue: 47500000, annualRent: 3420000 },
    { city: 'Yaoundé', grossYield: 6.8, propertyValue: 54800000, annualRent: 3724000 },
];

const BasicRentalYield: React.FC = () => {
    const csvRows = YIELD_DATA.map(r => ({
        City: r.city,
        'Gross Yield (%)': r.grossYield,
        'Avg Property Value (XAF)': r.propertyValue,
        'Avg Annual Rent (XAF)': r.annualRent,
    }));

    return (
        <AuthenticatedLayout>
            <div className="p-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-primary-900 dark:text-white mb-2 flex items-center">
                            <Percent className="w-8 h-8 mr-3 text-accent-gold" />
                            Basic Rental Yield
                        </h1>
                        <p className="text-primary-600 dark:text-primary-300">City average rental yield calculations</p>
                    </div>
                    <ExportBar
                        csvRows={csvRows}
                        csvFilename={`StratAxis_Rental_Yield_${new Date().toISOString().slice(0, 10)}`}
                        pdfTitle="StratAxis – Basic Rental Yield Report"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {YIELD_DATA.map(row => (
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
                                    type="Rental Yield"
                                    currentPrice={0}
                                    change={`${row.grossYield}%`}
                                />
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-primary-500 dark:text-primary-400">Average Gross Yield</p>
                                    <p className="text-4xl font-bold text-semantic-success">{row.grossYield}%</p>
                                </div>
                                <div className="pt-3 border-t border-primary-100 dark:border-primary-700">
                                    <p className="text-xs text-primary-500 dark:text-primary-400 mb-2">Calculation Basis</p>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-primary-600 dark:text-primary-300">Avg. Property Value:</span>
                                            <span className="font-semibold text-primary-900 dark:text-white">{(row.propertyValue / 1e6).toFixed(1)}M FCFA</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-primary-600 dark:text-primary-300">Avg. Annual Rent:</span>
                                            <span className="font-semibold text-primary-900 dark:text-white">{(row.annualRent / 1e6).toFixed(2)}M FCFA</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800 mb-6">
                    <div className="flex items-start">
                        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">How Basic Yield is Calculated</h3>
                            <p className="text-sm text-blue-700 dark:text-blue-200">
                                Basic Rental Yield = (Annual Rental Income / Property Value) × 100
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-300 mt-2">
                                Note: This is a gross yield calculation and does not account for expenses, taxes, or vacancy rates.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-primary-50 dark:bg-primary-800 p-6 rounded-xl border border-primary-200 dark:border-primary-700">
                    <h3 className="font-semibold text-primary-900 dark:text-white mb-2">Unlock Advanced Yield Analysis</h3>
                    <p className="text-sm text-primary-600 dark:text-primary-300">
                        Upgrade to Premium to access net yield calculations, neighborhood-specific yields,
                        property type comparisons, and ROI projections with our advanced scenario modeling tools.
                    </p>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default BasicRentalYield;
