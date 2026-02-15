import React from 'react';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import StatCard from '../components/dashboard/StatCard';
import { TrendingUp, Map, DollarSign, Activity, AlertCircle, Lock, Crown, Users, Settings, Database, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../contexts/AuthContext';

// Mock chart data
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
    const { user } = useAuth();
    const userRole = user?.role || 'FREE_USER';

    // Role-based welcome message
    const getWelcomeMessage = () => {
        switch (userRole) {
            case 'ADMIN':
                return {
                    title: 'Admin Control Center',
                    subtitle: 'System administration and user management'
                };
            case 'PAID_USER':
            case 'INSTITUTIONAL':
                return {
                    title: 'Premium Market Intelligence Dashboard',
                    subtitle: 'Full access to real-time insights for Douala & Yaoundé markets'
                };
            default:
                return {
                    title: 'Market Intelligence Dashboard',
                    subtitle: 'Limited access - Upgrade for full market insights'
                };
        }
    };

    const welcome = getWelcomeMessage();

    return (
        <AuthenticatedLayout>
            <div className="p-8 max-w-7xl mx-auto space-y-8">
                {/* Welcome Section - Role Based */}
                <div className="flex justify-between items-center bg-gradient-to-r from-primary-900 to-primary-800 p-8 rounded-2xl text-white shadow-xl">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold">{welcome.title}</h1>
                            {userRole === 'ADMIN' && <Shield className="w-8 h-8 text-accent-gold" />}
                            {(userRole === 'PAID_USER' || userRole === 'INSTITUTIONAL') && <Crown className="w-8 h-8 text-accent-gold" />}
                        </div>
                        <p className="text-primary-200">{welcome.subtitle}</p>
                        {user && (
                            <p className="text-primary-300 text-sm mt-2">
                                Welcome back, {user.first_name || user.email} •
                                <span className="ml-2 px-2 py-0.5 bg-primary-700 rounded text-xs font-semibold">
                                    {userRole.replace('_', ' ')}
                                </span>
                            </p>
                        )}
                    </div>
                    <div className="text-right hidden md:block">
                        <div className="text-sm text-primary-300 uppercase tracking-widest mb-1">
                            {userRole === 'ADMIN' ? 'System Status' : 'Market Status'}
                        </div>
                        <div className="flex items-center justify-end space-x-2">
                            <span className="w-2.5 h-2.5 bg-semantic-success rounded-full animate-pulse"></span>
                            <span className="font-bold text-semantic-success">ACTIVE</span>
                        </div>
                        <div className="text-xs text-primary-400 mt-1">Last update: Today, 06:30 AM</div>
                    </div>
                </div>

                {/* ADMIN DASHBOARD */}
                {userRole === 'ADMIN' && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                label="Total Users"
                                value="1,247"
                                change="+23"
                                trend="up"
                                period="this month"
                                icon={Users}
                            />
                            <StatCard
                                label="Active Sessions"
                                value="342"
                                change="+12"
                                trend="up"
                                period="currently"
                                icon={Activity}
                            />
                            <StatCard
                                label="Database Size"
                                value="2.4 GB"
                                change="+150 MB"
                                trend="up"
                                period="this week"
                                icon={Database}
                            />
                            <StatCard
                                label="System Health"
                                value="98.5%"
                                change="+1.2%"
                                trend="up"
                                period="uptime"
                                icon={Settings}
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm">
                                <h3 className="font-bold text-lg text-primary-900 dark:text-white mb-4 flex items-center">
                                    <Settings className="w-5 h-5 mr-2 text-accent-gold" />
                                    Admin Actions
                                </h3>
                                <div className="space-y-3">
                                    <Link to="/admin" className="btn btn-primary w-full justify-between flex items-center">
                                        <span>User Management</span>
                                        <Users className="w-4 h-4" />
                                    </Link>
                                    <Link to="/admin" className="btn btn-outline w-full justify-between flex items-center">
                                        <span>System Settings</span>
                                        <Settings className="w-4 h-4" />
                                    </Link>
                                    <Link to="/admin" className="btn btn-outline w-full justify-between flex items-center">
                                        <span>Data Management</span>
                                        <Database className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm">
                                <h3 className="font-bold text-lg text-primary-900 dark:text-white mb-4 flex items-center">
                                    <AlertCircle className="w-5 h-5 text-accent-gold mr-2" />
                                    System Alerts
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-start p-3 bg-semantic-success/5 rounded-lg border border-semantic-success/10">
                                        <div className="w-2 h-2 bg-semantic-success rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                        <div>
                                            <h4 className="text-sm font-bold text-primary-900 dark:text-white">System Update</h4>
                                            <p className="text-xs text-primary-500 mt-1">All systems operational. Database backup completed.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start p-3 bg-accent-gold/5 rounded-lg border border-accent-gold/10">
                                        <div className="w-2 h-2 bg-accent-gold rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                        <div>
                                            <h4 className="text-sm font-bold text-primary-900 dark:text-white">New User Registrations</h4>
                                            <p className="text-xs text-primary-500 mt-1">23 new users registered in the last 24 hours.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* PAID USER DASHBOARD */}
                {(userRole === 'PAID_USER' || userRole === 'INSTITUTIONAL') && (
                    <>
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

                            <div className="space-y-6">
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
                    </>
                )}

                {/* FREE USER DASHBOARD */}
                {userRole === 'FREE_USER' && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                label="Avg Land Price (Douala)"
                                value="97,500 FCFA/m²"
                                change="+12.3%"
                                trend="up"
                                period="last year"
                                icon={TrendingUp}
                            />
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary-100 dark:bg-primary-800 bg-opacity-80 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
                                    <Lock className="w-8 h-8 text-primary-400" />
                                </div>
                                <StatCard
                                    label="Avg Land Price (Yaoundé)"
                                    value="•••••"
                                    change="Locked"
                                    trend="up"
                                    period="upgrade to view"
                                    icon={TrendingUp}
                                />
                            </div>
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary-100 dark:bg-primary-800 bg-opacity-80 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
                                    <Lock className="w-8 h-8 text-primary-400" />
                                </div>
                                <StatCard
                                    label="Rental Yield (Prime)"
                                    value="•••"
                                    change="Locked"
                                    trend="up"
                                    period="upgrade to view"
                                    icon={DollarSign}
                                />
                            </div>
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary-100 dark:bg-primary-800 bg-opacity-80 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
                                    <Lock className="w-8 h-8 text-primary-400" />
                                </div>
                                <StatCard
                                    label="Active Listings"
                                    value="•••"
                                    change="Locked"
                                    trend="up"
                                    period="upgrade to view"
                                    icon={Activity}
                                />
                            </div>
                        </div>

                        {/* Upgrade Prompt */}
                        <div className="bg-gradient-to-r from-accent-gold to-primary-700 p-8 rounded-2xl text-white shadow-xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold mb-2 flex items-center">
                                        <Crown className="w-6 h-6 mr-2" />
                                        Unlock Premium Features
                                    </h2>
                                    <p className="text-primary-100 mb-4">
                                        Get full access to market analytics, interactive maps, and advanced insights
                                    </p>
                                    <Link to="/pricing" className="btn bg-white text-primary-900 hover:bg-primary-50">
                                        Upgrade Now
                                    </Link>
                                </div>
                                <div className="hidden md:block text-right">
                                    <div className="text-4xl font-bold mb-1">$49</div>
                                    <div className="text-sm text-primary-200">per month</div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm">
                                <h3 className="font-bold text-lg text-primary-900 dark:text-white mb-4">Limited Preview</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-800 rounded-lg">
                                        <span className="text-sm">Interactive Maps</span>
                                        <Lock className="w-4 h-4 text-primary-400" />
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-800 rounded-lg">
                                        <span className="text-sm">Full Price Data</span>
                                        <Lock className="w-4 h-4 text-primary-400" />
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-800 rounded-lg">
                                        <span className="text-sm">Rental Intelligence</span>
                                        <Lock className="w-4 h-4 text-primary-400" />
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-800 rounded-lg">
                                        <span className="text-sm">Time Series Analysis</span>
                                        <Lock className="w-4 h-4 text-primary-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm">
                                <h3 className="font-bold text-lg text-primary-900 dark:text-white mb-4">Available Resources</h3>
                                <div className="space-y-3">
                                    <Link to="/methodology" className="btn btn-outline w-full justify-start flex items-center">
                                        <span>View Methodology</span>
                                    </Link>
                                    <Link to="/blog" className="btn btn-outline w-full justify-start flex items-center">
                                        <span>Read Market Articles</span>
                                    </Link>
                                    <Link to="/pricing" className="btn btn-primary w-full justify-start flex items-center">
                                        <Crown className="w-4 h-4 mr-2" />
                                        <span>See Pricing Plans</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AuthenticatedLayout>
    );
};

export default Dashboard;
