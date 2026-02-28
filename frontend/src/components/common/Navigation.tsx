import React, { useState } from 'react';
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
    BarChart3,
    Maximize2,
    Percent,
    DollarSign,
    ClipboardList,
    Clock,
    Package,
    Building2,
    ChevronDown,
    ChevronRight,
    Landmark,
    Activity,
    Folder,
    PieChart,
    BarChart2,
    Briefcase
} from 'lucide-react';
import clsx from 'clsx';

interface NavItem {
    name: string;
    href: string;
    icon: React.ElementType;
    requiredRole?: 'FREE_USER' | 'PAID_USER' | 'ADMIN';
}

interface NavGroup {
    name: string;
    icon: React.ElementType;
    items: NavItem[];
}

interface NavigationProps {
    isOpen: boolean;
    closeSidebar: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ isOpen, closeSidebar }) => {
    const { user } = useAuth();
    const location = useLocation();

    // State to toggle accordions
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

    const toggleGroup = (name: string) => {
        setOpenGroups(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const topLevelItems: NavItem[] = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Interactive Maps', href: '/maps', icon: Map },
        { name: 'Smart Insights', href: '/insights', icon: Lightbulb, requiredRole: 'PAID_USER' },
    ];

    const groupedItems: NavGroup[] = [
        {
            name: 'Core Intelligence',
            icon: Folder,
            items: [
                { name: 'Land Intelligence', href: '/land-intelligence', icon: Home },
                { name: 'Rent Intelligence', href: '/rent-intelligence', icon: TrendingUp },
                { name: 'Time Series', href: '/time-series', icon: LineChart },
            ]
        },
        {
            name: 'Market Metrics',
            icon: BarChart2,
            items: [
                { name: 'Median Property Price', href: '/median-property-price', icon: TrendingUp },
                { name: 'Average Property Price', href: '/average-property-price', icon: BarChart3 },
                { name: 'Price per Square Meter', href: '/price-per-sqm', icon: Maximize2 },
                { name: 'Annual Appreciation', href: '/annual-appreciation', icon: LineChart },
                { name: 'Average Rent', href: '/average-rent', icon: Home },
                { name: 'Basic Rental Yield', href: '/basic-rental-yield', icon: Percent },
            ]
        },
        {
            name: 'Advanced Analytics',
            icon: PieChart,
            items: [
                { name: 'Neighborhood Rental Yield', href: '/neighborhood-rental-yield', icon: Percent, requiredRole: 'PAID_USER' },
                { name: 'Vacancy Rate', href: '/vacancy-rate', icon: Home, requiredRole: 'PAID_USER' },
                { name: 'Inventory', href: '/inventory', icon: Package, requiredRole: 'PAID_USER' },
                { name: 'Days on Market', href: '/days-on-market', icon: Clock, requiredRole: 'PAID_USER' },
                { name: 'Construction & Permit Volume', href: '/construction-permit-volume', icon: Building2, requiredRole: 'PAID_USER' },
            ]
        },
        {
            name: 'Financing',
            icon: Landmark,
            items: [
                { name: 'Economics', href: '/economics', icon: Activity },
                { name: 'Getting Funded', href: '/getting-funded', icon: DollarSign },
            ]
        },
        {
            name: 'Tools & Resources',
            icon: Briefcase,
            items: [
                { name: 'Comparison', href: '/comparison', icon: GitCompare },
                { name: 'Yield Estimator', href: '/yield-estimator', icon: Calculator, requiredRole: 'PAID_USER' },
                { name: 'Project Process', href: '/project-process', icon: ClipboardList },
            ]
        },
        {
            name: 'Management',
            icon: Settings,
            items: [
                { name: 'Watchlists', href: '/watchlists', icon: Star, requiredRole: 'PAID_USER' },
                { name: 'Alerts', href: '/alerts', icon: Bell, requiredRole: 'PAID_USER' },
                { name: 'Data Quality', href: '/data-quality', icon: Shield },
                { name: 'Export', href: '/export', icon: Download, requiredRole: 'PAID_USER' },
            ]
        }
    ];

    if (user?.role === 'ADMIN') {
        const mgmtGroup = groupedItems.find(g => g.name === 'Management');
        if (mgmtGroup) {
            mgmtGroup.items.push({ name: 'Admin Panel', href: '/admin', icon: Settings, requiredRole: 'ADMIN' });
        }
    }

    const isActive = (path: string) => location.pathname === path;

    const canAccess = (item: NavItem): boolean => {
        if (!item.requiredRole) return true;
        if (!user) return false;

        const roleHierarchy: Record<string, number> = {
            FREE_USER: 1,
            PAID_USER: 2,
            INSTITUTIONAL: 2,
            ADMIN: 3,
        };

        return roleHierarchy[user.role] >= roleHierarchy[item.requiredRole];
    };

    const renderNavItem = (item: NavItem, isNested: boolean = false) => {
        const Icon = item.icon;
        const accessible = canAccess(item);
        const active = isActive(item.href);

        return (
            <li key={item.href}>
                <Link
                    to={accessible ? item.href : '#'}
                    className={clsx(
                        'flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200',
                        active
                            ? 'bg-accent-gold/10 text-accent-gold font-medium'
                            : accessible
                                ? 'text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-800'
                                : 'text-primary-400 dark:text-primary-600 cursor-not-allowed opacity-50',
                        isNested ? 'text-[13px] pl-10' : 'text-sm'
                    )}
                    onClick={(e) => {
                        if (!accessible) {
                            e.preventDefault();
                        } else {
                            closeSidebar();
                        }
                    }}
                >
                    <div className="flex items-center space-x-3">
                        <Icon className={clsx("flex-shrink-0", isNested ? "w-4 h-4" : "w-5 h-5")} />
                        <span>{item.name}</span>
                    </div>
                    {!accessible && (
                        <span className="text-[10px] uppercase font-bold tracking-wide px-1.5 py-0.5 bg-accent-gold/20 text-accent-gold rounded">
                            Pro
                        </span>
                    )}
                </Link>
            </li>
        );
    };

    return (
        <>
            {/* Mobile backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-primary-900/50 backdrop-blur-sm z-30 md:hidden"
                    onClick={closeSidebar}
                ></div>
            )}

            {/* Sidebar */}
            <nav className={clsx(
                "fixed inset-y-0 left-0 top-[64px] z-40 w-64 bg-white dark:bg-primary-900 border-r border-primary-200 dark:border-primary-800 overflow-y-auto transition-transform duration-300 ease-in-out md:relative md:top-0 md:translate-x-0 h-[calc(100vh-64px)] md:h-full hide-scrollbar",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-4 flex flex-col pt-6">
                    <h2 className="text-[11px] font-bold uppercase tracking-widest text-primary-400 dark:text-primary-500 mb-4 px-3">
                        Main Menu
                    </h2>

                    {/* Top Level Items */}
                    <ul className="space-y-1 mb-8">
                        {topLevelItems.map((item) => renderNavItem(item))}
                    </ul>

                    <h2 className="text-[11px] font-bold uppercase tracking-widest text-primary-400 dark:text-primary-500 mb-3 px-3">
                        Categories
                    </h2>

                    {/* Grouped Accordions */}
                    <div className="space-y-2 pb-10">
                        {groupedItems.map((group) => {
                            const GroupIcon = group.icon;
                            const isExpanded = openGroups[group.name];

                            // Check if any child item is active so we can highlight the parent group
                            const hasActiveChild = group.items.some(item => isActive(item.href));

                            return (
                                <div key={group.name} className="space-y-1">
                                    <button
                                        onClick={() => toggleGroup(group.name)}
                                        className={clsx(
                                            "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                                            hasActiveChild && !isExpanded
                                                ? "text-accent-gold bg-accent-gold/5"
                                                : "text-primary-800 dark:text-primary-100 hover:bg-primary-100 dark:hover:bg-primary-800"
                                        )}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <GroupIcon className="w-5 h-5 flex-shrink-0 opacity-80" />
                                            <span>{group.name}</span>
                                        </div>
                                        {isExpanded ? (
                                            <ChevronDown className="w-4 h-4 opacity-50" />
                                        ) : (
                                            <ChevronRight className="w-4 h-4 opacity-50" />
                                        )}
                                    </button>

                                    {/* Collapsible Content */}
                                    <div
                                        className={clsx(
                                            "overflow-hidden transition-all duration-300 ease-in-out",
                                            isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                                        )}
                                    >
                                        <ul className="space-y-1 pt-1">
                                            {group.items.map(item => renderNavItem(item, true))}
                                        </ul>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Navigation;
