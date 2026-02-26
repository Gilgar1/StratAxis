import { ZoneIntelligence } from '../data/zoneIntelligence';

// ─── Strategy Definitions ─────────────────────────────────────────────────────

export type Strategy =
    | 'long_term'
    | 'short_flip'
    | 'rental'
    | 'land_banking'
    | 'balanced';

export interface StrategyWeights {
    forecast: number;
    growth: number;
    liquidity: number;
    stability: number;
    institutional: number;
    undervaluation: number;
    priceLevel: number;
}

export interface StrategyConfig {
    id: Strategy;
    label: string;
    description: string;
    icon: string;
    weights: StrategyWeights;
}

export const STRATEGIES: StrategyConfig[] = [
    {
        id: 'long_term',
        label: 'Long-Term Appreciation',
        description: 'Maximize capital gains over 5–10 years. Favours zones with strong forecast & institutional tailwinds.',
        icon: '📈',
        weights: { forecast: 0.35, institutional: 0.25, liquidity: 0.15, stability: 0.15, growth: 0.10, undervaluation: 0.00, priceLevel: 0.00 },
    },
    {
        id: 'short_flip',
        label: 'Short-Term Flip (1–3 yr)',
        description: 'Buy low, sell quickly. Prioritises liquidity, momentum, and undervalued entry points.',
        icon: '⚡',
        weights: { liquidity: 0.35, growth: 0.30, undervaluation: 0.20, forecast: 0.10, stability: 0.05, institutional: 0.00, priceLevel: 0.00 },
    },
    {
        id: 'rental',
        label: 'Rental Income',
        description: 'Stable monthly cashflow. Prioritises liquidity, price stability, and affordable entry.',
        icon: '🏠',
        weights: { liquidity: 0.30, stability: 0.25, priceLevel: 0.20, growth: 0.15, forecast: 0.10, undervaluation: 0.00, institutional: 0.00 },
    },
    {
        id: 'land_banking',
        label: 'Land Banking (10+ yr)',
        description: 'Secure affordable land in growth corridors. Prioritises institutional pressure and undervaluation.',
        icon: '🏗️',
        weights: { institutional: 0.35, undervaluation: 0.30, forecast: 0.20, stability: 0.10, growth: 0.05, liquidity: 0.00, priceLevel: 0.00 },
    },
    {
        id: 'balanced',
        label: 'Balanced',
        description: 'Equal weight across all signals. Suitable for diversified portfolios.',
        icon: '⚖️',
        weights: { forecast: 0.20, growth: 0.20, liquidity: 0.15, stability: 0.15, institutional: 0.15, undervaluation: 0.10, priceLevel: 0.05 },
    },
];

// ─── Scoring Engine ───────────────────────────────────────────────────────────

export type OpportunityTag =
    | 'Early Growth'
    | 'Overpriced'
    | 'Stabilized Prime'
    | 'Infrastructure Driven'
    | 'Speculative Upside'
    | 'Low Liquidity Risk'
    | 'Undervalued Entry'
    | 'High Cashflow Potential'
    | 'Institutional Momentum';

export interface ZoneScore {
    zone: ZoneIntelligence;
    compositeScore: number;
    rank: number;
    breakdown: {
        forecast: number;
        growth: number;
        liquidity: number;
        stability: number;
        institutional: number;
        undervaluation: number;
        priceLevel: number;
    };
    growthOutlook: 'Strong' | 'Moderate' | 'Weak';
    riskLevel: 'Low' | 'Medium' | 'High';
    liquidityLevel: 'High' | 'Medium' | 'Low';
    institutionalLevel: 'Strong' | 'Moderate' | 'Weak';
    tags: OpportunityTag[];
}

function computeTags(z: ZoneIntelligence): OpportunityTag[] {
    const tags: OpportunityTag[] = [];
    if (z.cagr3Year > 14 && z.medianPricePerSqm < z.cityAvgPricePerSqm) tags.push('Early Growth');
    if (z.overpricingFlag && z.overpricingPct > 30) tags.push('Overpriced');
    if (z.volatilityIndex < 2.5 && z.cagr3Year > 8) tags.push('Stabilized Prime');
    if (z.institutionalPressureIndex > 70) tags.push('Institutional Momentum');
    if (z.institutionalPressureIndex > 60 && z.zonClassification !== 'Mature') tags.push('Infrastructure Driven');
    if (z.zonClassification === 'Speculative') tags.push('Speculative Upside');
    if (z.monthsOfSupply > 5.5) tags.push('Low Liquidity Risk');
    if (z.overpricingPct < -25) tags.push('Undervalued Entry');
    if (z.absorptionRate > 25 && z.medianPricePerSqm < z.cityAvgPricePerSqm) tags.push('High Cashflow Potential');
    return tags;
}

