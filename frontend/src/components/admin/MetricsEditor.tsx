import React, { useState, useRef, useEffect } from 'react';
import {
    Edit2, Check, X, RotateCcw, AlertTriangle,
    TrendingUp, Home, BarChart3, Activity, Users, Settings,
    Landmark, MapPin, Lightbulb
} from 'lucide-react';
import {
    useMetrics, DashboardStats, DashboardStat,
    EconomicsCurrent, InterestRatePoint, InflationPoint,
    NeighborhoodEntry, SmartInsight, InsightType
} from '../../contexts/MetricsContext';
import { CITIES, LAND_TYPE_COLORS, PROPERTY_TYPE_COLORS } from '../../data/marketData';
import type { LandPriceByType, RentByPropertyType } from '../../data/marketData';

// ─── Shared inline-edit cell ──────────────────────────────────────────────────

interface EditableCellProps {
    value: string | number;
    onSave: (val: string) => void;
    suffix?: string;
    isNumeric?: boolean;
    wide?: boolean;
}

const EditableCell: React.FC<EditableCellProps> = ({ value, onSave, suffix = '', isNumeric = true, wide = false }) => {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(String(value));
    const [hovered, setHovered] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { setDraft(String(value)); }, [value]);
    useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

    const commit = () => { onSave(draft); setEditing(false); };
    const cancel = () => { setDraft(String(value)); setEditing(false); };
    const handleKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') cancel(); };

    if (editing) {
        return (
            <span className="inline-flex items-center gap-1">
                <input ref={inputRef} type={isNumeric ? 'number' : 'text'} value={draft}
                    onChange={e => setDraft(e.target.value)} onKeyDown={handleKey}
                    className={`${wide ? 'w-52' : 'w-24'} px-2 py-0.5 text-sm font-semibold border-2 border-accent-gold rounded bg-white dark:bg-primary-800 text-primary-900 dark:text-white outline-none`} />
                {suffix && <span className="text-xs text-primary-400">{suffix}</span>}
                <button onClick={commit} className="text-emerald-500 hover:text-emerald-400 ml-1"><Check className="w-3.5 h-3.5" /></button>
                <button onClick={cancel} className="text-red-500 hover:text-red-400"><X className="w-3.5 h-3.5" /></button>
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1.5 cursor-pointer"
            onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={() => setEditing(true)}>
            <span className="font-semibold text-primary-900 dark:text-white">
                {typeof value === 'number' ? value.toLocaleString() : value}{suffix}
            </span>
            <Edit2 className={`w-3.5 h-3.5 text-accent-gold transition-all duration-150 ${hovered ? 'opacity-100 scale-110' : 'opacity-0'}`} />
        </span>
    );
};

// ─── Dashboard stat cell ──────────────────────────────────────────────────────

const StatCell: React.FC<{ statId: keyof DashboardStats; field: keyof DashboardStat; label: string }> = ({ statId, field, label }) => {
    const { dashboardStats, updateDashboardStat } = useMetrics();
    const value = dashboardStats[statId][field] as string;
    return (
        <div className="flex items-center justify-between py-1.5 border-b border-primary-100 dark:border-primary-800 last:border-0">
            <span className="text-xs text-primary-500 w-16 shrink-0">{label}</span>
            <EditableCell value={value} isNumeric={false} onSave={v => updateDashboardStat(statId, field, v)} />
        </div>
    );
};

// ─── Land row ─────────────────────────────────────────────────────────────────

const LandRow: React.FC<{ row: LandPriceByType }> = ({ row }) => {
    const { updateLandPrice } = useMetrics();
    const save = (f: keyof LandPriceByType) => (v: string) => updateLandPrice(row.city, row.landType, f, parseFloat(v) || 0);
    return (
        <tr className="hover:bg-accent-gold/5 transition-colors border-b border-primary-100 dark:border-primary-800">
            <td className="p-3"><span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: LAND_TYPE_COLORS[row.landType] + '20', color: LAND_TYPE_COLORS[row.landType] }}>{row.landType}</span></td>
            <td className="p-3"><EditableCell value={row.avgPricePerSqm} onSave={save('avgPricePerSqm')} suffix=" XAF/m²" /></td>
            <td className="p-3"><EditableCell value={row.medianPricePerSqm} onSave={save('medianPricePerSqm')} suffix=" XAF/m²" /></td>
            <td className="p-3"><EditableCell value={row.lowRange} onSave={save('lowRange')} suffix=" XAF" /></td>
            <td className="p-3"><EditableCell value={row.highRange} onSave={save('highRange')} suffix=" XAF" /></td>
            <td className="p-3"><EditableCell value={row.yoyChange} onSave={save('yoyChange')} suffix="%" /></td>
            <td className="p-3"><EditableCell value={row.appreciation5yr} onSave={save('appreciation5yr')} suffix="%" /></td>
            <td className="p-3"><EditableCell value={row.sampleSize} onSave={save('sampleSize')} /></td>
        </tr>
    );
};

