import React, { useState } from 'react';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import {
    AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
    TrendingUp, TrendingDown, Activity, Landmark,
    Construction, Lightbulb, MapPin, Ship, Building2, GraduationCap,
    ArrowUpRight, AlertTriangle, ChevronRight
} from 'lucide-react';
import { useMetrics } from '../contexts/MetricsContext';

const clsx = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

type ProjectStatus = 'Ongoing' | 'Planned' | 'Near Completion';
interface InfraProject {
    name: string; city: string; location: string; type: string;
    icon: React.ElementType; status: ProjectStatus;
    impact: 'High' | 'Medium' | 'Low'; landEffect: string; investorAction: string;
}

const PROJECTS: InfraProject[] = [
    { name: 'Yaoundé–Nsimalen Highway Extension', city: 'Yaoundé', location: 'Nsimalen Corridor (South)', type: 'Major Road', icon: MapPin, status: 'Ongoing', impact: 'High', landEffect: 'Land prices within 5km of the corridor have risen 28–40% since construction started. Agricultural parcels in Nkolfoulou and Bikok are being rezoned for mixed-use residential.', investorAction: 'Acquire raw land along the corridor before completion. Target parcels within 2km of planned interchanges. Expect 15–25% additional appreciation post-completion.' },
    { name: 'Douala Grand Mall & Business Park', city: 'Douala', location: 'Bonamoussadi / Kotto', type: 'Commercial Complex', icon: Building2, status: 'Near Completion', impact: 'High', landEffect: 'Commercial rental rates in the Bonamoussadi zone have increased 18% since anchor tenant announcements. Residential demand for surrounding neighborhoods (Makepe, Kotto) is spiking.', investorAction: 'Invest in multi-unit residential or co-living projects within 3km radius. Short-term rental yields will benefit from increased workforce migration into the area.' },
    { name: 'Kribi Deep Seaport – Phase II', city: 'Kribi', location: 'Kribi Industrial Zone', type: 'Port / Logistics', icon: Ship, status: 'Ongoing', impact: 'High', landEffect: 'Industrial land in the Kribi–Lolabé corridor has appreciated 65% over 3 years. Warehousing and logistics zoning is being fast-tracked by the government.', investorAction: 'Focus on logistics-zoned land in the Dibamba–Kribi corridor. Land banking play with 5-7 year horizon. Avoid residential projects here — this is an industrial growth zone.' },
    { name: 'Ring Road Rehabilitation (Douala)', city: 'Douala', location: 'PK14 – Yassa – Japoma', type: 'Urban Road', icon: Construction, status: 'Ongoing', impact: 'Medium', landEffect: 'Previously neglected neighborhoods along PK14 and Yassa are seeing 12–20% price increases as accessibility improves. New subdivisions are emerging.', investorAction: 'Entry-level residential development. Build affordable rental units targeting middle-income workers. Low land cost + improving infrastructure = strong cash-on-cash returns.' },
    { name: 'University of Douala – Logbessou Campus', city: 'Douala', location: 'Logbessou / PK17', type: 'Education / Institutional', icon: GraduationCap, status: 'Planned', impact: 'Medium', landEffect: 'Student housing demand in the Logbessou area is projected to increase by 40% within 3 years of campus activation. Land prices currently remain undervalued.', investorAction: 'Build student-oriented micro-apartments (studios, 1BR). Target >9% gross yield. Secure land at current prices before construction begins.' },
    { name: 'Yaoundé Eastern Bypass', city: 'Yaoundé', location: 'Mfou – Soa – Nkol-Afamba', type: 'Major Road', icon: MapPin, status: 'Planned', impact: 'High', landEffect: 'Speculative land purchases along the proposed bypass route have already started. Prices in Soa and Nkol-Afamba are up 15% on rumor alone.', investorAction: 'High-risk, high-reward land banking. Only invest if you can confirm the route alignment from official planning documents.' },
    { name: 'Douala Port Modernization', city: 'Douala', location: 'Bonabéri / Wouri Bridge Zone', type: 'Port Infrastructure', icon: Ship, status: 'Ongoing', impact: 'Medium', landEffect: 'Commercial property in the Bonabéri corridor is appreciating steadily at ~8%/yr. Congestion improvements are making the zone more viable for mid-tier commercial tenants.', investorAction: 'Commercial property investment: warehouses, small retail. Strong demand from import/export businesses. Also consider Bonabéri residential for port workers.' },
    { name: 'Olembé Sports Complex Expansion', city: 'Yaoundé', location: 'Olembé / Nkolbisson', type: 'Sports / Mixed-Use', icon: Building2, status: 'Near Completion', impact: 'Low', landEffect: 'Post-AFCON, the area has matured. Prices have already adjusted upward by ~22%. Remaining upside is limited to supplementary commercial development.', investorAction: 'Only invest here for hospitality or F&B purposes. Residential is already priced in. Better opportunities exist in emerging corridors.' },
];