export function computeScores(zones: ZoneIntelligence[], strategy: Strategy): ZoneScore[] {
    const cfg = STRATEGIES.find(s => s.id === strategy)!;
    const w = cfg.weights;

    const scored: ZoneScore[] = zones.map(zone => {
        const n = zone.norm;
        const stabilityScore = 1 - zone.growthInstabilityScore / 10;

        const raw =
            w.forecast * n.forecast +
            w.growth * n.growth +
            w.liquidity * n.liquidity +
            w.stability * stabilityScore +
            w.institutional * n.institutional +
            w.undervaluation * n.undervaluation +
            w.priceLevel * n.priceLevel;

        const compositeScore = Math.round(Math.min(100, Math.max(0, raw * 100)));

        return {
            zone,
            compositeScore,
            rank: 0,
            breakdown: {
                forecast: Math.round(n.forecast * w.forecast * 100),
                growth: Math.round(n.growth * w.growth * 100),
                liquidity: Math.round(n.liquidity * w.liquidity * 100),
                stability: Math.round(stabilityScore * w.stability * 100),
                institutional: Math.round(n.institutional * w.institutional * 100),
                undervaluation: Math.round(n.undervaluation * w.undervaluation * 100),
                priceLevel: Math.round(n.priceLevel * w.priceLevel * 100),
            },
            growthOutlook:
                zone.growthProbability >= 78 ? 'Strong' :
                    zone.growthProbability >= 60 ? 'Moderate' : 'Weak',
            riskLevel:
                zone.volatilityIndex < 3 ? 'Low' :
                    zone.volatilityIndex < 5 ? 'Medium' : 'High',
            liquidityLevel:
                zone.absorptionRate >= 30 ? 'High' :
                    zone.absorptionRate >= 18 ? 'Medium' : 'Low',
            institutionalLevel:
                zone.institutionalPressureIndex >= 70 ? 'Strong' :
                    zone.institutionalPressureIndex >= 45 ? 'Moderate' : 'Weak',
            tags: computeTags(zone),
        };
    });

    scored.sort((a, b) => b.compositeScore - a.compositeScore);
    scored.forEach((s, i) => { s.rank = i + 1; });
    return scored;
}

// ─── Capital Allocation Simulator ────────────────────────────────────────────

export interface AllocationResult {
    zoneId: string;
    zoneName: string;
    rank: number;
    compositeScore: number;
    year1: { low: number; base: number; high: number };
    year3: { low: number; base: number; high: number };
    year5: { low: number; base: number; high: number };
    riskAdjustedReturn: number;
}

function project(
    initial: number,
    cagr: number,
    volatility: number,
    years: number,
): { low: number; base: number; high: number } {
    const base = initial * Math.pow(1 + cagr / 100, years);
    const spread = volatility / 10;
    return {
        low: Math.round(base * (1 - spread * Math.sqrt(years))),
        base: Math.round(base),
        high: Math.round(base * (1 + spread * Math.sqrt(years))),
    };
}

export function simulateAllocation(
    scores: ZoneScore[],
    investmentXAF: number,
): AllocationResult[] {
    return scores.map(s => {
        const z = s.zone;
        const implied1yCagr = ((z.forecast12mBase - z.medianPricePerSqm) / z.medianPricePerSqm) * 100;
        const y1 = project(investmentXAF, implied1yCagr, z.volatilityIndex, 1);
        const y3 = project(investmentXAF, z.cagr3Year, z.volatilityIndex, 3);
        const y5 = project(investmentXAF, z.cagr5Year, z.volatilityIndex, 5);
        const riskAdjustedReturn =
            Math.round(((y5.base - investmentXAF) / investmentXAF / z.volatilityIndex) * 100) / 100;
        return {
            zoneId: z.id,
            zoneName: `${z.name} (${z.city})`,
            rank: s.rank,
            compositeScore: s.compositeScore,
            year1: y1,
            year3: y3,
            year5: y5,
            riskAdjustedReturn,
        };
    });
}
