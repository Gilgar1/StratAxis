import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import clsx from 'clsx';

interface StatCardProps {
    label: string;
    value: string;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
    period?: string;
    icon?: React.ElementType;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, change, trend, period, icon: Icon }) => {
    return (
        <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <span className="text-sm font-medium text-primary-500 dark:text-primary-400">{label}</span>
                {Icon && (
                    <div className="p-2 bg-primary-100 dark:bg-primary-800 rounded-lg">
                        <Icon className="w-5 h-5 text-primary-600 dark:text-primary-300" />
                    </div>
                )}
            </div>

            <div className="flex items-baseline mb-2">
                <h3 className="text-2xl font-bold text-primary-900 dark:text-white mr-3">{value}</h3>
            </div>

            {(change || period) && (
                <div className="flex items-center text-xs">
                    {change && (
                        <span
                            className={clsx(
                                'flex items-center font-medium mr-2 px-1.5 py-0.5 rounded',
                                trend === 'up' && 'text-semantic-success bg-semantic-success/10',
                                trend === 'down' && 'text-semantic-error bg-semantic-error/10',
                                trend === 'neutral' && 'text-primary-500 bg-primary-100 dark:bg-primary-800'
                            )}
                        >
                            {trend === 'up' && <ArrowUpRight className="w-3 h-3 mr-1" />}
                            {trend === 'down' && <ArrowDownRight className="w-3 h-3 mr-1" />}
                            {trend === 'neutral' && <Minus className="w-3 h-3 mr-1" />}
                            {change}
                        </span>
                    )}
                    {period && <span className="text-primary-400">vs {period}</span>}
                </div>
            )}
        </div>
    );
};

export default StatCard;