const statusColors: Record<ProjectStatus, string> = {
    'Ongoing': 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
    'Planned': 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    'Near Completion': 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
};
const impactColors: Record<string, string> = {
    High: 'bg-red-500/15 text-red-600 dark:text-red-400',
    Medium: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    Low: 'bg-primary-500/15 text-primary-600 dark:text-primary-400',
};

const MetricCard: React.FC<{ label: string; value: string; change?: number; sublabel?: string; color?: string }> =
    ({ label, value, change, sublabel, color = 'text-primary-900 dark:text-white' }) => (
        <div className="bg-white dark:bg-primary-900 p-5 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm">
            <p className="text-xs font-semibold text-primary-500 dark:text-primary-400 uppercase tracking-wider mb-2">{label}</p>
            <div className="flex items-end gap-3">
                <span className={clsx('text-3xl font-bold', color)}>{value}</span>
                {change !== undefined && (
                    <span className={clsx('flex items-center gap-0.5 text-sm font-bold pb-1', change > 0 ? 'text-red-500' : change < 0 ? 'text-emerald-500' : 'text-primary-400')}>
                        {change > 0 ? <TrendingUp className="w-4 h-4" /> : change < 0 ? <TrendingDown className="w-4 h-4" /> : null}
                        {change > 0 ? '+' : ''}{change.toFixed(2)}%
                    </span>
                )}
            </div>
            {sublabel && <p className="text-xs text-primary-400 mt-2">{sublabel}</p>}
        </div>
    );

