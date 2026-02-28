import React, { useState } from 'react';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import {
    ClipboardList, CheckCircle2, AlertTriangle, Scale, Landmark,
    Hammer, Home, Building2, Store, Calculator, Clock, Building, ShieldCheck, MapPin, Search
} from 'lucide-react';

const clsx = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

// ─── Shared Components ────────────────────────────────────────────────────────

const SectionTitle: React.FC<{ icon: React.ElementType, title: string, subtitle?: string }> = ({ icon: Icon, title, subtitle }) => (
    <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary-900 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-accent-gold/10 rounded-lg">
                <Icon className="w-6 h-6 text-accent-gold" />
            </div>
            {title}
        </h2>
        {subtitle && <p className="text-primary-500 mt-1 ml-11">{subtitle}</p>}
    </div>
);

const WarningCard: React.FC<{ title: string, content: string }> = ({ title, content }) => (
    <div className="bg-red-500/10 border-l-4 border-red-500 rounded-r-lg p-4 my-4">
        <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
                <h4 className="font-bold text-red-700 dark:text-red-400 text-sm mb-1">{title}</h4>
                <p className="text-sm text-red-600/80 dark:text-red-300/80">{content}</p>
            </div>
        </div>
    </div>
);

const ContactCard: React.FC<{ title: string, contacts: string[] }> = ({ title, contacts }) => (
    <div className="bg-primary-50 dark:bg-primary-800/50 border border-primary-200 dark:border-primary-700 rounded-lg p-4 mt-4">
        <h4 className="font-bold text-xs uppercase tracking-wider text-primary-500 dark:text-primary-400 mb-2">{title}</h4>
        <ul className="space-y-1">
            {contacts.map((c, i) => (
                <li key={i} className="text-sm font-medium text-primary-800 dark:text-primary-200 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-gold" />
                    {c}
                </li>
            ))}
        </ul>
    </div>
);

// ─── Main Page Component ──────────────────────────────────────────────────────

