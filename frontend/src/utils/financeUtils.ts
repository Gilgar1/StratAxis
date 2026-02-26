/**
 * Financial utility functions for the StratAxis Smart Yield Estimator
 */

// ─── Basic Financial Math ─────────────────────────────────────────────────────

export function pmt(ratePerPeriod: number, numberOfPeriods: number, presentValue: number): number {
    if (ratePerPeriod === 0) return presentValue / numberOfPeriods;
    return (presentValue * ratePerPeriod * Math.pow(1 + ratePerPeriod, numberOfPeriods)) /
        (Math.pow(1 + ratePerPeriod, numberOfPeriods) - 1);
}

export function npv(discountRate: number, cashFlows: number[]): number {
    return cashFlows.reduce((acc, val, i) => acc + val / Math.pow(1 + discountRate, i), 0);
}

export function irr(cashFlows: number[], guess = 0.1, maxIter = 1000): number {
    let rate = guess;
    for (let i = 0; i < maxIter; i++) {
        let npvVal = 0;
        let dNpv = 0;
        for (let j = 0; j < cashFlows.length; j++) {
            npvVal += cashFlows[j] / Math.pow(1 + rate, j);
            dNpv -= (j * cashFlows[j]) / Math.pow(1 + rate, j + 1);
        }
        const newRate = rate - npvVal / dNpv;
        if (Math.abs(newRate - rate) < 1e-6) return newRate;
        rate = newRate;
    }
    return rate; // or fallback if not converged
}

export function cagr(beginValue: number, endValue: number, years: number): number {
    if (beginValue <= 0 || years <= 0) return 0;
    return Math.pow(endValue / beginValue, 1 / years) - 1;
}

// ─── Rental Property Model ────────────────────────────────────────────────────

export interface RentalInputs {
    propertyValue: number;       // Acquisition + Renovation
    monthlyRent: number;
    occupancyRate: number;       // 0-1
    maintenancePct: number;      // 0-1 (of gross rent)
    managementPct: number;       // 0-1 (of gross rent)
    insurance: number;           // Annual flat
    taxes: number;               // Annual flat
    rentGrowthRate: number;      // 0-1
    appreciationRate: number;    // 0-1

    // Financing
    isMortgage: boolean;
    downPaymentPct: number;      // 0-1
    loanInterestRate: number;    // 0-1
    loanTermYears: number;
}

export interface RentalOutputs {
    grossPotentialIncome: number;
    effectiveGrossIncome: number;
    totalOperatingExpenses: number;
    netOperatingIncome: number;

    loanAmount: number;
    downPaymentValue: number;
    annualDebtService: number;
    netCashFlow: number;

    grossYield: number;
    netYield: number;
    cashOnCashReturn: number;
    dscr: number;

    // Projections
    year5Wealth: number;
    year10Wealth: number;
    cashFlows10Yr: number[];
    irr10Yr: number;
    paybackPeriod: number;
}

export function calculateRentalModel(inputs: RentalInputs): RentalOutputs {
    const {
        propertyValue, monthlyRent, occupancyRate, maintenancePct, managementPct,
        insurance, taxes, rentGrowthRate, appreciationRate,
        isMortgage, downPaymentPct, loanInterestRate, loanTermYears
    } = inputs;

    // Year 1 Metrics
    const grossPotentialIncome = monthlyRent * 12;
    const effectiveGrossIncome = grossPotentialIncome * occupancyRate;

    const totalOperatingExpenses = (effectiveGrossIncome * maintenancePct) +
        (effectiveGrossIncome * managementPct) +
        insurance + taxes;

    const netOperatingIncome = effectiveGrossIncome - totalOperatingExpenses;

    // Financing
    let loanAmount = 0;
    let downPaymentValue = propertyValue;
    let annualDebtService = 0;

    if (isMortgage) {
        downPaymentValue = propertyValue * downPaymentPct;
        loanAmount = propertyValue - downPaymentValue;
        const monthlyRate = loanInterestRate / 12;
        const numMonths = loanTermYears * 12;
        const monthlyPayment = pmt(monthlyRate, numMonths, loanAmount);
        annualDebtService = monthlyPayment * 12;
    }

    const netCashFlow = netOperatingIncome - annualDebtService;

    // Yields & Ratios
    const grossYield = grossPotentialIncome / propertyValue;
    const netYield = netOperatingIncome / propertyValue;
    const cashOnCashReturn = netCashFlow / downPaymentValue;
    const dscr = annualDebtService > 0 ? netOperatingIncome / annualDebtService : 0;

    // 10-Year Projections for Wealth & Payback & IRR
    const cashFlows10Yr: number[] = [-downPaymentValue];
    let currentPropertyValue = propertyValue;
    let currentMonthlyRent = monthlyRent;
    let cumulativeCashFlow = 0;
    let paybackPeriod = 0;
    let remainingPrincipal = loanAmount;

    for (let year = 1; year <= 10; year++) {
        const yrGpi = currentMonthlyRent * 12;
        const yrEgi = yrGpi * occupancyRate;
        const yrOpex = (yrEgi * maintenancePct) + (yrEgi * managementPct) + insurance + taxes;
        const yrNoi = yrEgi - yrOpex;

        // Mortgage interest vs principal deduction
        let principalPaid = 0;
        if (isMortgage && remainingPrincipal > 0) {
            // Simplified annual amortization
            const interestPaid = remainingPrincipal * loanInterestRate;
            principalPaid = annualDebtService - interestPaid;
            remainingPrincipal -= principalPaid;
            if (remainingPrincipal < 0) remainingPrincipal = 0;
        }

        const yrNetCashFlow = yrNoi - annualDebtService;
        cumulativeCashFlow += yrNetCashFlow;

        if (paybackPeriod === 0 && cumulativeCashFlow >= downPaymentValue) {
            paybackPeriod = year; // Rough payback year
        }

        // Terminal value flow for IRR (assuming sale at end of year)
        let flow = yrNetCashFlow;
        if (year === 10) {
            const saleProceeds = currentPropertyValue - remainingPrincipal;
            flow += saleProceeds;
        }
        cashFlows10Yr.push(flow);

        // Grow for next year
        currentMonthlyRent *= (1 + rentGrowthRate);
        currentPropertyValue *= (1 + appreciationRate);
    }

    const year5Value = propertyValue * Math.pow(1 + appreciationRate, 5);
    let year5Debt = loanAmount;
    if (isMortgage) {
        // Approx year 5 debt balance
        for (let i = 0; i < 5; i++) {
            const int = year5Debt * loanInterestRate;
            year5Debt -= (annualDebtService - int);
        }
    }
    const year5Wealth = (year5Value - year5Debt) - downPaymentValue; // cumulative equity gain

    const year10Value = currentPropertyValue; // already at year 10
    const year10Wealth = (year10Value - remainingPrincipal) - downPaymentValue;

    const irr10Yr = irr(cashFlows10Yr);

    return {
        grossPotentialIncome,
        effectiveGrossIncome,
        totalOperatingExpenses,
        netOperatingIncome,
        loanAmount,
        downPaymentValue,
        annualDebtService,
        netCashFlow,
        grossYield,
        netYield,
        cashOnCashReturn,
        dscr,
        year5Wealth,
        year10Wealth,
        cashFlows10Yr,
        irr10Yr,
        paybackPeriod
    };
}

