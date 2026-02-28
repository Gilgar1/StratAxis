import React, { useState } from 'react';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import {
    Wallet, Landmark, Users, Phone, ChevronDown, ChevronRight,
    Clock, Percent, Home, Building2, GraduationCap, Briefcase,
    Shield, Banknote, HandCoins, Target, ArrowUpRight
} from 'lucide-react';

const clsx = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

const CONTACT = '67X XXX XXX';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LoanProduct {
    title: string;
    icon: React.ElementType;
    color: string;
    borderColor: string;
    maxLoan: string;
    term: string;
    interestRate: string;
    contribution: string;
    eligibleProjects: string[];
    bestFor: string;
    details?: { label: string; value: string }[];
    specialConditions?: string[];
}

// ─── Data: Personal Funds ─────────────────────────────────────────────────────

const PERSONAL_FUNDS = [
    {
        title: 'Youth Savings Plan',
        subtitle: 'Ages 1–35',
        icon: GraduationCap,
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500',
        stats: [
            { label: 'Savings Rate', value: '3.25% – 5%' },
            { label: 'Loan Access', value: 'Up to 50M XAF' },
            { label: 'Loan Rate', value: '4%' },
            { label: 'Term', value: 'Up to 30 Years' },
        ],
        useCase: 'Buying Land or Home',
        whyItMatters: [
            'Low interest access to capital',
            'Long repayment period',
            'Ideal for first-time investors',
        ],
        action: 'Build savings for 12–24 months before applying.',
    },
    {
        title: 'Standard Savings Plan',
        subtitle: 'All Ages',
        icon: Wallet,
        color: 'text-accent-gold',
        bgColor: 'bg-accent-gold/10',
        borderColor: 'border-accent-gold',
        stats: [
            { label: 'Savings Rate', value: '5%' },
            { label: 'Capital Access', value: 'Up to 3× balance' },
        ],
        useCase: 'Land purchase, Construction, Renovation',
        whyItMatters: [
            'Strong leverage on disciplined savers',
            'Flexible real estate funding',
        ],
        action: 'Maintain consistent deposits to increase borrowing capacity.',
    },
    {
        title: 'Legal Entity Savings',
        subtitle: 'Companies & Developers',
        icon: Building2,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500',
        stats: [
            { label: 'Savings Rate', value: '5%' },
            { label: 'Capital Access', value: 'Up to 3× balance' },
        ],
        useCase: 'Commercial projects, Residential developments, Renovations',
        whyItMatters: [
            'Structured funding for developers',
            'Supports scaling operations',
        ],
        action: 'Establish 6–12 months transaction history before requesting funding.',
    },
];

// ─── Data: Bank Financing ─────────────────────────────────────────────────────