const Economics: React.FC = () => {
    const { economics } = useMetrics();
    const { current, interestHistory, inflationHistory } = economics;
    const [activeSection, setActiveSection] = useState<'macro' | 'infra'>('macro');
    const [expandedProject, setExpandedProject] = useState<string | null>(null);

    return (
        <AuthenticatedLayout>
            <div className="p-8 max-w-7xl mx-auto space-y-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Activity className="w-5 h-5 text-accent-gold" />
                        <span className="text-xs font-bold text-accent-gold uppercase tracking-widest">Macroeconomic Intelligence</span>
                    </div>
                    <h1 className="text-3xl font-bold text-primary-900 dark:text-white">Economics</h1>
                    <p className="text-sm text-primary-500 dark:text-primary-400 mt-1">Interest rates, inflation trends, and infrastructure developments shaping Cameroon's real estate market.</p>
                </div>

                {/* Section Toggle */}
                <div className="flex gap-2 bg-primary-50 dark:bg-primary-800/30 p-1.5 rounded-xl border border-primary-200 dark:border-primary-800 w-fit">
                    {[{ id: 'macro', label: 'Rates & Inflation', icon: Landmark }, { id: 'infra', label: 'Infrastructure Impact', icon: Construction }].map(t => (
                        <button key={t.id} onClick={() => setActiveSection(t.id as any)}
                            className={clsx('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
                                activeSection === t.id ? 'bg-white dark:bg-primary-900 text-primary-900 dark:text-white shadow-sm' : 'text-primary-500 hover:text-primary-700 dark:hover:text-primary-300')}>
                            <t.icon className="w-4 h-4" />{t.label}
                        </button>
                    ))}
                </div>

                {/* ═══ MACRO SECTION ═══ */}
                {activeSection === 'macro' && (
                    <div className="space-y-8">
                        {/* Hero metrics — read from MetricsContext */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <MetricCard label="BEAC Policy Rate" value={`${current.beacRate}%`} change={current.beacChange} sublabel="Bank of Central African States" color="text-blue-600 dark:text-blue-400" />
                            <MetricCard label="Avg Mortgage Rate · Douala" value={`${current.avgMortgageDouala}%`} sublabel="Commercial bank average (10-20yr term)" color="text-amber-600 dark:text-amber-400" />
                            <MetricCard label="Inflation · Douala" value={`${current.inflationDouala}%`} change={-0.7} sublabel="YoY consumer price index" color="text-red-500" />
                            <MetricCard label="Inflation · Yaoundé" value={`${current.inflationYaounde}%`} change={-0.5} sublabel="YoY consumer price index" color="text-purple-500" />
                        </div>

                        {/* Interest Rate Chart */}
                        <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm">
                            <h3 className="font-bold text-lg text-primary-900 dark:text-white mb-1">Interest Rate Trends (2020–2025)</h3>
                            <p className="text-xs text-primary-500 mb-6">BEAC policy rate vs. commercial mortgage rates by city.</p>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={interestHistory} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                    <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                                    <YAxis unit="%" tick={{ fontSize: 12 }} domain={[0, 15]} />
                                    <Tooltip formatter={(v: number) => `${v}%`} />
                                    <Legend />
                                    <Line type="monotone" dataKey="beacRate" name="BEAC Policy Rate" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5 }} />
                                    <Line type="monotone" dataKey="doualaAvg" name="Douala Mortgage Avg" stroke="#D4AF37" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 4 }} />
                                    <Line type="monotone" dataKey="yaoundeAvg" name="Yaoundé Mortgage Avg" stroke="#a855f7" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Inflation Chart */}
                        <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm">
                            <h3 className="font-bold text-lg text-primary-900 dark:text-white mb-1">Inflation Rate History (2020–2025)</h3>
                            <p className="text-xs text-primary-500 mb-6">National, Douala, and Yaoundé CPI year-over-year.</p>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={inflationHistory} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                    <defs>
                                        <linearGradient id="inflNational" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="inflDouala" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                    <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                                    <YAxis unit="%" tick={{ fontSize: 12 }} domain={[0, 10]} />
                                    <Tooltip formatter={(v: number) => `${v}%`} />
                                    <Legend />
                                    <Area type="monotone" dataKey="national" name="National" stroke="#6366f1" strokeWidth={2.5} fill="url(#inflNational)" dot={{ r: 4 }} />
                                    <Area type="monotone" dataKey="douala" name="Douala" stroke="#ef4444" strokeWidth={2} fill="url(#inflDouala)" dot={{ r: 4 }} />
                                    <Area type="monotone" dataKey="yaounde" name="Yaoundé" stroke="#a855f7" strokeWidth={2} fill="transparent" strokeDasharray="5 3" dot={{ r: 4 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Investor Takeaway */}
                        <div className="bg-accent-gold/5 border border-accent-gold/30 rounded-xl p-6 relative overflow-hidden">
                            <div className="absolute -right-8 -bottom-8 opacity-5"><Lightbulb size={160} /></div>
                            <div className="flex items-start gap-4 relative z-10">
                                <div className="p-2 bg-accent-gold/15 rounded-lg flex-shrink-0">
                                    <Lightbulb className="w-6 h-6 text-accent-gold" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-primary-900 dark:text-white mb-2">StratAxis Investor Takeaway</h3>
                                    <p className="text-sm text-primary-700 dark:text-primary-300 leading-relaxed mb-4">
                                        With Douala inflation at <strong className="text-red-500">{current.inflationDouala}%</strong> and mortgage rates averaging <strong className="text-amber-600">{current.avgMortgageDouala}%</strong>,
                                        the real cost of capital is approximately <strong>{(current.avgMortgageDouala - current.inflationDouala).toFixed(1)}%</strong>. This means leveraged deals must
                                        generate at least ~<strong>{(current.avgMortgageDouala * 1.02).toFixed(1)}% gross yield</strong> to break even after debt service and inflation erosion.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div className="bg-white dark:bg-primary-900 p-3 rounded-lg border border-primary-200 dark:border-primary-700 text-sm">
                                            <strong className="block text-emerald-500 mb-1">Cash Buyers</strong>
                                            Property acts as a direct inflation hedge. All-cash acquisitions yielding 7%+ beat treasury bonds and protect purchasing power.
                                        </div>
                                        <div className="bg-white dark:bg-primary-900 p-3 rounded-lg border border-primary-200 dark:border-primary-700 text-sm">
                                            <strong className="block text-amber-500 mb-1">Leveraged Buyers</strong>
                                            Only proceed if projected net yield exceeds your blended cost of debt by at least 2%. High-equity (40%+ down) structures are optimal.
                                        </div>
                                        <div className="bg-white dark:bg-primary-900 p-3 rounded-lg border border-primary-200 dark:border-primary-700 text-sm">
                                            <strong className="block text-blue-500 mb-1">Land Speculators</strong>
                                            Land appreciation must outpace inflation + holding costs. Target corridors with confirmed infrastructure projects (see below).
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══ INFRA SECTION ═══ */}
                {activeSection === 'infra' && (
                    <div className="space-y-6">
                        <div className="flex items-start gap-3 mb-2">
                            <Construction className="w-6 h-6 text-accent-gold flex-shrink-0 mt-1" />
                            <div>
                                <h2 className="text-xl font-bold text-primary-900 dark:text-white">Infrastructure & Development Impact</h2>
                                <p className="text-sm text-primary-500">How current projects reshape land values — and what to do about it.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {PROJECTS.map(project => {
                                const Icon = project.icon;
                                const isExpanded = expandedProject === project.name;
                                return (
                                    <div key={project.name} className={clsx('bg-white dark:bg-primary-900 rounded-xl border shadow-sm transition-all duration-300 overflow-hidden', isExpanded ? 'border-accent-gold/50 shadow-md' : 'border-primary-200 dark:border-primary-800 hover:border-primary-300 dark:hover:border-primary-700')}>
                                        <div className="p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                                    <div className="p-2 bg-primary-100 dark:bg-primary-800 rounded-lg flex-shrink-0">
                                                        <Icon className="w-5 h-5 text-primary-600 dark:text-primary-300" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="font-bold text-primary-900 dark:text-white text-sm leading-tight">{project.name}</h3>
                                                        <p className="text-xs text-primary-500 mt-0.5">{project.city} — {project.location}</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1 items-end flex-shrink-0 ml-3">
                                                    <span className={clsx('text-xs font-bold px-2 py-0.5 rounded-full', statusColors[project.status])}>{project.status}</span>
                                                    <span className={clsx('text-xs font-bold px-2 py-0.5 rounded-full', impactColors[project.impact])}>{project.impact} Impact</span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-primary-600 dark:text-primary-300 leading-relaxed mb-4 line-clamp-2">{project.landEffect}</p>
                                            <button onClick={() => setExpandedProject(isExpanded ? null : project.name)} className="flex items-center gap-1 text-xs font-bold text-accent-gold hover:underline">
                                                {isExpanded ? 'Show less' : 'View investor action'}
                                                <ChevronRight className={clsx('w-3 h-3 transition-transform', isExpanded && 'rotate-90')} />
                                            </button>
                                        </div>
                                        <div className={clsx('overflow-hidden transition-all duration-300', isExpanded ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0')}>
                                            <div className="px-6 pb-6 pt-2 border-t border-primary-100 dark:border-primary-800">
                                                <div className="mb-4">
                                                    <h4 className="text-xs font-bold text-primary-500 uppercase tracking-wider mb-1">Land Price Impact</h4>
                                                    <p className="text-sm text-primary-700 dark:text-primary-200 leading-relaxed">{project.landEffect}</p>
                                                </div>
                                                <div className="bg-accent-gold/5 border border-accent-gold/20 rounded-lg p-4">
                                                    <div className="flex items-start gap-2">
                                                        <ArrowUpRight className="w-4 h-4 text-accent-gold flex-shrink-0 mt-0.5" />
                                                        <div>
                                                            <h4 className="text-xs font-bold text-accent-gold uppercase tracking-wider mb-1">How to Act</h4>
                                                            <p className="text-sm text-primary-800 dark:text-primary-200 leading-relaxed font-medium">{project.investorAction}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5 flex items-start gap-4">
                            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-bold text-red-700 dark:text-red-400 mb-1">Infrastructure Risk Warning</h3>
                                <p className="text-sm text-red-600/80 dark:text-red-300/80 leading-relaxed">Never buy land based on rumored projects. Verify all development plans through official sources before committing capital.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
};

export default Economics;