// ─── Land Investment Model ────────────────────────────────────────────────────

export interface LandInputs {
    purchasePrice: number;
    holdingPeriodYears: number;
    annualAppreciationRate: number;
    annualHoldingCosts: number; // taxes, maintenance, fencing

    isMortgage: boolean;
    downPaymentPct: number;
    loanInterestRate: number;
    loanTermYears: number;
}

export interface LandOutputs {
    endValue: number;
    totalHoldingCosts: number;
    totalInterestPaid: number;
    totalInvestedCapital: number;
    capitalGain: number;
    netProfit: number;
    cagrValue: number;
    totalROI: number;
}

export function calculateLandModel(inputs: LandInputs): LandOutputs {
    const { purchasePrice, holdingPeriodYears, annualAppreciationRate, annualHoldingCosts,
        isMortgage, downPaymentPct, loanInterestRate, loanTermYears } = inputs;

    const endValue = purchasePrice * Math.pow(1 + annualAppreciationRate, holdingPeriodYears);
    const totalHoldingCosts = annualHoldingCosts * holdingPeriodYears;

    let downPayment = purchasePrice;
    let loanAmount = 0;
    let totalInterestPaid = 0;

    if (isMortgage) {
        downPayment = purchasePrice * downPaymentPct;
        loanAmount = purchasePrice - downPayment;
        const monthlyRate = loanInterestRate / 12;
        const numMonths = loanTermYears * 12;
        const pmtVal = pmt(monthlyRate, numMonths, loanAmount);
        // Interest paid over the holding period (cap at loan term)
        const effectiveYears = Math.min(holdingPeriodYears, loanTermYears);
        let bal = loanAmount;
        for (let m = 1; m <= effectiveYears * 12; m++) {
            const int = bal * monthlyRate;
            totalInterestPaid += int;
            bal -= (pmtVal - int);
        }
    }

    const totalInvestedCapital = downPayment + totalHoldingCosts + totalInterestPaid;

    const netProfit = endValue - purchasePrice - totalHoldingCosts - totalInterestPaid;
    const capitalGain = endValue - purchasePrice;
    const cagrValue = cagr(totalInvestedCapital, totalInvestedCapital + netProfit, holdingPeriodYears);
    const totalROI = netProfit / totalInvestedCapital;

    return {
        endValue,
        totalHoldingCosts,
        totalInterestPaid,
        totalInvestedCapital,
        capitalGain,
        netProfit,
        cagrValue,
        totalROI
    };
}

// ─── Flip Model ─────────────────────────────────────────────────────────────
// (Short-term resale)

export interface FlipInputs {
    purchasePrice: number;
    renovationBudget: number;
    renovationMonths: number;
    holdingMonths: number; // Total months to sell after reno
    arv: number; // After Repair Value

    isMortgage: boolean;
    downPaymentPct: number;
    loanInterestRate: number; // usually higher for hard money
}

export function calculateFlipModel(inputs: FlipInputs) {
    const { purchasePrice, renovationBudget, renovationMonths, holdingMonths, arv,
        isMortgage, downPaymentPct, loanInterestRate } = inputs;

    const totalCostBasis = purchasePrice + renovationBudget;
    let downPayment = totalCostBasis;
    let interestPaid = 0;

    const totalMonths = renovationMonths + holdingMonths;

    if (isMortgage) {
        downPayment = totalCostBasis * downPaymentPct;
        const loanAmount = totalCostBasis - downPayment;
        // Simple interest for flip loans (hard money style)
        interestPaid = loanAmount * (loanInterestRate / 12) * totalMonths;
    }

    const closingCosts = arv * 0.05; // 5% agent/closing
    const netProfit = arv - totalCostBasis - interestPaid - closingCosts;
    const roi = netProfit / (downPayment + interestPaid);

    // Annualized return
    const annualizedRoi = roi * (12 / totalMonths);

    return {
        totalCostBasis,
        interestPaid,
        closingCosts,
        arv,
        netProfit,
        roi,
        annualizedRoi,
        totalMonths
    };
}
