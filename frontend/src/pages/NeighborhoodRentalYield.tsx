import React, { useState } from 'react';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import { Percent, MapPin, TrendingUp, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useMetrics } from '../contexts/MetricsContext';

const CITY_COLORS = ['#D4AF37', '#3b82f6', '#10b981', '#a855f7', '#ef4444', '#f97316'];

const NeighborhoodRentalYield: React.FC = () => {
    const { neighborhoods } = useMetrics();
    const [selectedCity, setSelectedCity] = useState<'douala' | 'yaounde'>('douala');

    const data = selectedCity === 'douala' ? neighborhoods.douala : neighborhoods.yaounde;
    const cityLabel = selectedCity === 'douala' ? 'Douala' : 'Yaoundé';

    const cityAvgGross = data.length > 0 ? (data.reduce((s, n) => s + n.grossYield, 0) / data.length).toFixed(1) : '0.0';
    const cityAvgNet = data.length > 0 ? (data.reduce((s, n) => s + n.netYield, 0) / data.length).toFixed(1) : '0.0';

    const chartData = data.map((n, i) => ({
        name: n.name,
        gross: n.grossYield,
        net: n.netYield,
        fill: CITY_COLORS[i % CITY_COLORS.length],
    }));

    return (
        <AuthenticatedLayout>
            <div className="p-8 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-primary-900 dark:text-white mb-1 flex items-center">
                        <Percent className="w-8 h-8 mr-3 text-accent-gold" />
                        Neighborhood Rental Yield
                    </h1>
                    <p className="text-primary-600 dark:text-primary-300 text-sm">Detailed gross &amp; net yield analysis by neighborhood.</p>
                </div>

                {/* City toggle */}
                <div className="flex gap-3">
                    {(['douala', 'yaounde'] as const).map(c => (
                        <button key={c} onClick={() => setSelectedCity(c)}
                            className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${selectedCity === c
                                    ? 'bg-accent-gold text-white shadow-lg'
                                    : 'bg-white dark:bg-primary-900 border border-primary-200 dark:border-primary-700 text-primary-700 dark:text-primary-300 hover:border-accent-gold/50'
                                }`}>
                            {c === 'douala' ? 'Douala' : 'Yaoundé'}
                        </button>
                    ))}
                </div>

                {/* City summary */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-primary-900 p-5 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm">
                        <p className="text-xs font-bold text-primary-400 uppercase tracking-wider mb-1">{cityLabel} Avg Gross Yield</p>
                        <p className="text-4xl font-bold text-emerald-500">{cityAvgGross}%</p>
                    </div>
                    <div className="bg-white dark:bg-primary-900 p-5 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm">
                        <p className="text-xs font-bold text-primary-400 uppercase tracking-wider mb-1">{cityLabel} Avg Net Yield</p>
                        <p className="text-4xl font-bold text-blue-500">{cityAvgNet}%</p>
                    </div>
                </div>

                {/* Bar Chart */}
                <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm">
                    <h3 className="font-bold text-primary-900 dark:text-white mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-accent-gold" /> Gross vs Net Yield by Neighborhood — {cityLabel}
                    </h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={chartData} barGap={4}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                            <YAxis unit="%" tick={{ fontSize: 12 }} domain={[0, 12]} />
                            <Tooltip formatter={(v: number) => `${v}%`} />
                            <Bar dataKey="gross" name="Gross Yield" radius={[4, 4, 0, 0]} barSize={22}>
                                {chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                            </Bar>
                            <Bar dataKey="net" name="Net Yield" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={22} />
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="flex items-center gap-6 mt-3 text-xs justify-center">
                        {data.map((n, i) => (
                            <span key={n.name} className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded" style={{ backgroundColor: CITY_COLORS[i % CITY_COLORS.length] }} /> {n.name}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Neighborhood Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {data.map((neighborhood, i) => (
                        <div key={neighborhood.name}
                            className="bg-white dark:bg-primary-900 p-6 rounded-xl border-l-4 border-primary-200 dark:border-primary-800 shadow-sm hover:shadow-lg transition-shadow"
                            style={{ borderLeftColor: CITY_COLORS[i % CITY_COLORS.length] }}>
                            <div className="flex items-center mb-4">
                                <MapPin className="w-5 h-5 text-accent-gold mr-2" />
                                <h3 className="text-lg font-bold text-primary-900 dark:text-white">{neighborhood.name}</h3>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-primary-500">Gross Yield</p>
                                    <p className="text-3xl font-bold text-emerald-500">{neighborhood.grossYield}%</p>
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-primary-100 dark:border-primary-700">
                                    <div>
                                        <p className="text-xs text-primary-500">Net Yield</p>
                                        <p className="text-lg font-semibold text-blue-500">{neighborhood.netYield}%</p>
                                    </div>
                                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                                </div>
                                <div className="pt-3 border-t border-primary-100 dark:border-primary-700">
                                    <div className="flex justify-between text-sm mb-1.5">
                                        <span className="text-primary-600 dark:text-primary-400">Avg. Rent / mo</span>
                                        <span className="font-semibold text-primary-900 dark:text-white">{neighborhood.avgRent.toLocaleString()} FCFA</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-primary-600 dark:text-primary-400">Avg. Property</span>
                                        <span className="font-semibold text-primary-900 dark:text-white">{(neighborhood.avgPrice / 1_000_000).toFixed(1)}M FCFA</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Methodology note */}
                <div className="bg-primary-50 dark:bg-primary-800 p-6 rounded-xl border border-primary-200 dark:border-primary-700">
                    <h3 className="font-semibold text-primary-900 dark:text-white mb-2">Understanding Yields</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-primary-600 dark:text-primary-300">
                        <div><strong>Gross Yield:</strong> Annual rental income divided by property purchase price (before expenses)</div>
                        <div><strong>Net Yield:</strong> Gross yield minus operating expenses, taxes, and vacancy allowance</div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default NeighborhoodRentalYield;
