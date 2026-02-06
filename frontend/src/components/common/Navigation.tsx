import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    LayoutDashboard,
    Map,
    TrendingUp,
    Home,
    LineChart,
    Lightbulb,
    Shield,
    Star,
    GitCompare,
    Calculator,
    Bell,
    Download,
    Settings,
} from 'lucide-react';
import clsx from 'clsx';

interface NavItem {
    name: string;
    href: string;
    icon: React.ElementType;
    requiredRole?: 'FREE_USER' | 'PAID_USER' | 'ADMIN';
}

const Navigation: React.FC = () => {
    const { user } = useAuth();
    const location = useLocation();

    const navItems: NavItem[] = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Interactive Maps', href: '/maps', icon: Map },
        { name: 'Land Intelligence', href: '/land-intelligence', icon: Home },
        { name: 'Rent Intelligence', href: '/rent-intelligence', icon: TrendingUp },
        { name: 'Time Series', href: '/time-series', icon: LineChart },
        { name: 'Smart Insights', href: '/insights', icon: Lightbulb, requiredRole: 'PAID_USER' },
        { name: 'Data Quality', href: '/data-quality', icon: Shield },
        { name: 'Watchlists', href: '/watchlists', icon: Star, requiredRole: 'PAID_USER' },
        { name: 'Comparison', href: '/comparison', icon: GitCompare },
        { name: 'Scenario Tool', href: '/scenario', icon: Calculator, requiredRole: 'PAID_USER' },
        { name: 'Alerts', href: '/alerts', icon: Bell, requiredRole: 'PAID_USER' },
        { name: 'Export', href: '/export', icon: Download, requiredRole: 'PAID_USER' },
    ];

    // Add admin link if user is admin
    if (user?.role === 'ADMIN') {
        navItems.push({ name: 'Admin Panel', href: '/admin', icon: Settings, requiredRole: 'ADMIN' });
    }

    const isActive = (path: string) => location.pathname === path;

    const canAccess = (item: NavItem): boolean => {
        if (!item.requiredRole) return true;
        if (!user) return false;

        const roleHierarchy = {
            FREE_USER: 1,
            PAID_USER: 2,
            ADMIN: 3,
        };

        return roleHierarchy[user.role] >= roleHierarchy[item.requiredRole];
    };

    return (
        <nav className="w-64 bg-white dark:bg-primary-900 border-r border-primary-200 dark:border-primary-800 h-full overflow-y-auto">
            <div className="p-4">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-primary-500 dark:text-primary-400 mb-4">
                    Intelligence Navigation
                </h2>
                <ul className="space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const accessible = canAccess(item);
                        const active = isActive(item.href);

                        return (
                            <li key={item.href}>
                                <Link
                                    to={accessible ? item.href : '#'}
                                    className={clsx(
                                        'flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200',
                                        active
                                            ? 'bg-accent-gold/10 text-accent-gold font-medium'
                                            : accessible
                                                ? 'text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-800'
                                                : 'text-primary-400 dark:text-primary-600 cursor-not-allowed opacity-50'
                                    )}
                                    onClick={(e) => {
                                        if (!accessible) e.preventDefault();
                                    }}
                                >
                                    <Icon className="w-5 h-5 flex-shrink-0" />
                                    <span className="text-sm">{item.name}</span>
                                    {!accessible && (
                                        <span className="ml-auto text-xs px-2 py-0.5 bg-accent-gold/20 text-accent-gold rounded">
                                            Pro
                                        </span>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </nav>
    );
};

export default Navigation;
