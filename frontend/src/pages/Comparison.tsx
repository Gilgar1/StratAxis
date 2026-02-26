import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    BarChart, Bar,
} from 'recharts';
import {
    ChevronRight, X, Info, DollarSign, Target,
} from 'lucide-react';
import clsx from 'clsx';
import { ZONES, ZoneIntelligence } from '../data/zoneIntelligence';
import {
    STRATEGIES, Strategy, StrategyConfig, ZoneScore,
    computeScores, simulateAllocation,
} from '../utils/scoringEngine';
import ExportBar from '../components/common/ExportBar';
import WatchlistButton from '../components/common/WatchlistButton';

// ─── Constants ────────────────────────────────────────────────────────────────

const COLORS = ['#D4AF37', '#6366f1', '#22c55e'];

const scoreColor = (s: number) =>
    s >= 70 ? '#22c55e' : s >= 50 ? '#f59e0b' : '#ef4444';

const riskBadge: Record<string, string> = {
    Low: 'text-emerald-600 bg-emerald-500/10 dark:text-emerald-400',
    Medium: 'text-amber-600  bg-amber-500/10   dark:text-amber-400',
    High: 'text-red-500    bg-red-500/10',
};

const outlookColor: Record<string, string> = {
    Strong: 'text-emerald-500',
    Moderate: 'text-amber-500',
    Weak: 'text-red-500',
};

const tagColors: Record<string, string> = {
    'Early Growth': 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    'Overpriced': 'bg-red-500/15     text-red-600     dark:text-red-400',
    'Stabilized Prime': 'bg-blue-500/15    text-blue-600    dark:text-blue-400',
    'Infrastructure Driven': 'bg-purple-500/15  text-purple-600  dark:text-purple-400',
    'Speculative Upside': 'bg-orange-500/15  text-orange-600  dark:text-orange-400',
    'Low Liquidity Risk': 'bg-yellow-500/15  text-yellow-600  dark:text-yellow-400',
    'Undervalued Entry': 'bg-cyan-500/15    text-cyan-600    dark:text-cyan-400',
    'High Cashflow Potential': 'bg-teal-500/15    text-teal-600    dark:text-teal-400',
    'Institutional Momentum': 'bg-indigo-500/15  text-indigo-600  dark:text-indigo-400',
};

const zoneClassBadge: Record<string, string> = {
    Expansion: 'bg-emerald-500/15 text-emerald-600',
    Mature: 'bg-blue-500/15    text-blue-600',
    Transitional: 'bg-amber-500/15   text-amber-600',
    Speculative: 'bg-orange-500/15  text-orange-600',
};

const fmt = (n: number) => n.toLocaleString();

// ─── Strategy Card ────────────────────────────────────────────────────────────

const StrategyCard: React.FC<{ cfg: StrategyConfig; selected: boolean; onSelect: () => void }> = ({
    cfg, selected, onSelect,
}) => (
    <button
        onClick={onSelect}
        className={clsx(
            'text-left p-5 rounded-xl border-2 transition-all duration-200',
            selected
                ? 'border-accent-gold bg-accent-gold/5 shadow-lg shadow-accent-gold/10'
                : 'border-primary-200 dark:border-primary-700 hover:border-accent-gold/50 bg-white dark:bg-primary-900',
        )}
    >
        <div className="flex items-start justify-between mb-3">
            <span className="text-2xl">{cfg.icon}</span>
            {selected && (
                <span className="text-xs font-bold text-accent-gold bg-accent-gold/10 px-2 py-0.5 rounded-full">
                    SELECTED
                </span>
            )}
        </div>
        <h3 className={clsx('font-bold mb-1 text-sm',
            selected ? 'text-amber-700 dark:text-accent-gold' : 'text-primary-900 dark:text-white')}>
            {cfg.label}
        </h3>
        <p className="text-xs text-primary-500 dark:text-primary-400 leading-relaxed">{cfg.description}</p>
    </button>
);

// ─── Zone Picker ──────────────────────────────────────────────────────────────

