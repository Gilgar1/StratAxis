import React, { useState } from 'react';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import { BarChart3, MapPin, ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ExportBar from '../components/common/ExportBar';
import { LAND_PRICES, LAND_TYPES, CITIES, LAND_TYPE_COLORS, fmt, LandType, City } from '../data/marketData';

const clsx = (...c: (string | boolean | undefined)[]) => c.filter(Boolean).join(' ');

const AveragePropertyPrice: React.FC = () => {
    const [selectedCity, setSelectedCity] = useState<City | 'All'>('All');
    const [selectedLandType, setSelectedLandType] = useState<LandType | 'All'>('All');

    const filtered = LAND_PRICES.filter(r =>
        (selectedCity === 'All' || r.city === selectedCity) &&
        (selectedLandType === 'All' || r.landType === selectedLandType)
    );

    const csvRows = filtered.map(r => ({
        City: r.city,
        'Land Type': r.landType,
        'Avg Price/m² (XAF)': r.avgPricePerSqm,
        'YoY Change (%)': r.yoyChange,
        'Sample Size': r.sampleSize,
    }));

    // Chart data: group by land type per city
    const chartData = LAND_TYPES.map(lt => {
        const d: Record<string, string | number> = { landType: lt };
        CITIES.forEach(c => {
            const row = LAND_PRICES.find(r => r.city === c && r.landType === lt);
            d[c] = row ? row.avgPricePerSqm : 0;
        });
        return d;
    });

    return (
        <AuthenticatedLayout>
            <div className="p-8 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-primary-900 dark:text-white flex items-center mb-1">
                            <BarChart3 className="w-7 h-7 mr-3 text-accent-gold" />
                            Average Property Price
                        </h1>
                        <p className="text-sm text-primary-500">Segmented by land classification: Urban, Suburban, and Rural.</p>
                    </div>
                    <ExportBar csvRows={csvRows} csvFilename="StratAxis_Avg_Property_Price" pdfTitle="StratAxis – Average Property Price Report" />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                    <div className="relative">
                        <select value={selectedCity} onChange={e => setSelectedCity(e.target.value as any)}
                            className="input pr-8 text-sm appearance-none cursor-pointer">
                            <option value="All">All Cities</option>
                            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400 pointer-events-none" />
                    </div>
                    <div className="flex gap-1.5">
                        {(['All', ...LAND_TYPES] as const).map(lt => (
                            <button key={lt} onClick={() => setSelectedLandType(lt as any)}
                                className={clsx(
                                    "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                                    selectedLandType === lt
                                        ? "bg-accent-gold/10 text-accent-gold border-accent-gold/30"
                                        : "bg-white dark:bg-primary-900 text-primary-500 border-primary-200 dark:border-primary-800 hover:border-accent-gold/50"
                                )}>
                                {lt}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chart */}
                <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm">
                    <h3 className="font-bold text-primary-900 dark:text-white mb-4">Average Land Price by Classification (XAF/m²)</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={chartData} barGap={8}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                            <XAxis dataKey="landType" tick={{ fontSize: 12 }} />
                            <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 12 }} />
                            <Tooltip formatter={(v: number) => `${fmt(v)} XAF/m²`} />
                            <Bar dataKey="Douala" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Yaoundé" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-6 mt-3 text-xs">
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-accent-gold" /> Douala</span>
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-500" /> Yaoundé</span>
                    </div>
                </div>

                {/* Data Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map(row => (
                        <div key={`${row.city}-${row.landType}`}
                            className="bg-white dark:bg-primary-900 p-5 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm hover:border-accent-gold/40 transition-colors">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-accent-gold" />
                                    <span className="font-bold text-primary-900 dark:text-white text-sm">{row.city}</span>
                                </div>
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                                    style={{ backgroundColor: LAND_TYPE_COLORS[row.landType] + '20', color: LAND_TYPE_COLORS[row.landType] }}>
                                    {row.landType}
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-primary-900 dark:text-white mb-1">{fmt(row.avgPricePerSqm)} <span className="text-sm font-normal text-primary-400">XAF/m²</span></p>
                            <div className="grid grid-cols-3 gap-2 mt-3">
                                <div className="bg-primary-50 dark:bg-primary-800 p-2 rounded text-center">
                                    <p className="text-[10px] text-primary-400 uppercase">YoY</p>
                                    <p className="text-sm font-bold text-emerald-500">+{row.yoyChange}%</p>
                                </div>
                                <div className="bg-primary-50 dark:bg-primary-800 p-2 rounded text-center">
                                    <p className="text-[10px] text-primary-400 uppercase">Low</p>
                                    <p className="text-sm font-bold text-primary-700 dark:text-primary-200">{fmt(row.lowRange)}</p>
                                </div>
                                <div className="bg-primary-50 dark:bg-primary-800 p-2 rounded text-center">
                                    <p className="text-[10px] text-primary-400 uppercase">High</p>
                                    <p className="text-sm font-bold text-primary-700 dark:text-primary-200">{fmt(row.highRange)}</p>
                                </div>
                            </div>
                            <p className="text-[10px] text-primary-400 mt-2 text-right">{row.sampleSize} listings sampled</p>
                        </div>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default AveragePropertyPrice;
