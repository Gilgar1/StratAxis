import React from 'react';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import { Lightbulb, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Insights: React.FC = () => {
    // Mock insights engine output
    const insights = [
        {
            id: 1,
            type: 'opportunity',
            title: 'Undervalued Zone: Makepe',
            description: 'Makepe is trading at 52,900 XAF/m², which is 15% below the expected value given its rental yield potential. This suggests a strong buy opportunity.',
            impact: 'High',
            confidence: 0.85,
            date: '2 days ago'
        },
        {
            id: 2,
            type: 'trend',
            title: 'Rental Demand Shift',
            description: 'Search volume for "Studio" apartments in Youndé has increased by 40% month-over-month, outpacing 2-bedroom requests.',
            impact: 'Medium',
            confidence: 0.92,
            date: '1 week ago'
        },
        {
            id: 3,
            type: 'risk',
            title: 'Price Plateau in Bonanjo',
            description: 'Asking prices in Bonanjo have remained flat for 3 consecutive quarters, indicating a possible market ceiling has been reached.',
            impact: 'Medium',
            confidence: 0.78,
            date: '2 weeks ago'
        }
    ];

    return (
        <AuthenticatedLayout>
            <div className="p-8 max-w-5xl mx-auto">
                <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-accent-gold/10 rounded-lg">
                        <Lightbulb className="w-6 h-6 text-accent-gold" />
                    </div>
                    <h1 className="text-3xl font-bold text-primary-900 dark:text-white">Smart Insights</h1>
                </div>
                <p className="text-primary-600 dark:text-primary-400 mb-8 ml-11 max-w-2xl">
                    AI-generated analysis highlighting disparate market signals you might miss.
                </p>

                <div className="space-y-6">
                    {insights.map((insight) => (
                        <div key={insight.id} className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                            {/* Color Strip */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${insight.type === 'opportunity' ? 'bg-semantic-success' :
                                    insight.type === 'risk' ? 'bg-semantic-error' : 'bg-semantic-info'
                                }`}></div>

                            <div className="ml-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center space-x-2">
                                        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${insight.type === 'opportunity' ? 'bg-semantic-success/10 text-semantic-success' :
                                                insight.type === 'risk' ? 'bg-semantic-error/10 text-semantic-error' : 'bg-semantic-info/10 text-semantic-info'
                                            }`}>
                                            {insight.type}
                                        </span>
                                        <span className="text-xs text-primary-400">{insight.date}</span>
                                    </div>
                                    <span className="text-sm font-medium text-primary-500">
                                        Confidence: {(insight.confidence * 100).toFixed(0)}%
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-primary-900 dark:text-white mb-2">{insight.title}</h3>
                                <p className="text-primary-600 dark:text-primary-300 leading-relaxed mb-4">
                                    {insight.description}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-primary-100 dark:border-primary-800">
                                    <div className="flex items-center space-x-4 text-sm">
                                        <span className="text-primary-500">
                                            Impact: <span className="font-medium text-primary-900 dark:text-white">{insight.impact}</span>
                                        </span>
                                    </div>
                                    <button className="text-sm font-medium text-accent-gold hover:text-accent-gold-dark flex items-center">
                                        View Data Details <ArrowRight className="w-4 h-4 ml-1" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default Insights;