const BANK_PRODUCTS: LoanProduct[] = [
    {
        title: 'Youth Classical Loan',
        icon: GraduationCap,
        color: 'text-emerald-500',
        borderColor: 'border-t-emerald-500',
        maxLoan: '50 Million XAF',
        term: 'Up to 30 Years',
        interestRate: '3.75% – 4%',
        contribution: '0% (lower salaries) / Variable',
        eligibleProjects: ['Plot purchase', 'Plot + construction', 'House construction', 'House purchase', 'House + renovation'],
        bestFor: 'Young professionals under 35 with stable employment',
        details: [
            { label: 'Salary < 300K', value: '3.75% rate' },
            { label: 'Salary > 300K', value: '4% rate' },
            { label: 'Grace Period', value: '1–12 months' },
        ],
    },
    {
        title: 'Ordinary Classical Loan',
        icon: Home,
        color: 'text-blue-500',
        borderColor: 'border-t-blue-500',
        maxLoan: '150 Million XAF',
        term: 'Up to 25 Years',
        interestRate: '6%',
        contribution: 'Minimum 20%',
        eligibleProjects: ['Land purchase', 'Construction', 'House acquisition', 'Renovation', 'Mortgage refinancing'],
        bestFor: 'Medium and high-standing residential projects',
    },
    {
        title: 'Land Promotion Loan',
        icon: Briefcase,
        color: 'text-purple-500',
        borderColor: 'border-t-purple-500',
        maxLoan: '500 Million XAF',
        term: '48 Months',
        interestRate: '7%',
        contribution: 'Land + preliminary expenses',
        eligibleProjects: ['Plot development for resale', 'Housing construction for sale'],
        bestFor: 'Accredited real estate developers',
    },
    {
        title: 'Social Rental Loan',
        icon: Shield,
        color: 'text-teal-500',
        borderColor: 'border-t-teal-500',
        maxLoan: 'Legal Entity: 250M / Individual: 125M XAF',
        term: 'Legal Entity: 30 Yrs / Individual: 25 Yrs',
        interestRate: '5%',
        contribution: 'Minimum 50%',
        eligibleProjects: ['Affordable rental housing construction'],
        bestFor: 'Moderate rental projects (e.g., student housing)',
        specialConditions: [
            'Land must be registered (Titre Foncier)',
            'Construction cost < 175,000 XAF per m²',
            'At least 30% completed before application',
        ],
    },
    {
        title: 'Classical Acquirer Loan',
        icon: Banknote,
        color: 'text-amber-500',
        borderColor: 'border-t-amber-500',
        maxLoan: '150 Million XAF',
        term: 'Up to 25 Years',
        interestRate: '5% – 6%',
        contribution: 'Minimum 10%',
        eligibleProjects: ['Acquisition within approved developer programs'],
        bestFor: 'Buyers purchasing from certified developers',
        details: [
            { label: 'Standard Program', value: '6% rate' },
            { label: 'Social / Gov Program', value: '5% rate' },
        ],
    },
    {
        title: 'Classical Social Loan',
        icon: Home,
        color: 'text-cyan-500',
        borderColor: 'border-t-cyan-500',
        maxLoan: '30 Million XAF',
        term: 'Up to 25 Years',
        interestRate: '5%',
        contribution: 'Minimum 10%',
        eligibleProjects: ['Low-standing housing', 'Medium-standing housing'],
        bestFor: 'Low and medium standing housing projects',
    },
    {
        title: 'Ordinary Rental Loan',
        icon: Building2,
        color: 'text-indigo-500',
        borderColor: 'border-t-indigo-500',
        maxLoan: 'Legal Entity: 500M / Individual: 250M XAF',
        term: 'Up to 25 Years',
        interestRate: '7%',
        contribution: 'Minimum 50%',
        eligibleProjects: ['Investment properties for rental income'],
        bestFor: 'Investors building rental portfolios',
    },
    {
        title: 'Social Rental Loan (Locatif Social)',
        icon: Shield,
        color: 'text-rose-500',
        borderColor: 'border-t-rose-500',
        maxLoan: 'Legal Entity: 250M / Individual: 125M XAF',
        term: 'Up to 30 Years',
        interestRate: '5%',
        contribution: 'Minimum 50%',
        eligibleProjects: ['Affordable rental housing'],
        bestFor: 'Affordable rental housing developers',
    },
];

// ─── Data: Private Investors ──────────────────────────────────────────────────

const PRIVATE_MODELS = [
    {
        title: 'Equity Partner Model',
        icon: HandCoins,
        color: 'text-accent-gold',
        bgGrad: 'from-accent-gold/10 to-transparent',
        description: 'Investor funds part of the project in exchange for a defined equity stake.',
        mechanics: [
            'Profit sharing agreement governs distribution',
            'Exit at property sale or rental yield milestone',
            'Legal structure via notarized partnership',
        ],
        bestFor: 'Large developments and high-growth zone projects',
    },
    {
        title: 'Joint Venture Model',
        icon: Users,
        color: 'text-blue-500',
        bgGrad: 'from-blue-500/10 to-transparent',
        description: 'Land owner contributes asset, capital partner contributes cash. Shared ownership.',
        mechanics: [
            'Defined profit split agreed before construction',
            'Both parties have equity in the final asset',
            'Common in developer + landowner partnerships',
        ],
        bestFor: 'Investors lacking upfront capital but holding land assets',
    },
    {
        title: 'Diaspora Capital Pool',
        icon: Target,
        color: 'text-purple-500',
        bgGrad: 'from-purple-500/10 to-transparent',
        description: 'Structured pooling of foreign-based Cameroonian investors for collective real estate deals.',
        mechanics: [
            'Transparent monthly/quarterly reporting',
            'Exit strategy defined upfront (sale or refinance)',
            'Professional fund administration required',
        ],
        bestFor: 'Large-scale rental portfolios or land banking',
    },
];

