import React, { useState } from 'react';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import { Percent, MapPin, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import ExportBar from '../components/common/ExportBar';
import { CITIES, PROPERTY_TYPE_COLORS, fmt, City } from '../data/marketData';
import { useMetrics } from '../contexts/MetricsContext';

const clsx = (...c: (string | boolean | undefined)[]) => c.filter(Boolean).join(' ');

const BasicRentalYield: React.FC = () => {
    const [selectedCity, setSelectedCity] = useState<City>('Douala');
    const { rentByType } = useMetrics();

    const cityData = rentByType.filter(r => r.city === selectedCity);

    const csvRows = cityData.map(r => ({
        City: r.city,
        'Property Type': r.propertyType,
        'Gross Yield (%)': r.grossYield,
        'Avg Monthly Rent (XAF)': r.avgMonthlyRent,
        'Avg Property Value (XAF)': r.avgPropertyValue,
    }));

    const chartData = cityData.map(r => ({
        type: r.propertyType,
        yield: r.grossYield,
        fill: PROPERTY_TYPE_COLORS[r.propertyType],
    }));

    // City aggregate
    const cityAvgYield = cityData.length > 0
        ? (cityData.reduce((s, r) => s + r.grossYield, 0) / cityData.length).toFixed(1)
        : '0.0';

    return (
        <AuthenticatedLayout>
            <div className="p-8 max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-primary-900 dark:text-white flex items-center mb-1">
                            <Percent className="w-7 h-7 mr-3 text-accent-gold" />
                            Basic Rental Yield
                        </h1>
                        <p className="text-sm text-primary-500">Gross rental yields segmented by property type.</p>
                    </div>
                    <ExportBar csvRows={csvRows} csvFilename="StratAxis_Rental_Yield" pdfTitle="StratAxis – Basic Rental Yield Report" />
                </div>

                {/* City Toggle */}
                <div className="flex gap-2">
                    {CITIES.map(c => (
                        <button key={c} onClick={() => setSelectedCity(c)}
                            className={clsx(
                                "px-4 py-1.5 rounded-lg text-sm font-semibold border transition-all",
                                selectedCity === c
                                    ? "bg-accent-gold/10 text-accent-gold border-accent-gold/30"
                                    : "bg-white dark:bg-primary-900 text-primary-500 border-primary-200 dark:border-primary-800"
                            )}>
                            <MapPin className="w-3 h-3 inline mr-1" />{c}
                        </button>
                    ))}
                </div>

                {/* City Avg Hero */}
                <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm flex items-center gap-6">
                    <div>
                        <p className="text-xs text-primary-400 uppercase tracking-wider font-bold">City Average Gross Yield</p>
                        <p className="text-5xl font-bold text-emerald-500">{cityAvgYield}%</p>
                        <p className="text-xs text-primary-400 mt-1">{selectedCity} — across all property types</p>
                    </div>
                </div>

                {/* Yield Chart */}
                <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm">
                    <h3 className="font-bold text-primary-900 dark:text-white mb-4">Gross Yield by Property Type — {selectedCity}</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                            <XAxis dataKey="type" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" height={60} />
                            <YAxis unit="%" tick={{ fontSize: 12 }} domain={[0, 12]} />
                            <Tooltip formatter={(v: number) => `${v}%`} />
                            <Bar dataKey="yield" radius={[4, 4, 0, 0]} barSize={36}>
                                {chartData.map((entry, i) => (
                                    <Cell key={i} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Detail Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cityData.map(row => (
                        <div key={row.propertyType}
                            className="bg-white dark:bg-primary-900 p-5 rounded-xl border-l-4 shadow-sm"
                            style={{ borderLeftColor: PROPERTY_TYPE_COLORS[row.propertyType] }}>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                                    style={{ backgroundColor: PROPERTY_TYPE_COLORS[row.propertyType] + '20', color: PROPERTY_TYPE_COLORS[row.propertyType] }}>
                                    {row.propertyType}
                                </span>
                                <span className="text-xl font-bold text-emerald-500">{row.grossYield}%</span>
                            </div>
                            <div className="space-y-2 mt-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-primary-500">Avg Rent</span>
                                    <span className="font-semibold text-primary-900 dark:text-white">{fmt(row.avgMonthlyRent)} /mo</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-primary-500">Avg Property Value</span>
                                    <span className="font-semibold text-primary-900 dark:text-white">{(row.avgPropertyValue / 1e6).toFixed(1)}M XAF</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-primary-500">Annual Rent</span>
                                    <span className="font-semibold text-primary-900 dark:text-white">{fmt(row.avgMonthlyRent * 12)} XAF</span>
                                </div>
                            </div>
                            <p className="text-[10px] text-primary-400 mt-3 text-right">{row.sampleSize} listings</p>
                        </div>
                    ))}
                </div>

                {/* Formula */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-1">How Yield is Calculated</h3>
                            <p className="text-sm text-blue-700 dark:text-blue-200">
                                Gross Yield = (Monthly Rent × 12 ÷ Property Value) × 100. This is a pre-expense metric.
                                Use the <strong>Yield Estimator</strong> for net yield with operating costs, vacancy, and financing.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default BasicRentalYield;