// ─── Rent row ─────────────────────────────────────────────────────────────────

const RentRow: React.FC<{ row: RentByPropertyType }> = ({ row }) => {
    const { updateRentByType } = useMetrics();
    const save = (f: keyof RentByPropertyType) => (v: string) => updateRentByType(row.city, row.propertyType, f, parseFloat(v) || 0);
    return (
        <tr className="hover:bg-accent-gold/5 transition-colors border-b border-primary-100 dark:border-primary-800">
            <td className="p-3"><span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: PROPERTY_TYPE_COLORS[row.propertyType] + '20', color: PROPERTY_TYPE_COLORS[row.propertyType] }}>{row.propertyType}</span></td>
            <td className="p-3"><EditableCell value={row.avgMonthlyRent} onSave={save('avgMonthlyRent')} suffix=" XAF/mo" /></td>
            <td className="p-3"><EditableCell value={row.medianMonthlyRent} onSave={save('medianMonthlyRent')} suffix=" XAF/mo" /></td>
            <td className="p-3"><EditableCell value={row.lowRange} onSave={save('lowRange')} suffix=" XAF" /></td>
            <td className="p-3"><EditableCell value={row.highRange} onSave={save('highRange')} suffix=" XAF" /></td>
            <td className="p-3"><EditableCell value={row.grossYield} onSave={save('grossYield')} suffix="%" /></td>
            <td className="p-3"><EditableCell value={row.yoyChange} onSave={save('yoyChange')} suffix="%" /></td>
            <td className="p-3"><EditableCell value={row.sampleSize} onSave={save('sampleSize')} /></td>
        </tr>
    );
};

// ─── Economics tab ────────────────────────────────────────────────────────────

