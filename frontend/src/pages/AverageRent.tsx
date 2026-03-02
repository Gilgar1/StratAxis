import React, { useState } from 'react';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import { Home, ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import ExportBar from '../components/common/ExportBar';
import { PROPERTY_TYPES, CITIES, PROPERTY_TYPE_COLORS, fmt, PropertyType, City } from '../data/marketData';
import { useMetrics } from '../contexts/MetricsContext';

const clsx = (...c: (string | boolean | undefined)[]) => c.filter(Boolean).join(' ');

const AverageRent: React.FC = () => {
    const [selectedCity, setSelectedCity] = useState<City>('Douala');
    const [selectedType, setSelectedType] = useState<PropertyType | 'All'>('All');
    const { rentByType } = useMetrics();

    const filtered = rentByType.filter(r =>
        r.city === selectedCity &&
        (selectedType === 'All' || r.propertyType === selectedType)
    );

    const csvRows = filtered.map(r => ({
        City: r.city,
        'Property Type': r.propertyType,
        'Avg Monthly Rent (XAF)': r.avgMonthlyRent,
        'YoY Change (%)': r.yoyChange,
        'Sample Size': r.sampleSize,
    }));

    const chartData = rentByType.filter(r => r.city === selectedCity).map(r => ({
        type: r.propertyType,
        rent: r.avgMonthlyRent,
        fill: PROPERTY_TYPE_COLORS[r.propertyType],
    }));

    return (
        <AuthenticatedLayout>
            <div className="p-8 max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-primary-900 dark:text-white flex items-center mb-1">
                            <Home className="w-7 h-7 mr-3 text-accent-gold" />
                            Average Rent
                        </h1>
                        <p className="text-sm text-primary-500">Monthly rental rates segmented by property type.</p>
                    </div>
                    <ExportBar csvRows={csvRows} csvFilename="StratAxis_Average_Rent" pdfTitle="StratAxis – Average Rent Report" />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                    <div className="flex gap-1.5">
                        {CITIES.map(c => (
                            <button key={c} onClick={() => setSelectedCity(c)}
                                className={clsx(
                                    "px-4 py-1.5 rounded-lg text-sm font-semibold border transition-all",
                                    selectedCity === c
                                        ? "bg-accent-gold/10 text-accent-gold border-accent-gold/30"
                                        : "bg-white dark:bg-primary-900 text-primary-500 border-primary-200 dark:border-primary-800"
                                )}>
                                {c}
                            </button>
                        ))}
                    </div>
                    <div className="relative">
                        <select value={selectedType} onChange={e => setSelectedType(e.target.value as any)}
                            className="input pr-8 text-sm appearance-none cursor-pointer">
                            <option value="All">All Property Types</option>
                            {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400 pointer-events-none" />
                    </div>
                </div>

                {/* Chart */}
                <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm">
                    <h3 className="font-bold text-primary-900 dark:text-white mb-4">
                        {selectedCity} — Monthly Rent by Property Type (XAF)
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                            <XAxis type="number" tickFormatter={v => `${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11 }} />
                            <YAxis type="category" dataKey="type" tick={{ fontSize: 11 }} width={110} />
                            <Tooltip formatter={(v: number) => `${fmt(v)} XAF/mo`} />
                            <Bar dataKey="rent" radius={[0, 4, 4, 0]} barSize={24}>
                                {chartData.map((entry, i) => (
                                    <Cell key={i} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Property Type Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map(row => (
                        <div key={`${row.city}-${row.propertyType}`}
                            className="bg-white dark:bg-primary-900 p-5 rounded-xl border-l-4 shadow-sm"
                            style={{ borderLeftColor: PROPERTY_TYPE_COLORS[row.propertyType] }}>
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                                    style={{ backgroundColor: PROPERTY_TYPE_COLORS[row.propertyType] + '20', color: PROPERTY_TYPE_COLORS[row.propertyType] }}>
                                    {row.propertyType}
                                </span>
                                <span className="text-xs text-emerald-500 font-bold">+{row.yoyChange}% YoY</span>
                            </div>
                            <p className="text-2xl font-bold text-primary-900 dark:text-white">{fmt(row.avgMonthlyRent)}</p>
                            <p className="text-xs text-primary-400 mb-3">XAF / month</p>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-primary-50 dark:bg-primary-800 p-2 rounded">
                                    <p className="text-[10px] text-primary-400 uppercase">Low</p>
                                    <p className="text-sm font-bold text-primary-700 dark:text-primary-200">{fmt(row.lowRange)}</p>
                                </div>
                                <div className="bg-primary-50 dark:bg-primary-800 p-2 rounded">
                                    <p className="text-[10px] text-primary-400 uppercase">High</p>
                                    <p className="text-sm font-bold text-primary-700 dark:text-primary-200">{fmt(row.highRange)}</p>
                                </div>
                            </div>
                            <p className="text-[10px] text-primary-400 mt-2 text-right">{row.sampleSize} listings</p>
                        </div>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default AverageRent;
