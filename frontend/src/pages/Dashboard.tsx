import React from 'react';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import StatCard from '../components/dashboard/StatCard';
import { TrendingUp, Map, DollarSign, Activity, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock chart data (Phase 3 will eventually use real aggregation)
const CHART_DATA = [
    { p: 'Jan', douala: 88000, yaounde: 95000, listings: 120 },
    { p: 'Feb', douala: 89500, yaounde: 96000, listings: 135 },
    { p: 'Mar', douala: 91000, yaounde: 97500, listings: 140 },
    { p: 'Apr', douala: 92500, yaounde: 99000, listings: 155 },
    { p: 'May', douala: 95000, yaounde: 102000, listings: 180 },
    { p: 'Jun', douala: 97500, yaounde: 104000, listings: 210 },
    { p: 'Jul', douala: 97632, yaounde: 108000, listings: 250 },
];

const Dashboard: React.FC = () => {
    return (
        <AuthenticatedLayout>
            <div className="p-8 max-w-7xl mx-auto space-y-8">
                {/* Welcome Section */}
                <div className="flex justify-between items-center bg-gradient-to-r from-primary-900 to-primary-800 p-8 rounded-2xl text-white shadow-xl">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Market Intelligence Dashboard</h1>
                        <p className="text-primary-200">
                            Real-time insights for Douala & Yaoundé real estate markets.
                        </p>
                    </div>
                    <div className="text-right hidden md:block">
                        <div className="text-sm text-primary-300 uppercase tracking-widest mb-1">Market Status</div>
                        <div className="flex items-center justify-end space-x-2">
                            <span className="w-2.5 h-2.5 bg-semantic-success rounded-full animate-pulse"></span>
                            <span className="font-bold text-semantic-success">ACTIVE</span>
                        </div>
                        <div className="text-xs text-primary-400 mt-1">Last update: Today, 06:30 AM</div>
                    </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        label="Avg Land Price (Douala)"
                        value="97,500 FCFA/m²"
                        change="+12.3%"
                        trend="up"
                        period="last year"
                        icon={TrendingUp}
                    />
                    <StatCard
                        label="Avg Land Price (Yaoundé)"
                        value="108,000 FCFA/m²"
                        change="+8.1%"
                        trend="up"
                        period="last year"
                        icon={TrendingUp}
                    />
                    <StatCard
                        label="Rental Yield (Prime)"
                        value="7.8%"
                        change="+0.5%"
                        trend="up"
                        period="last quarter"
                        icon={DollarSign}
                    />
                    <StatCard
                        label="Active Listings"
                        value="510"
                        change="+45"
                        trend="up"
                        period="last month"
                        icon={Activity}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Chart */}
                    <div className="lg:col-span-2 bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-primary-900 dark:text-white">Price Trend Analysis (2025)</h3>
                            <select className="input text-sm py-1 px-3 w-auto bg-transparent border-primary-200">
                                <option>Last 6 Months</option>
                                <option>Last Year</option>
                                <option>All Time</option>
                            </select>
                        </div>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={CHART_DATA}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                                    <XAxis dataKey="p" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} dy={10} />
                                    <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} hide />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                    <Bar yAxisId="right" dataKey="listings" name="Volume" barSize={20} fill="#E5E7EB" radius={[4, 4, 0, 0]} />
                                    <Line yAxisId="left" type="monotone" dataKey="douala" name="Douala Avg Price" stroke="#D4AF37" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                    <Line yAxisId="left" type="monotone" dataKey="yaounde" name="Yaoundé Avg Price" stroke="#374151" strokeWidth={3} dot={{ fill: '#374151' }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Quick Actions / Alerts */}
                    <div className="space-y-6">
                        {/* Action Card */}
                        <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm">
                            <h3 className="font-bold text-lg text-primary-900 dark:text-white mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <Link to="/maps" className="btn btn-primary w-full justify-between flex items-center">
                                    <span>Explore Interactive Map</span>
                                    <Map className="w-4 h-4" />
                                </Link>
                                <Link to="/land-intelligence" className="btn btn-outline w-full justify-between flex items-center">
                                    <span>View Land Prices</span>
                                    <Activity className="w-4 h-4" />
                                </Link>
                                <Link to="/rent-intelligence" className="btn btn-outline w-full justify-between flex items-center">
                                    <span>View Rental Data</span>
                                    <DollarSign className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>

                        {/* Smart Alerts */}
                        <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm">
                            <h3 className="font-bold text-lg text-primary-900 dark:text-white mb-4 flex items-center">
                                <AlertCircle className="w-5 h-5 text-accent-gold mr-2" />
                                Smart Alerts
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-start p-3 bg-accent-gold/5 rounded-lg border border-accent-gold/10">
                                    <div className="w-2 h-2 bg-accent-gold rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                    <div>
                                        <h4 className="text-sm font-bold text-primary-900 dark:text-white">Bonapriso Price Spike</h4>
                                        <p className="text-xs text-primary-500 mt-1">Land prices increased by 5% in the last 30 days due to low supply.</p>
                                    </div>
                                </div>
                                <div className="flex items-start p-3 bg-semantic-success/5 rounded-lg border border-semantic-success/10">
                                    <div className="w-2 h-2 bg-semantic-success rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                    <div>
                                        <h4 className="text-sm font-bold text-primary-900 dark:text-white">New High-Confidence Data</h4>
                                        <p className="text-xs text-primary-500 mt-1">Added 45 verified listings for Yaoundé Bastos.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default Dashboard;
