import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import {
    calculateRentalModel, calculateLandModel, calculateFlipModel,
    RentalInputs, LandInputs, FlipInputs
} from '../utils/financeUtils';
import {
    Building, Home, Map, Hammer, Zap,
    Banknote, Landmark, Target, ChevronRight, Calculator,
    Download, CheckCircle, AlertTriangle,
    LineChart as LineChartIcon, Sliders
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import ExportBar from '../components/common/ExportBar';

// ─── Constants ────────────────────────────────────────────────────────────────

type InvestmentCategory = 'rental' | 'commercial' | 'land' | 'development' | 'flip';
type FinanceMethod = 'cash' | 'mortgage';

const MACRO_RATES = {
    treasuryYield: 6.5,  // Cameroon 10Y Bond ~ 6.5%
    inflation: 5.2,      // Inflation ~ 5.2%
    avgCityYield: 7.1    // Douala Avg ~ 7.1%
};

const ML_FORECASTS = {
    rental: { rentGrowth: 3.5, appreciation: 4.2, occupancy: 92 },
    commercial: { rentGrowth: 4.0, appreciation: 3.8, occupancy: 88 },
    land: { rentGrowth: 0, appreciation: 8.5, occupancy: 100 },
    development: { rentGrowth: 4.5, appreciation: 5.0, occupancy: 90 },
    flip: { rentGrowth: 0, appreciation: 6.0, occupancy: 100 },
};

const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });
const pct = (n: number) => (n * 100).toFixed(1) + '%';
const XAF = 'XAF';

// ─── Main Page Component ──────────────────────────────────────────────────────

