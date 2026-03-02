import React from 'react';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import { Lightbulb, ArrowRight, TrendingUp, AlertTriangle, Activity } from 'lucide-react';
import { useMetrics } from '../contexts/MetricsContext';

const TYPE_CONFIG = {
    opportunity: { color: 'bg-emerald-500', label: 'OPPORTUNITY', icon: TrendingUp, badgeCls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', borderCls: 'border-l-emerald-500' },
    trend: { color: 'bg-blue-500', label: 'TREND', icon: Activity, badgeCls: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', borderCls: 'border-l-blue-500' },
    risk: { color: 'bg-red-500', label: 'RISK', icon: AlertTriangle, badgeCls: 'bg-red-500/10 text-red-600 dark:text-red-400', borderCls: 'border-l-red-500' },
};

const IMPACT_COLOR: Record<string, string> = {
    High: 'text-red-500',
    Medium: 'text-amber-500',
    Low: 'text-primary-400',
};

const Insights: React.FC = () => {
    const { smartInsights } = useMetrics();

    return (
        <AuthenticatedLayout>
            <div className="p-8 max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-accent-gold/10 rounded-lg">
                        <Lightbulb className="w-6 h-6 text-accent-gold" />
                    </div>
                    <h1 className="text-3xl font-bold text-primary-900 dark:text-white">Smart Insights</h1>
                </div>
                <p className="text-primary-600 dark:text-primary-400 mb-8 ml-11 max-w-2xl">
                    AI-generated analysis highlighting key market signals and investment opportunities.
                </p>

                {/* Summary strip */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {(['opportunity', 'trend', 'risk'] as const).map(type => {
                        const count = smartInsights.filter(s => s.type === type).length;
                        const cfg = TYPE_CONFIG[type];
                        const Icon = cfg.icon;
                        return (
                            <div key={type} className={`bg-white dark:bg-primary-900 p-4 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm flex items-center gap-3`}>
                                <div className={`p-2 rounded-lg ${cfg.badgeCls.replace('text-', 'bg-').split(' ')[0]}/10`}>
                                    <Icon className={`w-5 h-5 ${cfg.badgeCls.split(' ')[1]}`} />
                                </div>
                                <div>
                                    <p className="text-xs text-primary-400 uppercase font-bold">{type}</p>
                                    <p className="text-2xl font-bold text-primary-900 dark:text-white">{count}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Insight cards */}
                <div className="space-y-5">
                    {smartInsights.map(insight => {
                        const cfg = TYPE_CONFIG[insight.type];
                        return (
                            <div key={insight.id}
                                className={`bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 border-l-4 ${cfg.borderCls} shadow-sm hover:shadow-md transition-shadow relative overflow-hidden`}>
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center space-x-2">
                                        <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${cfg.badgeCls}`}>
                                            {cfg.label}
                                        </span>
                                        <span className="text-xs text-primary-400">{insight.date}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-primary-500">
                                        <span>Impact: <span className={`font-bold ${IMPACT_COLOR[insight.impact]}`}>{insight.impact}</span></span>
                                        <span className="text-primary-300 dark:text-primary-600">|</span>
                                        <span>Confidence: <span className="font-bold text-primary-700 dark:text-primary-200">{(insight.confidence * 100).toFixed(0)}%</span></span>
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-primary-900 dark:text-white mb-2">{insight.title}</h3>
                                <p className="text-primary-600 dark:text-primary-300 leading-relaxed mb-4">{insight.description}</p>

                                {/* Confidence bar */}
                                <div className="flex items-center gap-3 pt-4 border-t border-primary-100 dark:border-primary-800">
                                    <div className="flex-1 bg-primary-100 dark:bg-primary-800 rounded-full h-1.5 overflow-hidden">
                                        <div className="h-full rounded-full bg-accent-gold" style={{ width: `${insight.confidence * 100}%` }} />
                                    </div>
                                    <button className="text-sm font-medium text-accent-gold hover:text-accent-gold/80 flex items-center gap-1 transition-colors shrink-0">
                                        View Data Details <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {smartInsights.length === 0 && (
                        <div className="text-center py-16 text-primary-400">
                            <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="font-semibold">No insights available yet.</p>
                            <p className="text-sm mt-1">An admin can add insights from the Admin Panel → Metrics Editor.</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default Insights;
