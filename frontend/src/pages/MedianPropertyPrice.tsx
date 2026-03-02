import React, { useState } from 'react';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import { TrendingUp, MapPin } from 'lucide-react';
import ExportBar from '../components/common/ExportBar';
import { LAND_TYPES, CITIES, LAND_TYPE_COLORS, fmt, City } from '../data/marketData';
import { useMetrics } from '../contexts/MetricsContext';

const clsx = (...c: (string | boolean | undefined)[]) => c.filter(Boolean).join(' ');

const MedianPropertyPrice: React.FC = () => {
    const [selectedCity, setSelectedCity] = useState<City | 'All'>('All');
    const { landPrices } = useMetrics();

    const filtered = landPrices.filter(r => selectedCity === 'All' || r.city === selectedCity);

    const csvRows = filtered.map(r => ({
        City: r.city,
        'Land Type': r.landType,
        'Median Price/m² (XAF)': r.medianPricePerSqm,
        'YoY Change (%)': r.yoyChange,
        'Sample Size': r.sampleSize,
    }));

    return (
        <AuthenticatedLayout>
            <div className="p-8 max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-primary-900 dark:text-white flex items-center mb-1">
                            <TrendingUp className="w-7 h-7 mr-3 text-accent-gold" />
                            Median Property Price
                        </h1>
                        <p className="text-sm text-primary-500">Median land prices by Urban, Suburban, and Rural zones.</p>
                    </div>
                    <ExportBar csvRows={csvRows} csvFilename="StratAxis_Median_Property_Price" pdfTitle="StratAxis – Median Property Price Report" />
                </div>

                {/* City Filter */}
                <div className="flex gap-2">
                    {(['All', ...CITIES] as const).map(c => (
                        <button key={c} onClick={() => setSelectedCity(c as any)}
                            className={clsx(
                                "px-4 py-1.5 rounded-lg text-sm font-semibold border transition-all",
                                selectedCity === c
                                    ? "bg-accent-gold/10 text-accent-gold border-accent-gold/30"
                                    : "bg-white dark:bg-primary-900 text-primary-500 border-primary-200 dark:border-primary-800 hover:border-accent-gold/50"
                            )}>
                            {c}
                        </button>
                    ))}
                </div>

                {/* Cards grouped by city */}
                {(selectedCity === 'All' ? CITIES : [selectedCity]).map(city => (
                    <div key={city}>
                        <h2 className="flex items-center gap-2 text-lg font-bold text-primary-900 dark:text-white mb-3 mt-4">
                            <MapPin className="w-5 h-5 text-accent-gold" /> {city}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {LAND_TYPES.map(lt => {
                                const row = landPrices.find(r => r.city === city && r.landType === lt);
                                if (!row) return null;
                                return (
                                    <div key={lt} className="bg-white dark:bg-primary-900 p-5 rounded-xl border-l-4 shadow-sm"
                                        style={{ borderLeftColor: LAND_TYPE_COLORS[lt] }}>
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                                                style={{ backgroundColor: LAND_TYPE_COLORS[lt] + '20', color: LAND_TYPE_COLORS[lt] }}>
                                                {lt}
                                            </span>
                                            <span className="text-xs text-emerald-500 font-bold">+{row.yoyChange}% YoY</span>
                                        </div>
                                        <p className="text-3xl font-bold text-primary-900 dark:text-white">{fmt(row.medianPricePerSqm)}</p>
                                        <p className="text-xs text-primary-400 mb-3">XAF / m²</p>
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
                                );
                            })}
                        </div>
                    </div>
                ))}

                <div className="bg-primary-50 dark:bg-primary-800 p-5 rounded-xl border border-primary-200 dark:border-primary-700">
                    <h3 className="font-semibold text-primary-900 dark:text-white mb-1">About Median Prices</h3>
                    <p className="text-sm text-primary-600 dark:text-primary-300">
                        Median prices represent the middle value in our dataset, reducing the impact of outliers.
                        Prices vary significantly between Urban core zones, Suburban growth corridors, and Rural agricultural land.
                    </p>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default MedianPropertyPrice;