const ZonePicker: React.FC<{ selected: string[]; onToggle: (id: string) => void }> = ({
    selected, onToggle,
}) => {
    const doubala = ZONES.filter(z => z.city === 'Douala');
    const yaounde = ZONES.filter(z => z.city === 'Yaoundé');

    const Btn = ({ z }: { z: ZoneIntelligence }) => {
        const isSelected = selected.includes(z.id);
        const isFull = selected.length >= 3 && !isSelected;
        return (
            <button
                disabled={isFull}
                onClick={() => onToggle(z.id)}
                className={clsx(
                    'px-3 py-2 rounded-lg text-sm font-medium border transition-all',
                    isSelected
                        ? 'border-accent-gold bg-accent-gold text-primary-950 shadow-sm'
                        : isFull
                            ? 'border-primary-200 dark:border-primary-700 text-primary-400 cursor-not-allowed opacity-40 bg-white dark:bg-primary-900'
                            : 'border-primary-200 dark:border-primary-700 text-primary-700 dark:text-primary-300 hover:border-accent-gold/60 bg-white dark:bg-primary-900',
                )}
            >
                {isSelected && <span className="mr-1 font-bold">#{selected.indexOf(z.id) + 1}</span>}
                {z.name}
                <span className="ml-1 text-xs opacity-60">({z.city.slice(0, 3)})</span>
            </button>
        );
    };

    return (
        <div className="space-y-4">
            {[{ label: 'Douala', zones: doubala }, { label: 'Yaoundé', zones: yaounde }].map(group => (
                <div key={group.label}>
                    <p className="text-xs font-bold text-primary-400 uppercase tracking-wider mb-2">{group.label}</p>
                    <div className="flex flex-wrap gap-2">
                        {group.zones.map(z => <Btn key={z.id} z={z} />)}
                    </div>
                </div>
            ))}
        </div>
    );
};

// ─── Score Arc SVG ────────────────────────────────────────────────────────────

const ScoreArc: React.FC<{ score: number; size?: number }> = ({ score, size = 80 }) => {
    const r = (size - 8) / 2;
    const circ = 2 * Math.PI * r;
    const color = scoreColor(score);
    return (
        <svg width={size} height={size * 0.75} viewBox={`0 0 ${size} ${size * 0.75}`}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={6}
                strokeDasharray={`${circ * 0.75} ${circ}`}
                strokeLinecap="round" transform={`rotate(135 ${size / 2} ${size / 2})`} />
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6}
                strokeDasharray={`${circ * 0.75 * (score / 100)} ${circ}`}
                strokeLinecap="round" transform={`rotate(135 ${size / 2} ${size / 2})`}
                style={{ transition: 'stroke-dasharray 0.6s ease' }} />
            <text x={size / 2} y={size / 2 + 5} textAnchor="middle" fontSize="18" fontWeight="700" fill={color}>
                {score}
            </text>
        </svg>
    );
};

// ─── Forecast Band Chart ──────────────────────────────────────────────────────