const ProjectProcess: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'phases' | 'types' | 'post-construction'>('phases');

    return (
        <AuthenticatedLayout>
            <div className="p-8 max-w-5xl mx-auto space-y-10">
                {/* Header */}
                <div className="border-b border-primary-200 dark:border-primary-800 pb-8">
                    <div className="flex items-center gap-2 mb-2">
                        <ClipboardList className="w-5 h-5 text-accent-gold" />
                        <span className="text-xs font-bold text-accent-gold uppercase tracking-widest">Practical Framework</span>
                    </div>
                    <h1 className="text-4xl font-bold text-primary-900 dark:text-white mb-3">
                        Project Process Guide
                    </h1>
                    <p className="text-lg text-primary-600 dark:text-primary-300">
                        The definitive, step-by-step guide to executing real estate projects in Cameroon securely and profitably.
                    </p>
                </div>

                {/* Navigation Tabs */}
                <div className="flex gap-2 bg-primary-50 dark:bg-primary-800/30 p-1.5 rounded-xl border border-primary-200 dark:border-primary-800 w-fit">
                    {[
                        { id: 'phases', label: 'Execution Phases', icon: Clock },
                        { id: 'types', label: 'Project Types', icon: Building2 },
                        { id: 'post-construction', label: 'Cost Control & Post-Op', icon: Calculator },
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id as any)}
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

                {/* ═════════════════ TAB 1: EXECUTION PHASES ═════════════════ */}
                {activeTab === 'phases' && (
                    <div className="space-y-12 animate-fade-in relative">
                        {/* Vertical Timeline Line */}
                        <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-primary-200 dark:bg-primary-800 hidden md:block" />

                        {/* Phase 1: Legal */}
                        <section className="relative md:pl-16">
                            <div className="hidden md:flex absolute left-0 top-1 w-12 h-12 bg-white dark:bg-primary-950 border-4 border-primary-100 dark:border-primary-800 rounded-full items-center justify-center text-xl font-bold text-primary-400">1</div>
                            <SectionTitle icon={Scale} title="Legally Buying Land the Right Way" subtitle="Don't lose your capital before you even start building." />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                                <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500" />
                                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><Search className="w-5 h-5 text-emerald-500" /> Step 1: Due Diligence</h3>
                                    <p className="text-sm text-primary-600 dark:text-primary-300 mb-4">Before paying anything, verify ownership at the Divisional Delegation of State Property & Land Tenure.</p>
                                    <ul className="space-y-2 mb-4">
                                        {['Confirm Land Title (Titre Foncier)', 'No existing mortgage or litigation', 'No double sale', 'Correct surface area'].map(s => (
                                            <li key={s} className="flex items-start text-sm"><CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 mt-0.5" />{s}</li>
                                        ))}
                                    </ul>
                                    <div className="bg-primary-50 dark:bg-primary-800/50 p-3 rounded text-sm text-primary-700 dark:text-primary-300 font-medium">
                                        Must obtain: Certified Copy of Land Title, Location Plan, Tax Clearance.
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-2 h-full bg-blue-500" />
                                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><MapPin className="w-5 h-5 text-blue-500" /> Step 2: Hire a Surveyor</h3>
                                    <p className="text-sm text-primary-600 dark:text-primary-300 mb-4">A registered surveyor must confirm boundaries, corner marks, and check for encroachments.</p>
                                    <ContactCard title="Sample Contacts" contacts={['Surveyor Jean Mbarga – 67X XXX XXX', 'Cabinet TopoVision – 69X XXX XXX']} />
                                </div>

                                <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-2 h-full bg-purple-500" />
                                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><Scale className="w-5 h-5 text-purple-500" /> Step 3: Sales Agreement</h3>
                                    <p className="text-sm text-primary-600 dark:text-primary-300 mb-3">Engage a notary. They confirm ownership, draft the deed, and register the transfer.</p>
                                    <WarningCard title="Critical Rule" content="Never buy land through a handwritten agreement only. It offers zero legal protection." />
                                    <ContactCard title="Sample Contacts" contacts={['Maître N. Ndzi – 67X XXX XXX', 'Étude Notariale Central – 69X XXX XXX']} />
                                </div>

                                <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-2 h-full bg-indigo-500" />
                                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-indigo-500" /> Step 4: Registration</h3>
                                    <p className="text-sm text-primary-600 dark:text-primary-300 mb-2">The notary handles stamp duties, registration fees, and transfer publication.</p>
                                    <div className="flex items-center gap-2 text-sm bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 p-2 rounded mt-4 font-semibold">
                                        <Clock className="w-4 h-4" /> Timeline: 2–6 months depending on region.
                                    </div>
                                    <p className="text-xs text-primary-500 mt-3 font-semibold italic">Only after official registration are you fully protected.</p>
                                </div>
                            </div>
                        </section>

                        {/* Phase 2: Financing */}
                        <section className="relative md:pl-16">
                            <div className="hidden md:flex absolute left-0 top-1 w-12 h-12 bg-white dark:bg-primary-950 border-4 border-primary-100 dark:border-primary-800 rounded-full items-center justify-center text-xl font-bold text-primary-400">2</div>
                            <SectionTitle icon={Landmark} title="Financing Strategy" subtitle="How to fund your acquisition and construction." />

                            <div className="bg-white dark:bg-primary-900 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm overflow-hidden">
                                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-primary-200 dark:divide-primary-800">
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-primary-900 dark:text-white">Option A: 100% Cash</h3>
                                        <div className="space-y-4 text-sm">
                                            <div>
                                                <strong className="text-emerald-500">Advantages:</strong>
                                                <ul className="mt-1 space-y-1">
                                                    <li>• No interest cost</li>
                                                    <li>• Full ownership immediately</li>
                                                    <li>• Higher long-term gross yield</li>
                                                </ul>
                                            </div>
                                            <div>
                                                <strong className="text-red-500">Disadvantages:</strong>
                                                <ul className="mt-1 space-y-1">
                                                    <li>• Capital tied up heavily</li>
                                                    <li>• Lower liquidity</li>
                                                    <li>• Missed cash-on-cash leverage boost</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-primary-900 dark:text-white">Option B: Mortgage Financing</h3>
                                        <ul className="text-sm space-y-2 mb-4">
                                            <li className="flex gap-2"><span className="font-bold text-accent-gold">1.</span> Prepare: Land Title, Income proof, Bank statements, Building plan.</li>
                                            <li className="flex gap-2"><span className="font-bold text-accent-gold">2.</span> Submit to commercial bank & await valuation.</li>
                                            <li className="flex gap-2"><span className="font-bold text-accent-gold">3.</span> Approval & mortgage registration.</li>
                                        </ul>
                                        <div className="bg-primary-50 dark:bg-primary-800 p-3 rounded text-sm mb-4">
                                            <strong>Typical terms:</strong> 10–20 years at 8–15% interest.
                                        </div>
                                        <ContactCard title="Sample Contacts" contacts={['Credit Officer, Commercial Bank – 67X XXX XXX', 'Real Estate Desk, Microfinance – 69X XXX XXX']} />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Phase 3: Building */}
                        <section className="relative md:pl-16">
                            <div className="hidden md:flex absolute left-0 top-1 w-12 h-12 bg-white dark:bg-primary-950 border-4 border-primary-100 dark:border-primary-800 rounded-full items-center justify-center text-xl font-bold text-primary-400">3</div>
                            <SectionTitle icon={Hammer} title="Building Process" subtitle="Execution phase for residential or commercial development." />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm hover:border-accent-gold/50 transition-colors">
                                    <h3 className="text-lg font-bold mb-2">Step 1: Architectural Design</h3>
                                    <p className="text-sm text-primary-600 dark:text-primary-300 mb-3">Hire a certified architect to deliver floor, structural, electrical, and plumbing plans.</p>
                                    <ContactCard title="Sample Contacts" contacts={['Arch. Paul Ndzi – 67X XXX XXX', 'DesignBuild Studio – 69X XXX XXX']} />
                                </div>
                                <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm hover:border-accent-gold/50 transition-colors">
                                    <h3 className="text-lg font-bold mb-2">Step 2: Building Permit</h3>
                                    <p className="text-sm text-primary-600 dark:text-primary-300 mb-3">Submit Land Title, drawings, and calculations to council. <strong>Without a permit, your project can be halted indefinitely.</strong></p>
                                </div>
                                <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm hover:border-accent-gold/50 transition-colors">
                                    <h3 className="text-lg font-bold mb-2">Step 3: Contractor Selection</h3>
                                    <p className="text-sm text-primary-600 dark:text-primary-300 mb-3">Do not choose based on lowest price alone. Verify past projects, written contracts, and Bill of Quantities (BOQ).</p>
                                    <ContactCard title="Sample Contacts" contacts={['BTP Excellence SARL – 67X XXX XXX', 'Horizon Construction – 69X XXX XXX']} />
                                </div>
                                <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm hover:border-accent-gold/50 transition-colors">
                                    <h3 className="text-lg font-bold mb-2">Step 4: Supervision</h3>
                                    <p className="text-sm text-primary-600 dark:text-primary-300 mb-3">Hire an independent engineer to supervise. <strong>Contractor ≠ quality control.</strong></p>
                                    <ContactCard title="Sample Contacts" contacts={['Civil Engineer Consultant – 67X XXX XXX']} />
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {/* ═════════════════ TAB 2: PROJECT TYPES ═════════════════ */}
                {activeTab === 'types' && (
                    <div className="space-y-6 animate-fade-in">
                        <SectionTitle icon={Building2} title="Project Types & Objectives" subtitle="Align your development strategy with your financial goals." />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Personal Home */}
                            <div className="bg-white dark:bg-primary-900 rounded-xl border-t-4 border-t-emerald-500 border-x border-b border-primary-200 dark:border-primary-800 shadow-sm p-6 flex flex-col">
                                <Home className="w-10 h-10 text-emerald-500 mb-4" />
                                <h3 className="text-xl font-bold text-primary-900 dark:text-white mb-2">Personal Home</h3>
                                <div className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold w-fit mb-4">Goal: Long-term living</div>
                                <div className="flex-1 space-y-4 text-sm text-primary-600 dark:text-primary-300">
                                    <div>
                                        <strong className="text-primary-900 dark:text-white block mb-1">Focus Areas:</strong>
                                        <ul className="list-disc pl-4 space-y-1">
                                            <li>Quality materials & finishes</li>
                                            <li>Future expansion potential</li>
                                            <li>Infrastructure & road access</li>
                                            <li>Neighborhood stability</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <strong className="text-primary-900 dark:text-white block">Return Metric:</strong>
                                        Appreciation + Quality of Life
                                    </div>
                                </div>
                            </div>

                            {/* Rental Residential */}
                            <div className="bg-white dark:bg-primary-900 rounded-xl border-t-4 border-t-accent-gold border-x border-b border-primary-200 dark:border-primary-800 shadow-sm p-6 flex flex-col">
                                <Building className="w-10 h-10 text-accent-gold mb-4" />
                                <h3 className="text-xl font-bold text-primary-900 dark:text-white mb-2">Rental Residential</h3>
                                <div className="bg-accent-gold/10 text-accent-gold px-3 py-1 rounded-full text-xs font-bold w-fit mb-4">Goal: Cash Flow</div>
                                <div className="flex-1 space-y-4 text-sm text-primary-600 dark:text-primary-300">
                                    <div>
                                        <strong className="text-primary-900 dark:text-white block mb-1">Focus Areas:</strong>
                                        <ul className="list-disc pl-4 space-y-1">
                                            <li>Proximity to schools, hospitals, CBD</li>
                                            <li>Multi-unit design (1-2 bed flats preferred)</li>
                                            <li>Durable, low-maintenance materials</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <strong className="text-primary-900 dark:text-white block">Key Metrics:</strong>
                                        Gross Yield, Net Yield, Cash-on-Cash Return, Occupancy Rate
                                    </div>
                                </div>
                            </div>

                            {/* Commercial */}
                            <div className="bg-white dark:bg-primary-900 rounded-xl border-t-4 border-t-blue-500 border-x border-b border-primary-200 dark:border-primary-800 shadow-sm p-6 flex flex-col">
                                <Store className="w-10 h-10 text-blue-500 mb-4" />
                                <h3 className="text-xl font-bold text-primary-900 dark:text-white mb-2">Commercial Rental</h3>
                                <div className="bg-blue-500/10 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold w-fit mb-4">Goal: High Yield, Higher Risk</div>
                                <div className="flex-1 space-y-4 text-sm text-primary-600 dark:text-primary-300">
                                    <div>
                                        <strong className="text-primary-900 dark:text-white block mb-1">Focus Areas:</strong>
                                        <ul className="list-disc pl-4 space-y-1">
                                            <li>Direct road frontage</li>
                                            <li>High business/foot traffic</li>
                                            <li>Adequate parking access</li>
                                            <li>Appropriate commercial zoning</li>
                                        </ul>
                                    </div>
                                    <div className="text-red-600 dark:text-red-400 bg-red-500/10 p-2 rounded">
                                        <strong>Risk Profile:</strong> Higher vacancy risk than residential properties during downturns.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ═════════════════ TAB 3: POST-CONSTRUCTION ═════════════════ */}
                {activeTab === 'post-construction' && (
                    <div className="space-y-8 animate-fade-in">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <SectionTitle icon={Calculator} title="Cost Control Framework" subtitle="Don't let budget overruns kill your yield." />
                                <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm">
                                    <h4 className="font-bold text-primary-900 dark:text-white mb-4">During Construction</h4>
                                    <ul className="space-y-3 mb-6">
                                        {[
                                            'Weekly cost and progress tracking',
                                            'Strict materials inventory log',
                                            'Milestone-based payment system',
                                            'NEVER pay a lump sum upfront'
                                        ].map(item => (
                                            <li key={item} className="flex items-center text-sm text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-800 p-3 rounded border border-primary-100 dark:border-primary-700">
                                                <CheckCircle2 className="w-5 h-5 text-accent-gold mr-3 flex-shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-lg flex items-start gap-3">
                                        <AlertTriangle className="text-amber-500 w-5 h-5 mt-0.5" />
                                        <div>
                                            <strong className="text-amber-700 dark:text-amber-500 block">Mandatory Contingency</strong>
                                            <span className="text-sm text-amber-600 dark:text-amber-400">Reserve a minimum of 10–15% of your total budget for unexpected costs. Do not touch this unless necessary.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <SectionTitle icon={ClipboardList} title="Post-Construction Protocol" subtitle="Steps to operationalize a rental property." />
                                <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm">
                                    <div className="space-y-6 relative">
                                        <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-primary-200 dark:bg-primary-700" />
                                        {[
                                            'Register lease agreements formally',
                                            'Draft watertight tenancy contracts',
                                            'Collect structural security deposits (min 2 months)',
                                            'Ensure property insurance coverage',
                                            'Hire a professional property manager'
                                        ].map((step, i) => (
                                            <div key={i} className="flex items-center gap-4 relative">
                                                <div className="w-6 h-6 rounded-full bg-accent-gold text-white flex items-center justify-center text-xs font-bold relative z-10 flex-shrink-0">
                                                    {i + 1}
                                                </div>
                                                <span className="text-sm font-medium text-primary-800 dark:text-primary-200">{step}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-8 pt-6 border-t border-primary-200 dark:border-primary-800">
                                        <ContactCard title="Sample Estate Management" contacts={['SmartRent Services – 67X XXX XXX']} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Why this matters block */}
                        <div className="bg-accent-gold/5 border border-accent-gold/20 p-8 rounded-2xl relative overflow-hidden">
                            <div className="absolute right-0 bottom-0 opacity-5 scale-150 transform translate-x-1/4 translate-y-1/4">
                                <ShieldCheck size={300} />
                            </div>
                            <h3 className="text-2xl font-bold text-primary-900 dark:text-white mb-4 relative z-10">Why This Framework Matters</h3>
                            <p className="text-primary-600 dark:text-primary-300 mb-6 max-w-2xl relative z-10">
                                Most investors lose money because of illegal land purchases, zero due diligence, poor contractor management, over-leveraging, and lack of contingency planning.
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                                {[
                                    'Mitigates Legal Risk',
                                    'Prevents Overruns',
                                    'Fixes Miscalculations',
                                    'Boosts Yield Efficiency'
                                ].map(benefit => (
                                    <div key={benefit} className="bg-white dark:bg-primary-900 text-center p-3 rounded-lg border border-accent-gold/30 shadow-sm text-sm font-bold text-accent-gold">
                                        {benefit}
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
};

export default ProjectProcess;
