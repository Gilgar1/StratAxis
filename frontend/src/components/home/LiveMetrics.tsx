import React from 'react';
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const LiveMetrics: React.FC = () => {
    const metrics = [
        {
            label: "Avg Land Price (Douala)",
            value: "97,500 XAF/m²",
            change: "+4.2%",
            trend: "up",
            period: "Last 30 days"
        },
        {
            label: "Avg Land Price (Yaoundé)",
            value: "108,000 XAF/m²",
            change: "+2.8%",
            trend: "up",
            period: "Last 30 days"
        },
        {
            label: "Rent Growth Indicator",
            value: "High Demand",
            change: "+5.1%",
            trend: "up",
            period: "YoY Forecast"
        },
        {
            label: "Data Freshness",
            value: "Live",
            change: "Updated today",
            trend: "neutral",
            period: "Real-time"
        }
    ];

    return (
        <section className="py-8 bg-primary-50 dark:bg-primary-900/50 border-y border-primary-200 dark:border-primary-800">
            <div className="container-custom">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {metrics.map((metric, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="group flex flex-col p-4 bg-white dark:bg-primary-950 rounded-xl border border-primary-100 dark:border-primary-800 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-sm font-medium text-primary-500 dark:text-primary-400">{metric.label}</span>
                                {metric.trend === 'up' ? (
                                    <span className="p-1 rounded bg-semantic-success/10 text-semantic-success">
                                        <ArrowUpRight className="w-4 h-4" />
                                    </span>
                                ) : metric.trend === 'down' ? (
                                    <span className="p-1 rounded bg-semantic-error/10 text-semantic-error">
                                        <ArrowDownRight className="w-4 h-4" />
                                    </span>
                                ) : (
                                    <span className="p-1 rounded bg-accent-gold/10 text-accent-gold">
                                        <Activity className="w-4 h-4" />
                                    </span>
                                )}
                            </div>
                            <div className="text-xl md:text-2xl font-bold text-primary-900 dark:text-white mb-1">
                                {metric.value}
                            </div>
                            <div className="flex items-center text-xs space-x-2">
                                <span className={metric.trend === 'up' ? 'text-semantic-success font-medium' : metric.trend === 'down' ? 'text-semantic-error font-medium' : 'text-primary-500'}>
                                    {metric.change}
                                </span>
                                <span className="text-primary-400">• {metric.period}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default LiveMetrics;