const ForecastBandChart: React.FC<{ scores: ZoneScore[] }> = ({ scores }) => {
    const data = ['Now', '+12m', '+24m'].map((label, ti) => {
        const entry: Record<string, string | number> = { label };
        scores.forEach(s => {
            const z = s.zone;
            if (ti === 0) {
                entry[s.zone.name + '_base'] = z.medianPricePerSqm;
            } else if (ti === 1) {
                entry[s.zone.name + '_low'] = z.forecast12mLow;
                entry[s.zone.name + '_base'] = z.forecast12mBase;
                entry[s.zone.name + '_high'] = z.forecast12mHigh;
            } else {
                entry[s.zone.name + '_low'] = z.forecast24mLow;
                entry[s.zone.name + '_base'] = z.forecast24mBase;
                entry[s.zone.name + '_high'] = z.forecast24mHigh;
            }
        });
        return entry;
    });

    return (
        <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="label" />
                <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString()} XAF`} />
                <Legend />
                {scores.map((s, i) => (
                    <React.Fragment key={s.zone.id}>
                        <Area type="monotone" dataKey={`${s.zone.name}_high`}
                            stroke="none" fill={COLORS[i]} fillOpacity={0.15} name="" legendType="none" />
                        <Area type="monotone" dataKey={`${s.zone.name}_base`}
                            stroke={COLORS[i]} strokeWidth={2.5} fill={COLORS[i]} fillOpacity={0.08}
                            name={s.zone.name} dot={{ r: 4 }} />
                        <Area type="monotone" dataKey={`${s.zone.name}_low`}
                            stroke="none" fill={COLORS[i]} fillOpacity={0.15} name="" legendType="none" />
                    </React.Fragment>
                ))}
            </AreaChart>
        </ResponsiveContainer>
    );
};

// ─── Radar ────────────────────────────────────────────────────────────────────

const RiskRadar: React.FC<{ scores: ZoneScore[] }> = ({ scores }) => {
    type AxisKey = 'Growth' | 'Liquidity' | 'Stability' | 'Institutional' | 'Undervalue';
    const axes: AxisKey[] = ['Growth', 'Liquidity', 'Stability', 'Institutional', 'Undervalue'];

    const data = axes.map(axis => {
        const entry: Record<string, string | number> = { axis };
        scores.forEach(s => {
            const z = s.zone;
            const map: Record<AxisKey, number> = {
                Growth: z.norm.growth,
                Liquidity: z.norm.liquidity,
                Stability: z.norm.stability,
                Institutional: z.norm.institutional,
                Undervalue: z.norm.undervaluation,
            };
            entry[s.zone.name] = Math.round(map[axis] * 100);
        });
        return entry;
    });

    return (
        <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={data} cx="50%" cy="50%">
                <PolarGrid />
                <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11 }} />
                {scores.map((s, i) => (
                    <Radar key={s.zone.id} name={s.zone.name} dataKey={s.zone.name}
                        stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.15} strokeWidth={2} />
                ))}
                <Legend />
            </RadarChart>
        </ResponsiveContainer>
    );
};

// ─── Allocation Simulator Panel ───────────────────────────────────────────────

const AllocationPanel: React.FC<{ scores: ZoneScore[] }> = ({ scores }) => {
    const [amount, setAmount] = useState(50_000_000);
    const results = useMemo(() => simulateAllocation(scores, amount), [scores, amount]);

    const RANK_BG = [
        'border-amber-400/40  bg-amber-400/5',
        'border-slate-400/40  bg-slate-400/5',
        'border-orange-800/40 bg-orange-700/5',
    ];

    return (
        <div className="bg-white dark:bg-primary-900 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-accent-gold" />
                    <h3 className="font-bold text-lg text-primary-900 dark:text-white">Capital Allocation Simulator</h3>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-primary-500 whitespace-nowrap">Investment (XAF):</span>
                    <input
                        type="number"
                        value={amount}
                        step={5_000_000}
                        onChange={e => setAmount(Number(e.target.value))}
                        className="input w-44 text-right font-mono text-sm"
                    />
                </div>
            </div>

            <input
                type="range" min={5_000_000} max={500_000_000} step={5_000_000}
                value={amount} onChange={e => setAmount(Number(e.target.value))}
                className="w-full accent-amber-500 mb-1"
            />
            <div className="flex justify-between text-xs text-primary-400 mb-6">
                <span>5M</span>
                <span className="font-bold text-accent-gold">{(amount / 1e6).toFixed(0)}M XAF</span>
                <span>500M</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {results.map((r, i) => {
                    const zone = scores[i]?.zone;
                    if (!zone) return null;
                    return (
                        <div key={r.zoneId} className={`rounded-xl border-2 p-5 ${RANK_BG[i] ?? ''}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-xs text-primary-400 mb-0.5">Rank #{r.rank} · Score {r.compositeScore}/100</p>
                                    <h4 className="font-bold text-primary-900 dark:text-white">{zone.name}</h4>
                                    <p className="text-xs text-primary-500">{zone.city}</p>
                                </div>
                                <span className="text-2xl">{['🥇', '🥈', '🥉'][i]}</span>
                            </div>

                            {([
                                { label: '+1 Year', data: r.year1 },
                                { label: '+3 Years', data: r.year3 },
                                { label: '+5 Years', data: r.year5 },
                            ] as const).map(({ label, data }) => {
                                const gain = data.base - amount;
                                const pct = ((gain / amount) * 100).toFixed(1);
                                return (
                                    <div key={label} className="mb-3">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-xs text-primary-500">{label}</span>
                                            <span className={clsx('text-xs font-bold', gain >= 0 ? 'text-emerald-500' : 'text-red-500')}>
                                                {gain >= 0 ? '+' : ''}{pct}%
                                            </span>
                                        </div>
                                        <div className="relative h-5 bg-primary-100 dark:bg-primary-800 rounded overflow-hidden">
                                            <div className="absolute h-full opacity-30 rounded"
                                                style={{
                                                    background: COLORS[i],
                                                    left: `${Math.max(0, (data.low / (amount * 2.5)) * 100)}%`,
                                                    right: `${100 - Math.min(100, (data.high / (amount * 2.5)) * 100)}%`,
                                                }} />
                                            <div className="absolute top-0 h-full w-0.5"
                                                style={{ background: COLORS[i], left: `${Math.min(98, (data.base / (amount * 2.5)) * 100)}%` }} />
                                        </div>
                                        <div className="flex justify-between text-xs mt-0.5 text-primary-400">
                                            <span>{(data.low / 1e6).toFixed(1)}M</span>
                                            <span className="font-bold text-primary-700 dark:text-primary-300">{(data.base / 1e6).toFixed(1)}M</span>
                                            <span>{(data.high / 1e6).toFixed(1)}M</span>
                                        </div>
                                    </div>
                                );
                            })}

                            <div className="pt-3 border-t border-primary-200 dark:border-primary-700 flex justify-between">
                                <span className="text-xs text-primary-500">Risk-Adj. Return</span>
                                <span className={clsx('text-sm font-bold',
                                    r.riskAdjustedReturn > 0.5 ? 'text-emerald-500' : 'text-amber-500')}>
                                    {r.riskAdjustedReturn.toFixed(2)}x
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

type Layer = 1 | 2 | 3 | 4;

const LAYER_LABELS: Record<Layer, string> = {
    1: 'Strategic Scorecard',
    2: 'Market Structure',
    3: 'Risk Engine',
    4: 'Forward Intelligence',
};

const Comparison: React.FC = () => {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [strategy, setStrategy] = useState<Strategy | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>(['bonapriso', 'makepe']);
    const [activeLayer, setActiveLayer] = useState<Layer>(1);

    const selectedZones = selectedIds.map(id => ZONES.find(z => z.id === id)!).filter(Boolean);

    const scores: ZoneScore[] = useMemo(
        () => strategy ? computeScores(selectedZones, strategy) : [],
        [strategy, selectedIds],
    );

    const toggleZone = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id)
                : prev.length < 3 ? [...prev, id] : prev,
        );
    };

    const csvData = scores.map(s => ({
        Zone: s.zone.name,
        City: s.zone.city,
        Strategy: STRATEGIES.find(st => st.id === strategy)?.label ?? '',
        'Composite Score': s.compositeScore,
        Rank: s.rank,
        'Growth Outlook': s.growthOutlook,
        'Risk Level': s.riskLevel,
        'Liquidity Level': s.liquidityLevel,
        'Institutional Signal': s.institutionalLevel,
        'Median Price (XAF/m²)': s.zone.medianPricePerSqm,
        '3Y CAGR (%)': s.zone.cagr3Year,
        'Days on Market': s.zone.daysOnMarket,
        'Volatility Index': s.zone.volatilityIndex,
        '12m Forecast Base (XAF)': s.zone.forecast12mBase,
        '24m Forecast Base (XAF)': s.zone.forecast24mBase,
        'Growth Probability (%)': s.zone.growthProbability,
        Tags: s.tags.join(' | '),
    }));

    // ── Stepper ──────────────────────────────────────────────────────────────────
    const Stepper = () => (
        <div className="flex items-center gap-2 flex-wrap">
            {([
                [1, 'Select Strategy'],
                [2, 'Select Zones'],
                [3, 'Intelligence Dashboard'],
            ] as [number, string][]).map(([n, label], i) => {
                const active = step === n;
                const done = step > n;
                return (
                    <React.Fragment key={n}>
                        <button
                            onClick={() => (done || active) ? setStep(n as 1 | 2 | 3) : undefined}
                            className={clsx(
                                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
                                active && 'bg-accent-gold text-primary-950',
                                done && 'bg-emerald-500/10 text-emerald-600 cursor-pointer',
                                !active && !done && 'bg-primary-100 dark:bg-primary-800 text-primary-400',
                            )}
                        >
                            <span className={clsx('w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center',
                                active && 'bg-black/20',
                                done && 'bg-emerald-500/20',
                                !active && !done && 'bg-primary-300 dark:bg-primary-600',
                            )}>
                                {done ? '✓' : n}
                            </span>
                            {label}
                        </button>
                        {i < 2 && <ChevronRight className="w-4 h-4 text-primary-300 flex-shrink-0" />}
                    </React.Fragment>
                );
            })}
        </div>
    );

    return (
        <AuthenticatedLayout>
            <div className="p-8 max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Target className="w-5 h-5 text-accent-gold" />
                            <span className="text-xs font-bold text-accent-gold uppercase tracking-widest">Strategy Intelligence</span>
                        </div>
                        <h1 className="text-3xl font-bold text-primary-900 dark:text-white">Neighborhood Comparison</h1>
                        <p className="text-sm text-primary-500 dark:text-primary-400 mt-1">
                            Risk-adjusted capital allocation decisions across up to 3 zones.
                        </p>
                    </div>
                    {scores.length > 0 && (
                        <ExportBar
                            csvRows={csvData}
                            csvFilename={`StratAxis_Zone_Comparison_${new Date().toISOString().slice(0, 10)}`}
                            pdfTitle="StratAxis – Neighborhood Comparison Report"
                        />
                    )}
                </div>

                <Stepper />

                {/* ═══════════════════════════ STEP 1 ═══════════════════════════ */}
                {step === 1 && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-primary-900 rounded-xl border border-primary-200 dark:border-primary-800 p-6 shadow-sm">
                            <h2 className="font-bold text-xl text-primary-900 dark:text-white mb-1">
                                What is your investment objective?
                            </h2>
                            <p className="text-sm text-primary-500 mb-6">
                                Your selection dynamically changes scoring weights and zone rankings.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                                {STRATEGIES.map(cfg => (
                                    <StrategyCard
                                        key={cfg.id} cfg={cfg}
                                        selected={strategy === cfg.id}
                                        onSelect={() => setStrategy(cfg.id)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Weight formula hint */}
                        {strategy && (() => {
                            const cfg = STRATEGIES.find(s => s.id === strategy)!;
                            const activeWeights = Object.entries(cfg.weights)
                                .filter(([, v]) => v > 0)
                                .sort(([, a], [, b]) => b - a);
                            return (
                                <div className="bg-accent-gold/5 border border-accent-gold/30 rounded-xl p-5">
                                    <div className="flex items-start gap-3">
                                        <Info className="w-5 h-5 text-accent-gold flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-primary-900 dark:text-white mb-2">
                                                Scoring formula for{' '}
                                                <span className="text-accent-gold">{cfg.icon} {cfg.label}</span>
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {activeWeights.map(([k, v]) => (
                                                    <span key={k}
                                                        className="text-xs bg-white dark:bg-primary-900 border border-primary-200 dark:border-primary-700 px-2 py-1 rounded font-mono">
                                                        {k.charAt(0).toUpperCase() + k.slice(1)}:
                                                        <strong className="text-accent-gold ml-1">{Math.round(v * 100)}%</strong>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        <div className="flex justify-end">
                            <button
                                disabled={!strategy}
                                onClick={() => setStep(2)}
                                className="btn btn-primary disabled:opacity-40"
                            >
                                Continue to Zone Selection <ChevronRight className="w-4 h-4 ml-1 inline" />
                            </button>
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════ STEP 2 ═══════════════════════════ */}
                {step === 2 && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-primary-900 rounded-xl border border-primary-200 dark:border-primary-800 p-6 shadow-sm">
                            <div className="flex justify-between items-start mb-5">
                                <div>
                                    <h2 className="font-bold text-xl text-primary-900 dark:text-white mb-1">
                                        Select up to 3 zones to compare
                                    </h2>
                                    <p className="text-sm text-primary-500">
                                        Scoring for:{' '}
                                        <span className="font-bold text-accent-gold">
                                            {STRATEGIES.find(s => s.id === strategy)?.icon}{' '}
                                            {STRATEGIES.find(s => s.id === strategy)?.label}
                                        </span>
                                    </p>
                                </div>
                                <span className="text-sm bg-accent-gold/10 text-accent-gold font-bold px-3 py-1 rounded-full">
                                    {selectedIds.length}/3 selected
                                </span>
                            </div>
                            <ZonePicker selected={selectedIds} onToggle={toggleZone} />
                        </div>

                        {selectedZones.length > 0 && (
                            <div className="flex flex-wrap gap-3">
                                {selectedZones.map((z, i) => (
                                    <div key={z.id}
                                        className="flex items-center gap-2 bg-white dark:bg-primary-900 border border-primary-200 dark:border-primary-700 rounded-lg px-3 py-2">
                                        <span className="w-5 h-5 rounded-full text-xs font-bold text-white flex items-center justify-center"
                                            style={{ background: COLORS[i] }}>
                                            {i + 1}
                                        </span>
                                        <span className="font-medium text-sm text-primary-900 dark:text-white">{z.name}</span>
                                        <span className="text-xs text-primary-400">{z.city}</span>
                                        <button onClick={() => toggleZone(z.id)}
                                            className="text-primary-300 hover:text-red-500 transition-colors ml-1">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-between">
                            <button onClick={() => setStep(1)} className="btn btn-outline">← Back</button>
                            <button
                                disabled={selectedZones.length === 0}
                                onClick={() => setStep(3)}
                                className="btn btn-primary disabled:opacity-40"
                            >
                                Analyse Zones <ChevronRight className="w-4 h-4 ml-1 inline" />
                            </button>
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════ STEP 3 ═══════════════════════════ */}
                {step === 3 && scores.length > 0 && (
                    <div className="space-y-6">

                        {/* Context bar */}
                        <div className="flex flex-wrap gap-2 items-center text-sm">
                            <span className="text-primary-500">Strategy:</span>
                            <span className="font-bold text-accent-gold">
                                {STRATEGIES.find(s => s.id === strategy)?.icon}{' '}
                                {STRATEGIES.find(s => s.id === strategy)?.label}
                            </span>
                            <span className="text-primary-300 mx-1">|</span>
                            <span className="text-primary-500">Zones:</span>
                            {scores.map((s, i) => (
                                <span key={s.zone.id}
                                    className="font-medium px-2 py-0.5 rounded text-xs"
                                    style={{ background: COLORS[i] + '25', color: COLORS[i] }}>
                                    #{s.rank} {s.zone.name}
                                </span>
                            ))}
                            <button onClick={() => setStep(1)}
                                className="ml-auto text-xs text-primary-400 hover:text-accent-gold underline">
                                Edit
                            </button>
                        </div>

                        {/* Layer tabs */}
                        <div className="flex gap-1 bg-primary-100 dark:bg-primary-800 rounded-lg p-1 w-fit flex-wrap">
                            {([1, 2, 3, 4] as Layer[]).map(n => (
                                <button key={n} onClick={() => setActiveLayer(n)}
                                    className={clsx(
                                        'px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap',
                                        activeLayer === n
                                            ? 'bg-white dark:bg-primary-900 text-primary-900 dark:text-white shadow-sm'
                                            : 'text-primary-500 hover:text-primary-700 dark:hover:text-primary-300',
                                    )}>
                                    {LAYER_LABELS[n]}
                                </button>
                            ))}
                        </div>

                        {/* ─────────── Layer 1: Strategic Scorecard ─────────── */}
                        {activeLayer === 1 && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {scores.map((s, i) => (
                                        <div key={s.zone.id}
                                            className={clsx(
                                                'bg-white dark:bg-primary-900 rounded-xl border-2 shadow-sm p-6 relative overflow-hidden',
                                                i === 0 ? 'border-amber-400' : i === 1 ? 'border-slate-400' : 'border-orange-800',
                                            )}>
                                            <div className="absolute top-4 right-4 text-3xl select-none">
                                                {['🥇', '🥈', '🥉'][i]}
                                            </div>
                                            <div className="flex items-start gap-4 mb-4">
                                                <ScoreArc score={s.compositeScore} size={80} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs text-primary-400 uppercase tracking-wider mb-1">
                                                        #{s.rank} of {scores.length}
                                                    </p>
                                                    <h3 className="font-bold text-xl text-primary-900 dark:text-white truncate">
                                                        {s.zone.name}
                                                    </h3>
                                                    <p className="text-sm text-primary-500">{s.zone.city}</p>
                                                </div>
                                            </div>

                                            {/* Tags */}
                                            <div className="flex flex-wrap gap-1 mb-4 min-h-[1.75rem]">
                                                {s.tags.slice(0, 3).map(tag => (
                                                    <span key={tag}
                                                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${tagColors[tag] ?? 'bg-primary-100 text-primary-600'}`}>
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Signal rows */}
                                            <div className="space-y-2 text-sm">
                                                {[
                                                    { label: 'Growth Outlook', value: s.growthOutlook, cls: outlookColor[s.growthOutlook] },
                                                    { label: 'Risk Level', value: s.riskLevel, cls: riskBadge[s.riskLevel] + ' px-1.5 py-0.5 rounded text-xs font-bold' },
                                                    { label: 'Liquidity', value: s.liquidityLevel, cls: s.liquidityLevel === 'High' ? 'text-emerald-500' : s.liquidityLevel === 'Medium' ? 'text-amber-500' : 'text-red-500' },
                                                    { label: 'Institutional', value: s.institutionalLevel, cls: s.institutionalLevel === 'Strong' ? 'text-blue-500' : s.institutionalLevel === 'Moderate' ? 'text-amber-500' : 'text-primary-400' },
                                                    { label: 'Zone Type', value: s.zone.zonClassification, cls: zoneClassBadge[s.zone.zonClassification] + ' px-1.5 py-0.5 rounded text-xs font-bold' },
                                                ].map(row => (
                                                    <div key={row.label} className="flex justify-between items-center">
                                                        <span className="text-primary-500">{row.label}</span>
                                                        <span className={clsx('font-semibold', row.cls)}>{row.value}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-4 pt-3 border-t border-primary-100 dark:border-primary-800">
                                                <WatchlistButton
                                                    neighborhood={s.zone.name}
                                                    city={s.zone.city}
                                                    type={`Comparison – ${STRATEGIES.find(st => st.id === strategy)?.label}`}
                                                    currentPrice={s.zone.medianPricePerSqm}
                                                    change={`+${s.zone.cagr3Year}%`}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Score breakdown */}
                                <div className="bg-white dark:bg-primary-900 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm p-6">
                                    <h3 className="font-bold text-primary-900 dark:text-white mb-4">Score Breakdown by Factor</h3>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <BarChart
                                            layout="vertical"
                                            data={Object.keys(scores[0].breakdown)
                                                .filter(k => {
                                                    const w = STRATEGIES.find(s => s.id === strategy)?.weights as unknown as Record<string, number>;
                                                    return (w[k] ?? 0) > 0;
                                                })
                                                .map(factor => {
                                                    const entry: Record<string, string | number> = {
                                                        factor: factor.charAt(0).toUpperCase() + factor.slice(1),
                                                    };
                                                    scores.forEach(s => {
                                                        entry[s.zone.name] = (s.breakdown as Record<string, number>)[factor];
                                                    });
                                                    return entry;
                                                })}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} horizontal={false} />
                                            <XAxis type="number" domain={[0, 40]} />
                                            <YAxis type="category" dataKey="factor" width={90} tick={{ fontSize: 11 }} />
                                            <Tooltip />
                                            <Legend />
                                            {scores.map((s, i) => (
                                                <Bar key={s.zone.id} dataKey={s.zone.name}
                                                    fill={COLORS[i]} radius={[0, 4, 4, 0]} />
                                            ))}
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* ─────────── Layer 2: Market Structure ─────────── */}
                        {activeLayer === 2 && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {scores.map((s, i) => (
                                        <div key={s.zone.id}
                                            className="bg-white dark:bg-primary-900 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm p-5">
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }} />
                                                <h3 className="font-bold text-primary-900 dark:text-white">{s.zone.name}</h3>
                                                <span className="text-xs text-primary-400">{s.zone.city}</span>
                                            </div>
                                            {[
                                                { label: 'Median Price', value: `${fmt(s.zone.medianPricePerSqm)} XAF/m²` },
                                                { label: 'P25 – P75', value: `${fmt(s.zone.priceP25)} – ${fmt(s.zone.priceP75)}` },
                                                { label: 'vs City Average', value: `${s.zone.overpricingPct > 0 ? '+' : ''}${s.zone.overpricingPct.toFixed(1)}%`, colored: true },
                                                { label: '3-Year CAGR', value: `+${s.zone.cagr3Year}%` },
                                                { label: '5-Year CAGR', value: `+${s.zone.cagr5Year}%` },
                                                { label: 'Active Listings', value: `${s.zone.listingCount}` },
                                                { label: 'Listing Trend (3m)', value: `${s.zone.listingTrend3m > 0 ? '+' : ''}${s.zone.listingTrend3m}%` },
                                                { label: 'Days on Market', value: `${s.zone.daysOnMarket} days` },
                                                { label: 'Absorption Rate', value: `${s.zone.absorptionRate}% /mo` },
                                                { label: 'Months of Supply', value: `${s.zone.monthsOfSupply} mo` },
                                            ].map(row => (
                                                <div key={row.label}
                                                    className="flex justify-between text-sm py-1.5 border-b border-primary-50 dark:border-primary-800 last:border-0">
                                                    <span className="text-primary-500">{row.label}</span>
                                                    <span className={clsx('font-semibold',
                                                        row.colored && (s.zone.overpricingPct > 0 ? 'text-red-500' : 'text-emerald-500'))}>
                                                        {row.value}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>

                                {/* Price history */}
                                <div className="bg-white dark:bg-primary-900 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm p-6">
                                    <h3 className="font-bold text-primary-900 dark:text-white mb-4">Price History (XAF/m²)</h3>
                                    <ResponsiveContainer width="100%" height={240}>
                                        <AreaChart data={['2021', '2022', '2023', '2024', '2025'].map(year => {
                                            const entry: Record<string, string | number> = { year };
                                            scores.forEach(s => {
                                                const found = s.zone.priceHistory.find(h => h.year === year);
                                                if (found) entry[s.zone.name] = found.price;
                                            });
                                            return entry;
                                        })}>
                                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                            <XAxis dataKey="year" />
                                            <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                                            <Tooltip formatter={(v: number) => `${v.toLocaleString()} XAF`} />
                                            <Legend />
                                            {scores.map((s, i) => (
                                                <Area key={s.zone.id} type="monotone" dataKey={s.zone.name}
                                                    stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.08}
                                                    strokeWidth={2.5} dot={{ r: 4 }} />
                                            ))}
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Radar */}
                                <div className="bg-white dark:bg-primary-900 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm p-6">
                                    <h3 className="font-bold text-primary-900 dark:text-white mb-4">Multi-Factor Risk Profile</h3>
                                    <RiskRadar scores={scores} />
                                </div>
                            </div>
                        )}

                        {/* ─────────── Layer 3: Risk Engine ─────────── */}
                        {activeLayer === 3 && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {scores.map((s, i) => (
                                    <div key={s.zone.id}
                                        className="bg-white dark:bg-primary-900 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm p-5 space-y-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }} />
                                            <h3 className="font-bold text-primary-900 dark:text-white">{s.zone.name}</h3>
                                        </div>

                                        {/* Volatility gauge */}
                                        <div>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-xs text-primary-500">Volatility Index</span>
                                                <span className={clsx('text-sm font-bold', riskBadge[s.riskLevel])}>
                                                    {s.zone.volatilityIndex.toFixed(1)} / 10
                                                </span>
                                            </div>
                                            <div className="h-2 bg-primary-100 dark:bg-primary-800 rounded-full overflow-hidden">
                                                <div className="h-full rounded-full transition-all duration-500"
                                                    style={{
                                                        width: `${(s.zone.volatilityIndex / 10) * 100}%`,
                                                        background:
                                                            s.zone.volatilityIndex < 3 ? '#22c55e' :
                                                                s.zone.volatilityIndex < 5 ? '#f59e0b' : '#ef4444',
                                                    }} />
                                            </div>
                                        </div>

                                        {[
                                            { label: 'Risk Classification', value: s.riskLevel, cls: riskBadge[s.riskLevel] + ' px-2 py-0.5 rounded text-xs font-bold' },
                                            { label: 'Growth Instability', value: `${s.zone.growthInstabilityScore.toFixed(1)} / 10` },
                                            { label: 'Overpricing Flag', value: s.zone.overpricingFlag ? '⚠ YES' : '✓ None', cls: s.zone.overpricingFlag ? 'text-red-500 font-bold' : 'text-emerald-500 font-bold' },
                                            { label: 'vs Fair Value', value: `${s.zone.overpricingPct > 0 ? '+' : ''}${s.zone.overpricingPct.toFixed(1)}%`, cls: s.zone.overpricingPct > 30 ? 'text-red-500 font-bold' : s.zone.overpricingPct < -20 ? 'text-emerald-500 font-bold' : '' },
                                            { label: 'Months of Supply', value: `${s.zone.monthsOfSupply} months` },
                                            { label: 'Infrastructure Score', value: `${s.zone.infrastructureScore} / 10` },
                                            { label: 'Zoning Score', value: `${s.zone.zoningScore} / 10` },
                                        ].map(row => (
                                            <div key={row.label}
                                                className="flex justify-between text-sm py-1.5 border-b border-primary-50 dark:border-primary-800 last:border-0">
                                                <span className="text-primary-500">{row.label}</span>
                                                <span className={clsx('font-semibold', row.cls)}>{row.value}</span>
                                            </div>
                                        ))}

                                        <div className={clsx('rounded-lg p-3 text-sm leading-relaxed',
                                            s.riskLevel === 'Low' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' :
                                                s.riskLevel === 'Medium' ? 'bg-amber-500/10   text-amber-700   dark:text-amber-400' :
                                                    'bg-red-500/10     text-red-600     dark:text-red-400')}>
                                            {s.riskLevel === 'Low' && `✓ Stable momentum and low downside. Suitable for conservative allocation.`}
                                            {s.riskLevel === 'Medium' && `⚠ Moderate volatility. Diversified entry with staged investment recommended.`}
                                            {s.riskLevel === 'High' && `⚡ High volatility. Suitable only for speculative or land-banking strategies.`}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ─────────── Layer 4: Forward Intelligence ─────────── */}
                        {activeLayer === 4 && (
                            <div className="space-y-4">
                                <div className="bg-white dark:bg-primary-900 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm p-6">
                                    <h3 className="font-bold text-primary-900 dark:text-white mb-1">12–24 Month Price Forecast</h3>
                                    <p className="text-xs text-primary-400 mb-4">
                                        Shaded band = low/high range. Line = base case.
                                    </p>
                                    <ForecastBandChart scores={scores} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {scores.map((s, i) => (
                                        <div key={s.zone.id}
                                            className="bg-white dark:bg-primary-900 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm p-5 space-y-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }} />
                                                <h3 className="font-bold text-primary-900 dark:text-white">{s.zone.name}</h3>
                                            </div>

                                            {/* Growth probability ring */}
                                            <div className="flex items-center gap-4">
                                                <svg width={60} height={60} viewBox="0 0 60 60">
                                                    <circle cx={30} cy={30} r={24} fill="none" stroke="#e5e7eb" strokeWidth={5} />
                                                    <circle cx={30} cy={30} r={24} fill="none"
                                                        stroke={COLORS[i]} strokeWidth={5}
                                                        strokeDasharray={`${(s.zone.growthProbability / 100) * 150.8} 150.8`}
                                                        strokeLinecap="round" transform="rotate(-90 30 30)"
                                                        style={{ transition: 'stroke-dasharray 0.6s ease' }} />
                                                    <text x={30} y={34} textAnchor="middle" fontSize="12" fontWeight="700"
                                                        fill={COLORS[i]}>
                                                        {s.zone.growthProbability}%
                                                    </text>
                                                </svg>
                                                <div>
                                                    <p className="text-xs text-primary-500">Growth Probability</p>
                                                    <p className="text-sm font-bold" style={{ color: COLORS[i] }}>
                                                        {s.zone.growthProbability >= 75 ? 'High Confidence' :
                                                            s.zone.growthProbability >= 60 ? 'Moderate' : 'Speculative'}
                                                    </p>
                                                    <p className="text-xs text-primary-400">
                                                        Confidence: {s.zone.forecastConfidence}
                                                    </p>
                                                </div>
                                            </div>

                                            {[
                                                { label: '12m Low', value: `${fmt(s.zone.forecast12mLow)} XAF` },
                                                { label: '12m Base', value: `${fmt(s.zone.forecast12mBase)} XAF`, gold: true },
                                                { label: '12m High', value: `${fmt(s.zone.forecast12mHigh)} XAF` },
                                                { label: '24m Base', value: `${fmt(s.zone.forecast24mBase)} XAF`, gold: true },
                                                { label: 'Institutional Index', value: `${s.zone.institutionalPressureIndex}/100` },
                                                { label: 'Zone Classification', value: s.zone.zonClassification, badge: true },
                                            ].map(row => (
                                                <div key={row.label}
                                                    className="flex justify-between text-sm py-1.5 border-b border-primary-50 dark:border-primary-800 last:border-0">
                                                    <span className="text-primary-500">{row.label}</span>
                                                    {row.badge
                                                        ? <span className={`text-xs px-2 py-0.5 rounded font-bold ${zoneClassBadge[s.zone.zonClassification]}`}>{row.value}</span>
                                                        : <span className={clsx('font-semibold', row.gold && 'text-amber-500')}>{row.value}</span>
                                                    }
                                                </div>
                                            ))}

                                            {/* Institutional pressure bar */}
                                            <div>
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-xs text-primary-500">Institutional Pressure</span>
                                                    <span className="text-xs font-bold" style={{ color: COLORS[i] }}>
                                                        {s.zone.institutionalPressureIndex} / 100
                                                    </span>
                                                </div>
                                                <div className="h-1.5 bg-primary-100 dark:bg-primary-800 rounded-full">
                                                    <div className="h-full rounded-full transition-all duration-500"
                                                        style={{ width: `${s.zone.institutionalPressureIndex}%`, background: COLORS[i] }} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Capital Allocation Simulator — always visible at bottom of Step 3 */}
                        <AllocationPanel scores={scores} />

                        <div>
                            <button onClick={() => setStep(2)} className="btn btn-outline text-sm">
                                ← Modify Zone Selection
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
};

export default Comparison;