// ─── Main Page Component ──────────────────────────────────────────────────────

type Tab = 'personal' | 'bank' | 'private';

const GettingFunded: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('personal');
    const [expandedCard, setExpandedCard] = useState<string | null>(null);

    const toggleCard = (name: string) => setExpandedCard(prev => prev === name ? null : name);

    return (
        <AuthenticatedLayout>
            <div className="p-8 max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Banknote className="w-5 h-5 text-accent-gold" />
                        <span className="text-xs font-bold text-accent-gold uppercase tracking-widest">Capital Access</span>
                    </div>
                    <h1 className="text-3xl font-bold text-primary-900 dark:text-white">Getting Funded</h1>
                    <p className="text-sm text-primary-500 dark:text-primary-400 mt-1">
                        Structured funding pathways with clear eligibility, rates, and strategic fit for every investor profile.
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 bg-primary-50 dark:bg-primary-800/30 p-1.5 rounded-xl border border-primary-200 dark:border-primary-800 w-fit">
                    {([
                        { id: 'personal', label: 'Personal Funds', icon: Wallet },
                        { id: 'bank', label: 'Bank Financing', icon: Landmark },
                        { id: 'private', label: 'Private Investors', icon: Users },
                    ] as const).map(t => (
                        <button key={t.id} onClick={() => setActiveTab(t.id)}
                            className={clsx(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                                activeTab === t.id
                                    ? "bg-white dark:bg-primary-900 text-primary-900 dark:text-white shadow-sm"
                                    : "text-primary-500 hover:text-primary-700 dark:hover:text-primary-300"
                            )}>
                            <t.icon className="w-4 h-4" />
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* ═══════════════════ TAB 1: PERSONAL FUNDS ═══════════════════ */}
                {activeTab === 'personal' && (
                    <div className="space-y-6 animate-fade-in">
                        <p className="text-sm text-primary-600 dark:text-primary-400 max-w-2xl">
                            Before leveraging external debt, build internal capital discipline. These savings-backed products give you preferential loan access based on your deposit history.
                        </p>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {PERSONAL_FUNDS.map(fund => {
                                const Icon = fund.icon;
                                return (
                                    <div key={fund.title}
                                        className={clsx(
                                            "bg-white dark:bg-primary-900 rounded-xl border-l-4 shadow-sm p-6 flex flex-col",
                                            fund.borderColor
                                        )}>
                                        {/* Header */}
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className={clsx("p-2 rounded-lg", fund.bgColor)}>
                                                <Icon className={clsx("w-6 h-6", fund.color)} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-primary-900 dark:text-white">{fund.title}</h3>
                                                <p className="text-xs text-primary-500">{fund.subtitle}</p>
                                            </div>
                                        </div>

                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-2 gap-3 mb-5">
                                            {fund.stats.map(s => (
                                                <div key={s.label} className="bg-primary-50 dark:bg-primary-800 p-2.5 rounded-lg">
                                                    <p className="text-[10px] uppercase tracking-wider text-primary-400 font-bold">{s.label}</p>
                                                    <p className="text-sm font-bold text-primary-900 dark:text-white">{s.value}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Use Case */}
                                        <div className="mb-4">
                                            <p className="text-xs font-bold text-primary-500 uppercase tracking-wider mb-1">Use Case</p>
                                            <p className="text-sm text-primary-700 dark:text-primary-300">{fund.useCase}</p>
                                        </div>

                                        {/* Why It Matters */}
                                        <div className="mb-4 flex-1">
                                            <p className="text-xs font-bold text-primary-500 uppercase tracking-wider mb-2">Why It Matters</p>
                                            <ul className="space-y-1">
                                                {fund.whyItMatters.map(w => (
                                                    <li key={w} className="flex items-start text-sm text-primary-600 dark:text-primary-300">
                                                        <ArrowUpRight className={clsx("w-3.5 h-3.5 mr-1.5 mt-0.5 flex-shrink-0", fund.color)} />
                                                        {w}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Action */}
                                        <div className="bg-accent-gold/5 border border-accent-gold/20 rounded-lg p-3 mb-4">
                                            <p className="text-xs font-bold text-accent-gold uppercase tracking-wider mb-1">Recommended Action</p>
                                            <p className="text-sm text-primary-800 dark:text-primary-200 font-medium">{fund.action}</p>
                                        </div>

                                        {/* Contact */}
                                        <div className="flex items-center gap-2 text-sm text-primary-500 pt-3 border-t border-primary-100 dark:border-primary-800">
                                            <Phone className="w-4 h-4" />
                                            <span className="font-mono font-medium">{CONTACT}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ═══════════════════ TAB 2: BANK FINANCING ═══════════════════ */}
                {activeTab === 'bank' && (
                    <div className="space-y-6 animate-fade-in">
                        <p className="text-sm text-primary-600 dark:text-primary-400 max-w-2xl">
                            Structured loan products from Cameroon's housing credit system. Each product has specific eligibility criteria, rates, and project types. Click any card to expand full details.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {BANK_PRODUCTS.map(product => {
                                const Icon = product.icon;
                                const isOpen = expandedCard === product.title;

                                return (
                                    <div key={product.title}
                                        className={clsx(
                                            "bg-white dark:bg-primary-900 rounded-xl border-t-4 border-x border-b shadow-sm transition-all overflow-hidden",
                                            product.borderColor,
                                            "border-primary-200 dark:border-primary-800",
                                            isOpen && "shadow-md"
                                        )}>
                                        {/* Card Header — Always Visible */}
                                        <div className="p-5">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <Icon className={clsx("w-6 h-6", product.color)} />
                                                    <h3 className="font-bold text-primary-900 dark:text-white text-sm">{product.title}</h3>
                                                </div>
                                                <span className={clsx("text-xs font-bold px-2 py-0.5 rounded-full", product.color, product.borderColor.replace('border-t-', 'bg-') + '/10')}>
                                                    {product.interestRate}
                                                </span>
                                            </div>

                                            {/* Key Stats Row */}
                                            <div className="grid grid-cols-2 gap-3 mb-4">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Banknote className="w-4 h-4 text-primary-400" />
                                                    <span className="text-primary-600 dark:text-primary-300">{product.maxLoan}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Clock className="w-4 h-4 text-primary-400" />
                                                    <span className="text-primary-600 dark:text-primary-300">{product.term}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Percent className="w-4 h-4 text-primary-400" />
                                                    <span className="text-primary-600 dark:text-primary-300">{product.contribution}</span>
                                                </div>
                                            </div>

                                            <p className="text-xs text-primary-500 mb-3">
                                                <strong>Best For:</strong> {product.bestFor}
                                            </p>

                                            <button onClick={() => toggleCard(product.title)}
                                                className="flex items-center gap-1 text-xs font-bold text-accent-gold hover:underline">
                                                {isOpen ? 'Collapse' : 'View details'}
                                                {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                            </button>
                                        </div>

                                        {/* Expanded Details */}
                                        <div className={clsx(
                                            "overflow-hidden transition-all duration-300",
                                            isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                                        )}>
                                            <div className="px-5 pb-5 pt-2 border-t border-primary-100 dark:border-primary-800 space-y-4">

                                                {/* Rate Details */}
                                                {product.details && (
                                                    <div>
                                                        <p className="text-xs font-bold text-primary-500 uppercase tracking-wider mb-2">Rate Breakdown</p>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {product.details.map(d => (
                                                                <div key={d.label} className="bg-primary-50 dark:bg-primary-800 p-2 rounded text-sm">
                                                                    <span className="text-primary-500 text-xs">{d.label}</span>
                                                                    <span className="block font-bold text-primary-900 dark:text-white">{d.value}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Eligible Projects */}
                                                <div>
                                                    <p className="text-xs font-bold text-primary-500 uppercase tracking-wider mb-2">Eligible Projects</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {product.eligibleProjects.map(p => (
                                                            <span key={p}
                                                                className="text-xs bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-300 px-2 py-1 rounded font-medium">
                                                                {p}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Special Conditions */}
                                                {product.specialConditions && (
                                                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
                                                        <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2">Special Conditions</p>
                                                        <ul className="space-y-1">
                                                            {product.specialConditions.map(c => (
                                                                <li key={c} className="text-sm text-amber-700 dark:text-amber-300 flex items-start gap-2">
                                                                    <span className="text-amber-500 mt-1">•</span>
                                                                    {c}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {/* Contact */}
                                                <div className="flex items-center gap-2 text-sm text-primary-500 pt-3 border-t border-primary-100 dark:border-primary-800">
                                                    <Phone className="w-4 h-4" />
                                                    <span className="font-mono font-medium">{CONTACT}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ═══════════════════ TAB 3: PRIVATE INVESTORS ═══════════════════ */}
                {activeTab === 'private' && (
                    <div className="space-y-6 animate-fade-in">
                        <p className="text-sm text-primary-600 dark:text-primary-400 max-w-2xl">
                            Strategic capital partnerships for projects that exceed traditional banking limits or require non-conventional structures.
                        </p>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {PRIVATE_MODELS.map(model => {
                                const Icon = model.icon;
                                return (
                                    <div key={model.title}
                                        className={clsx(
                                            "bg-white dark:bg-primary-900 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm overflow-hidden relative"
                                        )}>
                                        {/* Gradient Top Band */}
                                        <div className={clsx("h-1.5 w-full bg-gradient-to-r", model.bgGrad)} />

                                        <div className="p-6 flex flex-col h-full">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="p-2.5 bg-primary-100 dark:bg-primary-800 rounded-xl">
                                                    <Icon className={clsx("w-7 h-7", model.color)} />
                                                </div>
                                                <h3 className="text-lg font-bold text-primary-900 dark:text-white">{model.title}</h3>
                                            </div>

                                            <p className="text-sm text-primary-600 dark:text-primary-300 mb-5 leading-relaxed">
                                                {model.description}
                                            </p>

                                            {/* Mechanics */}
                                            <div className="mb-5 flex-1">
                                                <p className="text-xs font-bold text-primary-500 uppercase tracking-wider mb-3">How It Works</p>
                                                <ul className="space-y-2">
                                                    {model.mechanics.map((m, i) => (
                                                        <li key={i} className="flex items-start text-sm text-primary-700 dark:text-primary-300">
                                                            <span className={clsx("w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center mr-2.5 flex-shrink-0 mt-0.5", model.color, model.bgGrad.replace('from-', 'bg-').split(' ')[0])}>
                                                                {i + 1}
                                                            </span>
                                                            {m}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Best For */}
                                            <div className="bg-primary-50 dark:bg-primary-800 rounded-lg p-3 mb-4">
                                                <p className="text-xs font-bold text-primary-500 uppercase tracking-wider mb-1">Best For</p>
                                                <p className="text-sm font-medium text-primary-800 dark:text-primary-200">{model.bestFor}</p>
                                            </div>

                                            {/* Contact */}
                                            <div className="flex items-center gap-2 text-sm text-primary-500 pt-3 border-t border-primary-100 dark:border-primary-800">
                                                <Phone className="w-4 h-4" />
                                                <span className="font-mono font-medium">{CONTACT}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

            </div>
        </AuthenticatedLayout>
    );
};

export default GettingFunded;
