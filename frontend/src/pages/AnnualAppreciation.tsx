import React, { useState } from 'react';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import { TrendingUp, MapPin } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import ExportBar from '../components/common/ExportBar';
import { LAND_TYPES, CITIES, LAND_TYPE_COLORS, City } from '../data/marketData';
import { useMetrics } from '../contexts/MetricsContext';

const clsx = (...c: (string | boolean | undefined)[]) => c.filter(Boolean).join(' ');

const AnnualAppreciation: React.FC = () => {
    const [selectedCity, setSelectedCity] = useState<City>('Douala');
    const { landPrices } = useMetrics();

    const cityData = landPrices.filter(r => r.city === selectedCity);

    const csvRows = cityData.map(r => ({
        City: r.city,
        'Land Type': r.landType,
        'Annual Appreciation (%)': r.yoyChange,
        '5-Year Average (%)': r.appreciation5yr,
    }));

    const chartData = cityData.map(r => ({
        type: r.landType,
        yoy: r.yoyChange,
        fiveYr: r.appreciation5yr,
        fill: LAND_TYPE_COLORS[r.landType],
    }));

    // City-weighted average
    const cityAvg = cityData.length > 0
        ? (cityData.reduce((s, r) => s + r.yoyChange, 0) / cityData.length).toFixed(1)
        : '0.0';

    return (
        <AuthenticatedLayout>
            <div className="p-8 max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-primary-900 dark:text-white flex items-center mb-1">
                            <TrendingUp className="w-7 h-7 mr-3 text-accent-gold" />
                            Annual Appreciation
                        </h1>
                        <p className="text-sm text-primary-500">Year-over-year appreciation rates by land classification.</p>
                    </div>
                    <ExportBar csvRows={csvRows} csvFilename="StratAxis_Annual_Appreciation" pdfTitle="StratAxis – Annual Appreciation Report" />
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
                <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm">
                    <p className="text-xs text-primary-400 uppercase tracking-wider font-bold">City Average Annual Appreciation</p>
                    <p className="text-5xl font-bold text-emerald-500">+{cityAvg}%</p>
                    <p className="text-xs text-primary-400 mt-1">{selectedCity} — all land types combined</p>
                </div>

                {/* Chart: YoY vs 5yr Avg */}
                <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm">
                    <h3 className="font-bold text-primary-900 dark:text-white mb-4">Appreciation by Land Type — {selectedCity}</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={chartData} barGap={4}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                            <XAxis dataKey="type" tick={{ fontSize: 12 }} />
                            <YAxis unit="%" tick={{ fontSize: 12 }} domain={[0, 25]} />
                            <Tooltip formatter={(v: number) => `${v}%`} />
                            <Bar dataKey="yoy" name="Current YoY" radius={[4, 4, 0, 0]} barSize={28}>
                                {chartData.map((entry, i) => (
                                    <Cell key={i} fill={entry.fill} />
                                ))}
                            </Bar>
                            <Bar dataKey="fiveYr" name="5-Year Average" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={28} />
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-6 mt-3 text-xs">
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-primary-400" /> 5-Year Average</span>
                        {LAND_TYPES.map(lt => (
                            <span key={lt} className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded" style={{ backgroundColor: LAND_TYPE_COLORS[lt] }} /> {lt} (YoY)
                            </span>
                        ))}
                    </div>
                </div>

                {/* Detail Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {cityData.map(row => (
                        <div key={row.landType}
                            className="bg-white dark:bg-primary-900 p-5 rounded-xl border-l-4 shadow-sm"
                            style={{ borderLeftColor: LAND_TYPE_COLORS[row.landType] }}>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: LAND_TYPE_COLORS[row.landType] + '20', color: LAND_TYPE_COLORS[row.landType] }}>
                                {row.landType}
                            </span>
                            <div className="flex items-end gap-4 mt-3">
                                <div>
                                    <p className="text-xs text-primary-400">Current YoY</p>
                                    <p className="text-3xl font-bold text-emerald-500">+{row.yoyChange}%</p>
                                </div>
                                <div>
                                    <p className="text-xs text-primary-400">5-Yr Avg</p>
                                    <p className="text-lg font-semibold text-primary-600 dark:text-primary-300">+{row.appreciation5yr}%</p>
                                </div>
                            </div>
                            <p className="text-xs text-primary-500 mt-3 leading-relaxed">
                                {row.landType === 'Suburban'
                                    ? 'Highest growth — infrastructure expansion is repricing suburban corridors fastest.'
                                    : row.landType === 'Urban'
                                        ? 'Steady premium appreciation. Limited supply drives consistent value increases.'
                                        : 'Slower but stable growth. Best for long-horizon land banking strategies.'
                                }
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default AnnualAppreciation;