const EconomicsTab: React.FC = () => {
    const { economics, updateEconomicsCurrent, updateInterestHistory, updateInflationHistory } = useMetrics();
    const { current, interestHistory, inflationHistory } = economics;
    const saveC = (f: keyof EconomicsCurrent) => (v: string) => updateEconomicsCurrent(f, parseFloat(v) || 0);
    const saveI = (year: string, f: keyof InterestRatePoint) => (v: string) => updateInterestHistory(year, f, parseFloat(v) || 0);
    const saveN = (year: string, f: keyof InflationPoint) => (v: string) => updateInflationHistory(year, f, parseFloat(v) || 0);

    const currentFields: { field: keyof EconomicsCurrent; label: string; color: string }[] = [
        { field: 'beacRate', label: 'BEAC Policy Rate (%)', color: 'text-blue-500' },
        { field: 'beacChange', label: 'BEAC Rate Change (%)', color: 'text-primary-500' },
        { field: 'avgMortgageDouala', label: 'Avg Mortgage – Douala (%)', color: 'text-amber-500' },
        { field: 'avgMortgageYaounde', label: 'Avg Mortgage – Yaoundé (%)', color: 'text-purple-500' },
        { field: 'inflationDouala', label: 'Inflation – Douala (%)', color: 'text-red-500' },
        { field: 'inflationYaounde', label: 'Inflation – Yaoundé (%)', color: 'text-purple-500' },
        { field: 'inflationNational', label: 'Inflation – National (%)', color: 'text-indigo-500' },
    ];

    return (
        <div className="space-y-6">
            {/* Current snapshot */}
            <div className="bg-white dark:bg-primary-900 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3.5 bg-primary-50 dark:bg-primary-800 border-b border-primary-200 dark:border-primary-700">
                    <Landmark className="w-5 h-5 text-blue-500" />
                    <h3 className="font-bold text-primary-900 dark:text-white">Current Snapshot</h3>
                    <span className="ml-2 text-xs text-primary-500">— displayed on Economics page hero cards</span>
                </div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {currentFields.map(({ field, label, color }) => (
                        <div key={field} className="bg-primary-50 dark:bg-primary-800 rounded-lg p-4">
                            <p className={`text-xs font-bold uppercase tracking-wide mb-2 ${color}`}>{label}</p>
                            <EditableCell value={current[field]} onSave={saveC(field)} suffix="%" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Interest rate history */}
            <div className="bg-white dark:bg-primary-900 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3.5 bg-primary-50 dark:bg-primary-800 border-b border-primary-200 dark:border-primary-700">
                    <TrendingUp className="w-5 h-5 text-accent-gold" />
                    <h3 className="font-bold text-primary-900 dark:text-white">Interest Rate History (2020–2025)</h3>
                    <span className="ml-2 text-xs text-primary-500">— feeds the line chart on Economics page</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-primary-50/50 dark:bg-primary-800/50">
                                <th className="p-3 font-semibold text-primary-700 dark:text-primary-300">Year</th>
                                <th className="p-3 font-semibold text-primary-700 dark:text-primary-300">BEAC Rate %</th>
                                <th className="p-3 font-semibold text-primary-700 dark:text-primary-300">Avg Mortgage %</th>
                                <th className="p-3 font-semibold text-primary-700 dark:text-primary-300">Douala Avg %</th>
                                <th className="p-3 font-semibold text-primary-700 dark:text-primary-300">Yaoundé Avg %</th>
                            </tr>
                        </thead>
                        <tbody>
                            {interestHistory.map(row => (
                                <tr key={row.year} className="hover:bg-accent-gold/5 transition-colors border-b border-primary-100 dark:border-primary-800">
                                    <td className="p-3 font-bold text-primary-900 dark:text-white">{row.year}</td>
                                    <td className="p-3"><EditableCell value={row.beacRate} onSave={saveI(row.year, 'beacRate')} suffix="%" /></td>
                                    <td className="p-3"><EditableCell value={row.avgMortgage} onSave={saveI(row.year, 'avgMortgage')} suffix="%" /></td>
                                    <td className="p-3"><EditableCell value={row.doualaAvg} onSave={saveI(row.year, 'doualaAvg')} suffix="%" /></td>
                                    <td className="p-3"><EditableCell value={row.yaoundeAvg} onSave={saveI(row.year, 'yaoundeAvg')} suffix="%" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Inflation history */}
            <div className="bg-white dark:bg-primary-900 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3.5 bg-primary-50 dark:bg-primary-800 border-b border-primary-200 dark:border-primary-700">
                    <Activity className="w-5 h-5 text-red-500" />
                    <h3 className="font-bold text-primary-900 dark:text-white">Inflation History (2020–2025)</h3>
                    <span className="ml-2 text-xs text-primary-500">— feeds the area chart on Economics page</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-primary-50/50 dark:bg-primary-800/50">
                                <th className="p-3 font-semibold text-primary-700 dark:text-primary-300">Year</th>
                                <th className="p-3 font-semibold text-primary-700 dark:text-primary-300">National %</th>
                                <th className="p-3 font-semibold text-primary-700 dark:text-primary-300">Douala %</th>
                                <th className="p-3 font-semibold text-primary-700 dark:text-primary-300">Yaoundé %</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inflationHistory.map(row => (
                                <tr key={row.year} className="hover:bg-accent-gold/5 transition-colors border-b border-primary-100 dark:border-primary-800">
                                    <td className="p-3 font-bold text-primary-900 dark:text-white">{row.year}</td>
                                    <td className="p-3"><EditableCell value={row.national} onSave={saveN(row.year, 'national')} suffix="%" /></td>
                                    <td className="p-3"><EditableCell value={row.douala} onSave={saveN(row.year, 'douala')} suffix="%" /></td>
                                    <td className="p-3"><EditableCell value={row.yaounde} onSave={saveN(row.year, 'yaounde')} suffix="%" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// ─── Neighborhoods tab ────────────────────────────────────────────────────────

const NeighborhoodsTab: React.FC = () => {
    const { neighborhoods, updateNeighborhood } = useMetrics();
    const [cityFilter, setCityFilter] = useState<'douala' | 'yaounde'>('douala');
    const data = neighborhoods[cityFilter];
    const save = (name: string, f: keyof NeighborhoodEntry) => (v: string) => updateNeighborhood(cityFilter, name, f, parseFloat(v) || 0);

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                {(['douala', 'yaounde'] as const).map(c => (
                    <button key={c} onClick={() => setCityFilter(c)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-semibold border transition-all ${cityFilter === c ? 'bg-accent-gold/10 text-accent-gold border-accent-gold/30' : 'bg-white dark:bg-primary-900 text-primary-500 border-primary-200 dark:border-primary-800'}`}>
                        <MapPin className="w-3 h-3 inline mr-1" />{c === 'douala' ? 'Douala' : 'Yaoundé'}
                    </button>
                ))}
            </div>

            <div className="bg-white dark:bg-primary-900 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3.5 bg-primary-50 dark:bg-primary-800 border-b border-primary-200 dark:border-primary-700">
                    <MapPin className="w-5 h-5 text-accent-gold" />
                    <h3 className="font-bold text-primary-900 dark:text-white">Neighborhood Analytics — {cityFilter === 'douala' ? 'Douala' : 'Yaoundé'}</h3>
                    <span className="ml-2 text-xs text-primary-500">→ Neighborhood Rental Yield page</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-primary-50/50 dark:bg-primary-800/50">
                                <th className="p-3 font-semibold text-primary-700 dark:text-primary-300">Neighborhood</th>
                                <th className="p-3 font-semibold text-primary-700 dark:text-primary-300">Gross Yield %</th>
                                <th className="p-3 font-semibold text-primary-700 dark:text-primary-300">Net Yield %</th>
                                <th className="p-3 font-semibold text-primary-700 dark:text-primary-300">Avg Rent / mo</th>
                                <th className="p-3 font-semibold text-primary-700 dark:text-primary-300">Avg Property</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(n => (
                                <tr key={n.name} className="hover:bg-accent-gold/5 transition-colors border-b border-primary-100 dark:border-primary-800">
                                    <td className="p-3 font-bold text-primary-900 dark:text-white">{n.name}</td>
                                    <td className="p-3"><EditableCell value={n.grossYield} onSave={save(n.name, 'grossYield')} suffix="%" /></td>
                                    <td className="p-3"><EditableCell value={n.netYield} onSave={save(n.name, 'netYield')} suffix="%" /></td>
                                    <td className="p-3"><EditableCell value={n.avgRent} onSave={save(n.name, 'avgRent')} suffix=" XAF" /></td>
                                    <td className="p-3"><EditableCell value={n.avgPrice} onSave={save(n.name, 'avgPrice')} suffix=" XAF" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="px-5 py-3 bg-primary-50/30 dark:bg-primary-800/30 border-t border-primary-100 dark:border-primary-800">
                    <p className="text-xs text-primary-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        Changes reflect instantly on the Neighborhood Rental Yield page for all users.
                    </p>
                </div>
            </div>
        </div>
    );
};

// ─── Smart Insights tab ───────────────────────────────────────────────────────

const INSIGHT_TYPES: InsightType[] = ['opportunity', 'trend', 'risk'];
const IMPACT_OPTIONS = ['High', 'Medium', 'Low'];

const InsightsTab: React.FC = () => {
    const { smartInsights, updateSmartInsight } = useMetrics();
    const save = (id: number, f: keyof SmartInsight) => (v: string) => updateSmartInsight(id, f, f === 'confidence' ? parseFloat(v) : v);

    const TYPE_COLORS: Record<InsightType, string> = {
        opportunity: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
        trend: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
        risk: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
    };

    return (
        <div className="space-y-5">
            <div className="flex items-start gap-3 bg-accent-gold/10 border border-accent-gold/30 p-3.5 rounded-xl">
                <Lightbulb className="w-5 h-5 text-accent-gold mt-0.5 shrink-0" />
                <p className="text-xs text-primary-600 dark:text-primary-300">
                    Edit insight cards displayed on the <strong>Smart Insights</strong> page. All text fields support the hover→click pencil editing. Confidence must be 0–1 (e.g. 0.85 = 85%).
                </p>
            </div>

            {smartInsights.map(insight => (
                <div key={insight.id} className={`bg-white dark:bg-primary-900 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm overflow-hidden`}>
                    {/* Card header */}
                    <div className="flex items-center gap-3 px-5 py-3.5 bg-primary-50 dark:bg-primary-800 border-b border-primary-200 dark:border-primary-700">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${TYPE_COLORS[insight.type]}`}>{insight.type.toUpperCase()}</span>
                        <span className="font-bold text-sm text-primary-900 dark:text-white truncate">{insight.title}</span>
                    </div>

                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Left: text fields */}
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs font-bold text-primary-400 uppercase mb-1">Title</p>
                                <EditableCell value={insight.title} isNumeric={false} wide onSave={save(insight.id, 'title')} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-primary-400 uppercase mb-1">Description</p>
                                <EditableCell value={insight.description} isNumeric={false} wide onSave={save(insight.id, 'description')} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-primary-400 uppercase mb-1">Date / Timeframe</p>
                                <EditableCell value={insight.date} isNumeric={false} onSave={save(insight.id, 'date')} />
                            </div>
                        </div>

                        {/* Right: dropdowns + confidence */}
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs font-bold text-primary-400 uppercase mb-1">Type</p>
                                <select value={insight.type}
                                    onChange={e => updateSmartInsight(insight.id, 'type', e.target.value)}
                                    className="input text-sm w-full">
                                    {INSIGHT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-primary-400 uppercase mb-1">Impact</p>
                                <select value={insight.impact}
                                    onChange={e => updateSmartInsight(insight.id, 'impact', e.target.value)}
                                    className="input text-sm w-full">
                                    {IMPACT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-primary-400 uppercase mb-1">Confidence (0–1)</p>
                                <EditableCell value={insight.confidence} onSave={save(insight.id, 'confidence')} />
                                <div className="mt-2 w-full bg-primary-100 dark:bg-primary-800 rounded-full h-1.5 overflow-hidden">
                                    <div className="h-full rounded-full bg-accent-gold transition-all" style={{ width: `${insight.confidence * 100}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// ─── Main MetricsEditor ───────────────────────────────────────────────────────

type Section = 'dashboard' | 'land' | 'rent' | 'economics' | 'neighborhoods' | 'insights';
type CityFilter = 'Douala' | 'Yaoundé';

const MetricsEditor: React.FC = () => {
    const { landPrices, rentByType, dashboardStats, resetToDefaults } = useMetrics();
    const [section, setSection] = useState<Section>('dashboard');
    const [cityFilter, setCityFilter] = useState<CityFilter>('Douala');
    const [resetConfirm, setResetConfirm] = useState(false);

    const landCity = landPrices.filter(r => r.city === cityFilter);
    const rentCity = rentByType.filter(r => r.city === cityFilter);

    const handleReset = () => {
        if (resetConfirm) { resetToDefaults(); setResetConfirm(false); }
        else { setResetConfirm(true); setTimeout(() => setResetConfirm(false), 4000); }
    };

    const sectionTabs: { id: Section; label: string; icon: React.ElementType }[] = [
        { id: 'dashboard', label: 'Dashboard Stats', icon: Activity },
        { id: 'land', label: 'Land Prices', icon: TrendingUp },
        { id: 'rent', label: 'Rental Data', icon: Home },
        { id: 'economics', label: 'Economics & Rates', icon: Landmark },
        { id: 'neighborhoods', label: 'Neighborhoods', icon: MapPin },
        { id: 'insights', label: 'Smart Insights', icon: Lightbulb },
    ];

    const dashboardGroups: { title: string; icon: React.ElementType; color: string; stats: { id: keyof DashboardStats; fields: { field: string; label: string }[] }[] }[] = [
        {
            title: 'Admin Dashboard', icon: Settings, color: 'text-primary-600',
            stats: [
                { id: 'admin_totalUsers', fields: [{ field: 'label', label: 'Label' }, { field: 'value', label: 'Value' }, { field: 'change', label: 'Change' }, { field: 'period', label: 'Period' }] },
                { id: 'admin_activeSessions', fields: [{ field: 'label', label: 'Label' }, { field: 'value', label: 'Value' }, { field: 'change', label: 'Change' }, { field: 'period', label: 'Period' }] },
                { id: 'admin_dbSize', fields: [{ field: 'label', label: 'Label' }, { field: 'value', label: 'Value' }, { field: 'change', label: 'Change' }, { field: 'period', label: 'Period' }] },
                { id: 'admin_systemHealth', fields: [{ field: 'label', label: 'Label' }, { field: 'value', label: 'Value' }, { field: 'change', label: 'Change' }, { field: 'period', label: 'Period' }] },
            ]
        },
        {
            title: 'Paid User Dashboard', icon: BarChart3, color: 'text-accent-gold',
            stats: [
                { id: 'paid_avgLandDouala', fields: [{ field: 'label', label: 'Label' }, { field: 'value', label: 'Value' }, { field: 'change', label: 'Change' }, { field: 'period', label: 'Period' }] },
                { id: 'paid_avgLandYaounde', fields: [{ field: 'label', label: 'Label' }, { field: 'value', label: 'Value' }, { field: 'change', label: 'Change' }, { field: 'period', label: 'Period' }] },
                { id: 'paid_rentalYield', fields: [{ field: 'label', label: 'Label' }, { field: 'value', label: 'Value' }, { field: 'change', label: 'Change' }, { field: 'period', label: 'Period' }] },
                { id: 'paid_activeListings', fields: [{ field: 'label', label: 'Label' }, { field: 'value', label: 'Value' }, { field: 'change', label: 'Change' }, { field: 'period', label: 'Period' }] },
            ]
        },
        {
            title: 'Free User Dashboard', icon: Users, color: 'text-blue-500',
            stats: [
                { id: 'free_avgLandDouala', fields: [{ field: 'label', label: 'Label' }, { field: 'value', label: 'Value' }, { field: 'change', label: 'Change' }, { field: 'period', label: 'Period' }] },
            ]
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header banner */}
            <div className="flex items-start gap-3 bg-accent-gold/10 border border-accent-gold/30 p-4 rounded-xl">
                <Edit2 className="w-5 h-5 text-accent-gold mt-0.5 shrink-0" />
                <div>
                    <p className="font-semibold text-primary-900 dark:text-white text-sm">Live Metrics Editor</p>
                    <p className="text-xs text-primary-500 mt-0.5">
                        Hover any value → click the <span className="inline-flex items-center gap-0.5 font-semibold text-accent-gold"><Edit2 className="w-3 h-3" /> pencil</span> to edit.
                        Press <kbd className="px-1 py-0.5 bg-primary-200 dark:bg-primary-700 rounded text-[10px] font-mono">Enter</kbd> to save.
                        All changes reflect <strong>instantly</strong> across paid &amp; free dashboards.
                    </p>
                </div>
            </div>

            {/* Sub-nav + reset */}
            <div className="flex flex-wrap items-center gap-2 justify-between">
                <div className="flex flex-wrap gap-2">
                    {sectionTabs.map(tab => (
                        <button key={tab.id} onClick={() => setSection(tab.id)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${section === tab.id
                                ? 'bg-accent-gold text-primary-950 shadow'
                                : 'bg-white dark:bg-primary-900 text-primary-500 border border-primary-200 dark:border-primary-700 hover:border-accent-gold/50'
                                }`}>
                            <tab.icon className="w-3.5 h-3.5" />{tab.label}
                        </button>
                    ))}
                </div>
                <button onClick={handleReset}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${resetConfirm
                        ? 'bg-red-500 text-white border-red-500 animate-pulse'
                        : 'border-red-400/40 text-red-500 hover:bg-red-500/10'
                        }`}>
                    <RotateCcw className="w-3.5 h-3.5" />
                    {resetConfirm ? 'Click again to confirm' : 'Reset All to Defaults'}
                </button>
            </div>

            {/* ── DASHBOARD STATS ── */}
            {section === 'dashboard' && (
                <div className="space-y-6">
                    {dashboardGroups.map(group => (
                        <div key={group.title} className="bg-white dark:bg-primary-900 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm overflow-hidden">
                            <div className="flex items-center gap-2 px-5 py-3.5 bg-primary-50 dark:bg-primary-800 border-b border-primary-200 dark:border-primary-700">
                                <group.icon className={`w-5 h-5 ${group.color}`} />
                                <h3 className="font-bold text-primary-900 dark:text-white">{group.title}</h3>
                            </div>
                            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                                {group.stats.map(sc => {
                                    const stat = dashboardStats[sc.id];
                                    return (
                                        <div key={sc.id} className="bg-primary-50 dark:bg-primary-800 rounded-lg p-4">
                                            <p className="text-xs font-bold text-primary-400 uppercase tracking-wide mb-3">{stat.label}</p>
                                            {sc.fields.map(f => (
                                                <StatCell key={f.field} statId={sc.id} field={f.field as any} label={f.label} />
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── LAND PRICES ── */}
            {section === 'land' && (
                <div className="space-y-4">
                    <div className="flex gap-2">
                        {CITIES.map(c => (
                            <button key={c} onClick={() => setCityFilter(c as CityFilter)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-semibold border transition-all ${cityFilter === c ? 'bg-accent-gold/10 text-accent-gold border-accent-gold/30' : 'bg-white dark:bg-primary-900 text-primary-500 border-primary-200 dark:border-primary-800'}`}>{c}</button>
                        ))}
                    </div>
                    <div className="bg-white dark:bg-primary-900 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm overflow-hidden">
                        <div className="flex items-center gap-2 px-5 py-3.5 bg-primary-50 dark:bg-primary-800 border-b border-primary-200 dark:border-primary-700">
                            <TrendingUp className="w-5 h-5 text-accent-gold" />
                            <h3 className="font-bold text-primary-900 dark:text-white">Land Prices — {cityFilter}</h3>
                            <span className="ml-2 text-xs text-primary-500">→ Avg/Median Price, Price/m², Annual Appreciation pages</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead><tr className="bg-primary-50/50 dark:bg-primary-800/50">
                                    {['Land Type', 'Avg Price/m²', 'Median Price/m²', 'Low Range', 'High Range', 'YoY %', '5yr Avg %', 'Sample'].map(h => (
                                        <th key={h} className="p-3 font-semibold text-primary-700 dark:text-primary-300">{h}</th>
                                    ))}
                                </tr></thead>
                                <tbody>{landCity.map(row => <LandRow key={`${row.city}-${row.landType}`} row={row} />)}</tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ── RENTAL DATA ── */}
            {section === 'rent' && (
                <div className="space-y-4">
                    <div className="flex gap-2">
                        {CITIES.map(c => (
                            <button key={c} onClick={() => setCityFilter(c as CityFilter)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-semibold border transition-all ${cityFilter === c ? 'bg-accent-gold/10 text-accent-gold border-accent-gold/30' : 'bg-white dark:bg-primary-900 text-primary-500 border-primary-200 dark:border-primary-800'}`}>{c}</button>
                        ))}
                    </div>
                    <div className="bg-white dark:bg-primary-900 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm overflow-hidden">
                        <div className="flex items-center gap-2 px-5 py-3.5 bg-primary-50 dark:bg-primary-800 border-b border-primary-200 dark:border-primary-700">
                            <Home className="w-5 h-5 text-accent-gold" />
                            <h3 className="font-bold text-primary-900 dark:text-white">Rental Data — {cityFilter}</h3>
                            <span className="ml-2 text-xs text-primary-500">→ Average Rent, Basic Rental Yield pages</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead><tr className="bg-primary-50/50 dark:bg-primary-800/50">
                                    {['Property Type', 'Avg Rent/mo', 'Median Rent/mo', 'Low Range', 'High Range', 'Gross Yield %', 'YoY %', 'Sample'].map(h => (
                                        <th key={h} className="p-3 font-semibold text-primary-700 dark:text-primary-300">{h}</th>
                                    ))}
                                </tr></thead>
                                <tbody>{rentCity.map(row => <RentRow key={`${row.city}-${row.propertyType}`} row={row} />)}</tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ── ECONOMICS & RATES ── */}
            {section === 'economics' && <EconomicsTab />}

            {/* ── NEIGHBORHOODS ── */}
            {section === 'neighborhoods' && <NeighborhoodsTab />}

            {/* ── SMART INSIGHTS ── */}
            {section === 'insights' && <InsightsTab />}
        </div>
    );
};

export default MetricsEditor;
