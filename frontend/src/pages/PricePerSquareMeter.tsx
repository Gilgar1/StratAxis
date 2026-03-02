import React, { useState } from 'react';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import { Maximize2, MapPin } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import ExportBar from '../components/common/ExportBar';
import { LAND_TYPES, CITIES, LAND_TYPE_COLORS, YEARS, fmt, City } from '../data/marketData';
import { useMetrics } from '../contexts/MetricsContext';

const clsx = (...c: (string | boolean | undefined)[]) => c.filter(Boolean).join(' ');

const PricePerSquareMeter: React.FC = () => {
    const [selectedCity, setSelectedCity] = useState<City>('Douala');
    const { landPrices } = useMetrics();

    const cityData = landPrices.filter(r => r.city === selectedCity);

    const csvRows = cityData.map(r => ({
        City: r.city,
        'Land Type': r.landType,
        'Avg Price/m² (XAF)': r.avgPricePerSqm,
        'Low Range': r.lowRange,
        'High Range': r.highRange,
        'YoY (%)': r.yoyChange,
    }));

    // 5-year trend line data
    const trendData = YEARS.map((year, i) => {
        const row: Record<string, string | number> = { year };
        LAND_TYPES.forEach(lt => {
            const entry = landPrices.find(r => r.city === selectedCity && r.landType === lt);
            row[lt] = entry ? entry.trend[i] : 0;
        });
        return row;
    });

    return (
        <AuthenticatedLayout>
            <div className="p-8 max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-primary-900 dark:text-white flex items-center mb-1">
                            <Maximize2 className="w-7 h-7 mr-3 text-accent-gold" />
                            Price per Square Meter
                        </h1>
                        <p className="text-sm text-primary-500">Historical price/m² trends by Urban, Suburban, and Rural land.</p>
                    </div>
                    <ExportBar csvRows={csvRows} csvFilename="StratAxis_Price_Per_SQM" pdfTitle="StratAxis – Price per Square Meter" />
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

                {/* Trend Chart */}
                <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm">
                    <h3 className="font-bold text-primary-900 dark:text-white mb-4">5-Year Price/m² Trend — {selectedCity}</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                            <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 12 }} />
                            <Tooltip formatter={(v: number) => `${fmt(v)} XAF/m²`} />
                            <Legend />
                            {LAND_TYPES.map(lt => (
                                <Line key={lt} type="monotone" dataKey={lt} stroke={LAND_TYPE_COLORS[lt]}
                                    strokeWidth={2.5} dot={{ r: 4 }} name={lt} />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {cityData.map(row => (
                        <div key={row.landType}
                            className="bg-white dark:bg-primary-900 p-5 rounded-xl border-l-4 shadow-sm"
                            style={{ borderLeftColor: LAND_TYPE_COLORS[row.landType] }}>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: LAND_TYPE_COLORS[row.landType] + '20', color: LAND_TYPE_COLORS[row.landType] }}>
                                {row.landType}
                            </span>
                            <p className="text-3xl font-bold text-primary-900 dark:text-white mt-3">{fmt(row.avgPricePerSqm)}</p>
                            <p className="text-xs text-primary-400">XAF / m²</p>
                            <div className="grid grid-cols-3 gap-2 mt-3">
                                <div className="bg-primary-50 dark:bg-primary-800 p-2 rounded text-center">
                                    <p className="text-[10px] text-primary-400 uppercase">Low</p>
                                    <p className="text-xs font-bold text-primary-700 dark:text-primary-200">{fmt(row.lowRange)}</p>
                                </div>
                                <div className="bg-primary-50 dark:bg-primary-800 p-2 rounded text-center">
                                    <p className="text-[10px] text-primary-400 uppercase">High</p>
                                    <p className="text-xs font-bold text-primary-700 dark:text-primary-200">{fmt(row.highRange)}</p>
                                </div>
                                <div className="bg-primary-50 dark:bg-primary-800 p-2 rounded text-center">
                                    <p className="text-[10px] text-primary-400 uppercase">5yr Avg</p>
                                    <p className="text-xs font-bold text-emerald-500">+{row.appreciation5yr}%</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default PricePerSquareMeter;