const YieldEstimator: React.FC = () => {
    const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

    // ─ State: Step 1 & 2
    const [category, setCategory] = useState<InvestmentCategory>('rental');
    const [financeType, setFinanceType] = useState<FinanceMethod>('cash');

    // ─ State: Inputs (Unified form)
    const [purchasePrice, setPurchasePrice] = useState(50_000_000);
    const [renovationCost, setRenovationCost] = useState(0);
    const [monthlyRent, setMonthlyRent] = useState(350_000); // 4.2M/yr
    const [occupancy, setOccupancy] = useState(90);
    const [maintenancePct, setMaintenancePct] = useState(5);
    const [managementPct, setManagementPct] = useState(8);
    const [insurance, setInsurance] = useState(150_000);
    const [taxes, setTaxes] = useState(250_000);

    const [rentGrowth, setRentGrowth] = useState(2);
    const [appreciation, setAppreciation] = useState(4);

    // Land & Flip specific
    const [holdingYears, setHoldingYears] = useState(5);
    const [arv, setArv] = useState(75_000_000); // After Repair Value (Flip)

    // Finance Inputs
    const [downPaymentPct, setDownPaymentPct] = useState(30);
    const [loanInterestRate, setLoanInterestRate] = useState(8.5);
    const [loanTerm, setLoanTerm] = useState(15);

    // Step 4 Toggle
    const [useMlForecast, setUseMlForecast] = useState(false);

    // Apply ML Overrides when toggled
    React.useEffect(() => {
        if (useMlForecast) {
            const f = ML_FORECASTS[category];
            setRentGrowth(f.rentGrowth);
            setAppreciation(f.appreciation);
            setOccupancy(f.occupancy);
        }
    }, [useMlForecast, category]);

    // ─── Mathematical Models ────────────────────────────────────────────────────

    const totalCost = purchasePrice + renovationCost;

    // RENTAL / COMMERCIAL
    const rentalInputs: RentalInputs = {
        propertyValue: totalCost,
        monthlyRent,
        occupancyRate: occupancy / 100,
        maintenancePct: maintenancePct / 100,
        managementPct: managementPct / 100,
        insurance, taxes,
        rentGrowthRate: rentGrowth / 100,
        appreciationRate: appreciation / 100,
        isMortgage: financeType === 'mortgage',
        downPaymentPct: downPaymentPct / 100,
        loanInterestRate: loanInterestRate / 100,
        loanTermYears: loanTerm
    };

    const rentalOutput = useMemo(() => calculateRentalModel(rentalInputs), [rentalInputs]);

    // LAND
    const landInputs: LandInputs = {
        purchasePrice,
        holdingPeriodYears: holdingYears,
        annualAppreciationRate: appreciation / 100,
        annualHoldingCosts: taxes + insurance,
        isMortgage: financeType === 'mortgage',
        downPaymentPct: downPaymentPct / 100,
        loanInterestRate: loanInterestRate / 100,
        loanTermYears: loanTerm
    };
    const landOutput = useMemo(() => calculateLandModel(landInputs), [landInputs]);

    // FLIP
    const flipInputs: FlipInputs = {
        purchasePrice,
        renovationBudget: renovationCost,
        renovationMonths: 4,
        holdingMonths: 2, // Total 6 months
        arv,
        isMortgage: financeType === 'mortgage',
        downPaymentPct: downPaymentPct / 100,
        loanInterestRate: (loanInterestRate + 3) / 100, // hard money premium
    };
    const flipOutput = useMemo(() => calculateFlipModel(flipInputs), [flipInputs]);

    // ─── Sensitivity Analysis Engine (For Rental) ───────────────────────────────

    const sensitivity = useMemo(() => {
        if (category === 'land' || category === 'flip' || category === 'development') return null;

        // Base Case is current rental inputs
        // Optimistic: +5% occ, +2% rent gr, +1% app
        const optInputs = {
            ...rentalInputs,
            occupancyRate: Math.min(1, rentalInputs.occupancyRate + 0.05),
            rentGrowthRate: rentalInputs.rentGrowthRate + 0.02,
            appreciationRate: rentalInputs.appreciationRate + 0.01
        };

        // Conservative: -10% occ, -1% rent gr, -2% app
        const consInputs = {
            ...rentalInputs,
            occupancyRate: Math.max(0, rentalInputs.occupancyRate - 0.10),
            rentGrowthRate: Math.max(0, rentalInputs.rentGrowthRate - 0.01),
            appreciationRate: rentalInputs.appreciationRate - 0.02
        };

        return {
            base: rentalOutput,
            optimistic: calculateRentalModel(optInputs),
            conservative: calculateRentalModel(consInputs)
        };
    }, [rentalInputs, rentalOutput, category]);

    // ─── Verdict Engine ─────────────────────────────────────────────────────────

    const renderVerdict = () => {
        if (category === 'rental' || category === 'commercial') {
            const isGood = rentalOutput.cashOnCashReturn * 100 >= MACRO_RATES.treasuryYield && rentalOutput.dscr > 1.2;
            const risk = rentalOutput.dscr < 1.0 ? 'High' : rentalOutput.dscr < 1.25 ? 'Medium' : 'Low';
            const riskColor = risk === 'High' ? 'text-red-500' : risk === 'Medium' ? 'text-amber-500' : 'text-emerald-500';

            return (
                <div className="bg-white dark:bg-primary-900 rounded-xl border-l-4 border-accent-gold shadow-md p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Target size={120} /></div>
                    <h3 className="text-xl font-bold text-primary-900 dark:text-white flex items-center gap-2 mb-4">
                        <CheckCircle className="text-emerald-500" /> Investment Verdict
                    </h3>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <div>
                            <p className="text-sm text-primary-500">Rating</p>
                            <p className={clsx("text-lg font-bold", isGood ? "text-emerald-500" : "text-amber-500")}>
                                {isGood ? 'Strong Buy' : 'Hold / Review'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-primary-500">Risk Level</p>
                            <p className={clsx("text-lg font-bold", riskColor)}>{risk} Risk</p>
                        </div>
                        <div>
                            <p className="text-sm text-primary-500">Break-even</p>
                            <p className="text-lg font-bold">{rentalOutput.paybackPeriod || '>10'} Years</p>
                        </div>
                        <div>
                            <p className="text-sm text-primary-500">10-Yr IRR</p>
                            <p className="text-lg font-bold text-accent-gold">{pct(rentalOutput.irr10Yr)}</p>
                        </div>
                    </div>

                    <div className="bg-primary-50 dark:bg-primary-800 rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex justify-between items-center bg-white dark:bg-primary-900 px-3 py-2 rounded shadow-sm border border-primary-100 dark:border-primary-700">
                            <span className="text-sm">vs Treasury (6.5%)</span>
                            <span className="font-bold text-emerald-600">+{pct(rentalOutput.cashOnCashReturn - 0.065)}</span>
                        </div>
                        <div className="flex justify-between items-center bg-white dark:bg-primary-900 px-3 py-2 rounded shadow-sm border border-primary-100 dark:border-primary-700">
                            <span className="text-sm">vs Inflation (5.2%)</span>
                            <span className="font-bold text-emerald-600">+{pct(rentalOutput.cashOnCashReturn - 0.052)}</span>
                        </div>
                        {financeType === 'mortgage' && (
                            <div className="flex justify-between items-center bg-white dark:bg-primary-900 px-3 py-2 rounded shadow-sm border border-primary-100 dark:border-primary-700">
                                <span className="text-sm">Leverage Impact</span>
                                <span className={clsx("font-bold", rentalOutput.cashOnCashReturn > rentalOutput.netYield ? "text-emerald-600" : "text-red-500")}>
                                    {rentalOutput.cashOnCashReturn > rentalOutput.netYield ? 'Positive' : 'Negative'} spread
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        // Land Verdict ...
        return (
            <div className="bg-white dark:bg-primary-900 rounded-xl border-l-4 border-amber-500 shadow-md p-6">
                <h3 className="text-xl font-bold text-primary-900 dark:text-white flex items-center gap-2 mb-4">
                    <CheckCircle className="text-amber-500" /> Speculative Verdict (Land / Flip)
                </h3>
                <p className="text-sm text-primary-600 dark:text-primary-300">
                    Projected ROI is <strong className="text-accent-gold">{pct(category === 'land' ? landOutput.totalROI : flipOutput.roi)}</strong>.
                    This strategy relies entirely on market appreciation and exit timing rather than monthly cash flow.
                </p>
            </div>
        );
    };

    // ─── Helpers for UX ──────────────────────────────────────────────────────────

    const InputField: React.FC<{ label: string, value: number, setter: (n: number) => void, prefix?: string, suffix?: string, type?: 'number' }> = ({ label, value, setter, prefix, suffix }) => (
        <div>
            <label className="block text-xs font-semibold text-primary-600 dark:text-primary-400 mb-1">{label}</label>
            <div className="relative">
                {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400 text-sm">{prefix}</span>}
                <input
                    type="number" value={value} onChange={e => setter(Number(e.target.value))}
                    className={clsx("input w-full", prefix && "pl-8", suffix && "pr-8")}
                />
                {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-400 text-sm font-bold">{suffix}</span>}
            </div>
        </div>
    );

    const clsx = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

    // ─── Render Steps ────────────────────────────────────────────────────────────

    return (
        <AuthenticatedLayout>
            <div className="p-8 max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Calculator className="w-5 h-5 text-accent-gold" />
                            <span className="text-xs font-bold text-accent-gold uppercase tracking-widest"> institutional grade REFM</span>
                        </div>
                        <h1 className="text-3xl font-bold text-primary-900 dark:text-white">Smart Yield Estimator</h1>
                        <p className="text-sm text-primary-500 dark:text-primary-400 mt-1">
                            Complete financial modeling, sensitivity analysis, and macro stress-testing.
                        </p>
                    </div>
                    {step === 5 && (
                        <ExportBar
                            csvRows={[{ Status: 'Report Generated', Yield: rentalOutput?.netYield || 0 }]}
                            hideCsv
                            pdfTitle={`StratAxis REFM Report - ${category.toUpperCase()}`}
                        />
                    )}
                </div>

                {/* Stepper Navigation */}
                <div className="flex items-center gap-2 flex-wrap">
                    {([
                        [1, 'Asset Class'], [2, 'Capital Stack'], [3, 'Pro Forma'], [4, 'Intelligence'], [5, 'Verdict']
                    ] as const).map(([n, label]) => {
                        const active = step === n;
                        const done = step > n;
                        return (
                            <React.Fragment key={n}>
                                <button
                                    onClick={() => (done || active) ? setStep(n as any) : undefined}
                                    className={clsx(
                                        'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all',
                                        active && 'bg-accent-gold text-primary-950 shadow-sm',
                                        done && 'bg-emerald-500/10 text-emerald-600 cursor-pointer',
                                        !active && !done && 'bg-primary-100 dark:bg-primary-800 text-primary-400'
                                    )}
                                >
                                    <span className={clsx('w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold',
                                        active && 'bg-black/20 text-black',
                                        done && 'bg-emerald-500/20 text-emerald-700',
                                        !active && !done && 'bg-primary-300 dark:bg-primary-600'
                                    )}>{done ? '✓' : n}</span>
                                    {label}
                                </button>
                                {n < 5 && <ChevronRight className="w-4 h-4 text-primary-300" />}
                            </React.Fragment>
                        )
                    })}
                </div>

                {/* ═══════════════════════════ STEP 1: INVESTMENT CATEGORY ═══════════════════════════ */}
                {step === 1 && (
                    <div className="bg-white dark:bg-primary-900 rounded-xl border border-primary-200 dark:border-primary-800 p-6 shadow-sm animate-fade-in">
                        <h2 className="text-xl font-bold text-primary-900 dark:text-white mb-6">Select Investment Category</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[
                                { id: 'rental', label: 'Residential Rental', icon: Home, desc: 'Focus on cash flow, cap rate, and cash-on-cash return.' },
                                { id: 'commercial', label: 'Commercial Property', icon: Building, desc: 'Office or retail. Valuation based strongly on NOI.' },
                                { id: 'land', label: 'Land Banking', icon: Map, desc: 'Speculative hold. Focus on appreciation vs holding costs.' },
                                { id: 'development', label: 'Land + Development', icon: Hammer, desc: 'Phased cash flows. High risk, high reward margins.' },
                                { id: 'flip', label: 'Short-Term Flip', icon: Zap, desc: 'Buy, rehab, sell. Focus on ARV and velocity of money.' },
                            ].map(cat => (
                                <button key={cat.id} onClick={() => setCategory(cat.id as any)}
                                    className={clsx(
                                        "p-5 rounded-xl border-2 text-left transition-all",
                                        category === cat.id ? "border-accent-gold bg-accent-gold/5 shadow-md" : "border-primary-200 dark:border-primary-800 hover:border-accent-gold/50"
                                    )}>
                                    <cat.icon className={clsx("w-8 h-8 mb-3", category === cat.id ? "text-accent-gold" : "text-primary-400")} />
                                    <h3 className="font-bold text-lg text-primary-900 dark:text-white mb-1">{cat.label}</h3>
                                    <p className="text-xs text-primary-500">{cat.desc}</p>
                                </button>
                            ))}
                        </div>
                        <div className="mt-8 flex justify-end">
                            <button onClick={() => setStep(2)} className="btn btn-primary">Continue to Step 2 <ChevronRight className="w-4 h-4 ml-1" /></button>
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════ STEP 2: CAPITAL STRUCTURE ═══════════════════════════ */}
                {step === 2 && (
                    <div className="bg-white dark:bg-primary-900 rounded-xl border border-primary-200 dark:border-primary-800 p-6 shadow-sm animate-fade-in">
                        <h2 className="text-xl font-bold text-primary-900 dark:text-white mb-2">Configure Capital Structure</h2>
                        <p className="text-sm text-primary-500 mb-6">Yield on leveraged capital ≠ yield on total property value. Define your funding.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {[
                                { id: 'cash', label: '100% Cash Allocation', icon: Banknote, desc: 'No debt service. Lower absolute risk, lower cash-on-cash yield.' },
                                { id: 'mortgage', label: 'Leveraged / Mortgage', icon: Landmark, desc: 'Debt drives higher cash-on-cash return, but introduces capital risk.' }
                            ].map(fin => (
                                <button key={fin.id} onClick={() => setFinanceType(fin.id as any)}
                                    className={clsx(
                                        "p-6 rounded-xl border-2 text-left transition-all flex items-start gap-4",
                                        financeType === fin.id ? "border-accent-gold bg-accent-gold/5 shadow-md" : "border-primary-200 dark:border-primary-800 hover:border-accent-gold/50"
                                    )}>
                                    <fin.icon className={clsx("w-10 h-10 flex-shrink-0", financeType === fin.id ? "text-accent-gold" : "text-primary-400")} />
                                    <div>
                                        <h3 className="font-bold text-xl text-primary-900 dark:text-white mb-1">{fin.label}</h3>
                                        <p className="text-sm text-primary-500">{fin.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {financeType === 'mortgage' && (
                            <div className="p-6 bg-primary-50 dark:bg-primary-800/50 rounded-xl border border-primary-100 dark:border-primary-700 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <InputField label="Down Payment (%)" value={downPaymentPct} setter={setDownPaymentPct} suffix="%" />
                                <InputField label="Interest Rate (%)" value={loanInterestRate} setter={setLoanInterestRate} suffix="%" />
                                <InputField label="Loan Term (Years)" value={loanTerm} setter={setLoanTerm} suffix="Yrs" />
                            </div>
                        )}

                        <div className="mt-8 flex justify-between">
                            <button onClick={() => setStep(1)} className="btn btn-outline">Back</button>
                            <button onClick={() => setStep(3)} className="btn btn-primary">Continue to Step 3 <ChevronRight className="w-4 h-4 ml-1" /></button>
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════ STEP 3: PRO FORMA INPUTS ═══════════════════════════ */}
                {step === 3 && (
                    <div className="bg-white dark:bg-primary-900 rounded-xl border border-primary-200 dark:border-primary-800 p-6 shadow-sm animate-fade-in">
                        <h2 className="text-xl font-bold text-primary-900 dark:text-white mb-6">Pro Forma Adjustments</h2>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            {/* Acquisition Block */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-primary-800 dark:text-primary-200 border-b pb-2">Acquisition & Capital</h3>
                                <InputField label="Purchase Price" value={purchasePrice} setter={setPurchasePrice} suffix={XAF} />
                                <InputField label="Renovation / Rehab Cost" value={renovationCost} setter={setRenovationCost} suffix={XAF} />
                                {category === 'flip' && <InputField label="Expected ARV (After Repair Value)" value={arv} setter={setArv} suffix={XAF} />}
                                {category === 'land' && <InputField label="Planned Holding Period (Years)" value={holdingYears} setter={setHoldingYears} suffix="Yrs" />}
                            </div>

                            {/* Operating Block */}
                            {(category === 'rental' || category === 'commercial') && (
                                <div className="space-y-4">
                                    <h3 className="font-bold text-primary-800 dark:text-primary-200 border-b pb-2">Revenue & Expenses</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputField label="Monthly Gross Rent" value={monthlyRent} setter={setMonthlyRent} suffix={XAF} />
                                        <InputField label="Occupancy Rate" value={occupancy} setter={setOccupancy} suffix="%" />
                                        <InputField label="CapEx / Maintenance" value={maintenancePct} setter={setMaintenancePct} suffix="%" />
                                        <InputField label="Property Mgmt" value={managementPct} setter={setManagementPct} suffix="%" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputField label="Annual Insurance" value={insurance} setter={setInsurance} suffix={XAF} />
                                        <InputField label="Annual Taxes" value={taxes} setter={setTaxes} suffix={XAF} />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between mt-8">
                            <button onClick={() => setStep(2)} className="btn btn-outline">Back</button>
                            <button onClick={() => setStep(4)} className="btn btn-primary">Add Market Intelligence <ChevronRight className="w-4 h-4 ml-1" /></button>
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════ STEP 4: INTELLIGENCE ═══════════════════════════ */}
                {step === 4 && (
                    <div className="bg-white dark:bg-primary-900 rounded-xl border border-primary-200 dark:border-primary-800 p-6 shadow-sm animate-fade-in space-y-8">
                        <h2 className="text-xl font-bold text-primary-900 dark:text-white">Forecasting Intelligence Layer</h2>

                        <div className="bg-primary-950 text-white rounded-xl p-6 relative overflow-hidden shadow-inner">
                            <div className="absolute -right-10 -top-10 opacity-10"><Sliders size={200} /></div>
                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                                <div>
                                    <h3 className="text-xl font-bold text-accent-gold mb-2 flex items-center gap-2"><Zap size={20} /> StratAxis ML Overlay</h3>
                                    <p className="text-primary-300 text-sm max-w-lg">
                                        Stop guessing your exit variables. Toggle our machine learning forecast engine to auto-fill expected rent growth, area appreciation, and structural occupancy trends based on local market data.
                                    </p>
                                </div>
                                <div className="flex-shrink-0">
                                    <label className="flex items-center cursor-pointer">
                                        <div className="relative">
                                            <input type="checkbox" className="sr-only" checked={useMlForecast} onChange={() => setUseMlForecast(!useMlForecast)} />
                                            <div className={clsx("block w-14 h-8 rounded-full transition-colors", useMlForecast ? "bg-accent-gold" : "bg-primary-700")}></div>
                                            <div className={clsx("dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform", useMlForecast && "transform translate-x-6")}></div>
                                        </div>
                                        <span className="ml-3 font-bold">{useMlForecast ? 'Engine Active' : 'Enable Engine'}</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl mx-auto">
                            {['rentGrowth', 'appreciation'].map(key => {
                                if (key === 'rentGrowth' && (category === 'land' || category === 'flip')) return null;
                                const isGrow = key === 'rentGrowth';
                                const label = isGrow ? 'Rent Growth Rate' : 'Property Appreciation Rate';
                                const val = isGrow ? rentGrowth : appreciation;
                                const setter = isGrow ? setRentGrowth : setAppreciation;
                                return (
                                    <div key={key} className={clsx("p-4 rounded-lg border", useMlForecast ? "border-accent-gold/50 bg-accent-gold/5" : "border-primary-200 dark:border-primary-700")}>
                                        <InputField label={label} value={val} setter={setter} suffix="%/yr" />
                                        {useMlForecast && <span className="text-xs text-accent-gold font-bold mt-2 block">✓ Sourced from StratAxis 2026 Forecast Node</span>}
                                    </div>
                                )
                            })}
                        </div>

                        <div className="flex justify-between mt-8">
                            <button onClick={() => setStep(3)} className="btn btn-outline">Back</button>
                            <button onClick={() => setStep(5)} className="btn btn-primary text-lg px-8">Run Final Simulation <LineChartIcon className="w-5 h-5 ml-2" /></button>
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════ STEP 5: DECISION ENGINE DASHBOARD ═══════════════════════════ */}
                {step === 5 && (
                    <div className="space-y-6 animate-fade-in">
                        {renderVerdict()}

                        {/* RENTAL / COMMERCIAL DASHBOARD */}
                        {(category === 'rental' || category === 'commercial') && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {[
                                        { l: 'Net Operating Income (NOI)', v: fmt(rentalOutput.netOperatingIncome) + ' XAF', h: 'Annual' },
                                        { l: 'Total Debt Service', v: fmt(rentalOutput.annualDebtService) + ' XAF', h: financeType === 'mortgage' ? 'Annual payment' : 'No leverage' },
                                        { l: 'Cash flow After Debt', v: fmt(rentalOutput.netCashFlow) + ' XAF', h: 'Monthly: ' + fmt(rentalOutput.netCashFlow / 12) },
                                        { l: 'Total Invested Capital', v: fmt(rentalOutput.downPaymentValue + renovationCost) + ' XAF', h: 'Down Payment + Repairs' },
                                    ].map(stat => (
                                        <div key={stat.l} className="bg-white dark:bg-primary-900 p-5 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm">
                                            <p className="text-xs text-primary-500 mb-1">{stat.l}</p>
                                            <p className="text-xl font-bold text-primary-900 dark:text-white">{stat.v}</p>
                                            <p className="text-xs text-primary-400 mt-2">{stat.h}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                                    {/* Wealth Chart */}
                                    <div className="xl:col-span-2 bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm">
                                        <h3 className="font-bold text-primary-900 dark:text-white mb-6">10-Year Wealth Creation Timeline</h3>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <AreaChart data={rentalOutput.cashFlows10Yr.map((cf, i) => ({ year: i, cashFlow: cf }))}>
                                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                                <XAxis dataKey="year" tickFormatter={v => `Yr ${v}`} />
                                                <YAxis tickFormatter={v => `${(v / 1e6).toFixed(0)}M`} />
                                                <Tooltip formatter={(v: number) => fmt(v) + ' XAF'} />
                                                <defs>
                                                    <linearGradient id="cfColor" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <Area type="monotone" dataKey="cashFlow" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#cfColor)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                        <p className="text-xs text-center text-primary-500 mt-2">Projection includes anticipated rent growth and appreciation. Year 10 assumes exit sale.</p>
                                    </div>

                                    {/* Sensitivity Risk Matrix */}
                                    <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm">
                                        <h3 className="font-bold text-primary-900 dark:text-white mb-4 flex items-center gap-2">
                                            <AlertTriangle className="text-amber-500 w-5 h-5" /> Sensitivity Matrix
                                        </h3>
                                        <div className="space-y-4">
                                            {sensitivity && [
                                                { label: 'Optimistic (+5% Occ, Growth++)', m: sensitivity.optimistic, c: 'text-emerald-500 border-emerald-500/30 bg-emerald-500/5' },
                                                { label: 'Base Case (Forecasted)', m: sensitivity.base, c: 'text-primary-900 dark:text-white border-primary-200 dark:border-primary-700 bg-primary-50 dark:bg-primary-800' },
                                                { label: 'Conservative (-10% Occ, Growth--)', m: sensitivity.conservative, c: 'text-red-500 border-red-500/30 bg-red-500/5' },
                                            ].map(sc => (
                                                <div key={sc.label} className={clsx("p-3 rounded border", sc.c)}>
                                                    <p className="text-xs font-semibold mb-2">{sc.label}</p>
                                                    <div className="flex justify-between text-sm">
                                                        <span>Cash on Cash Return: <strong className="ml-1">{pct(sc.m.cashOnCashReturn)}</strong></span>
                                                        <span>IRR: <strong className="ml-1">{pct(sc.m.irr10Yr)}</strong></span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* LAND / FLIP DASHBOARD */}
                        {(category === 'land' || category === 'flip') && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { l: 'Total Invested Capital', v: fmt(category === 'land' ? landOutput.totalInvestedCapital : flipOutput.totalCostBasis) },
                                    { l: 'Projected Net Profit', v: fmt(category === 'land' ? landOutput.netProfit : flipOutput.netProfit), c: 'text-emerald-500' },
                                    { l: 'Return on Investment', v: pct(category === 'land' ? landOutput.totalROI : flipOutput.roi), c: 'text-accent-gold' }
                                ].map(stat => (
                                    <div key={stat.l} className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm">
                                        <p className="text-sm text-primary-500 mb-2">{stat.l}</p>
                                        <p className={clsx("text-3xl font-bold", stat.c || "text-primary-900 dark:text-white")}>{stat.v}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-between mt-8 pt-6 border-t border-primary-200 dark:border-primary-800">
                            <button onClick={() => setStep(4)} className="btn btn-outline">Edit Assumptions</button>
                            <button onClick={() => window.print()} className="btn btn-primary"><Download className="w-4 h-4 mr-2" /> Download Full PDF Report</button>
                        </div>
                    </div>
                )}

            </div>
        </AuthenticatedLayout>
    );
};

export default YieldEstimator;
