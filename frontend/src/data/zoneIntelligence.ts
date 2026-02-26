// ─── Zone Intelligence Data Model ────────────────────────────────────────────
// Mirrors what the backend zone_intelligence table + ML pipeline would provide.

export interface ZoneIntelligence {
    id: string;
    name: string;
    city: string;

    // ── Market Structure
    medianPricePerSqm: number;       // XAF / m²
    cityAvgPricePerSqm: number;      // XAF / m² (reference)
    priceP25: number;
    priceP75: number;
    listingCount: number;
    listingTrend3m: number;          // % change in listings over 3 months

    // ── Historical Performance
    cagr3Year: number;               // 3-year compound annual growth rate (%)
    cagr5Year: number;               // 5-year CAGR (%)
    priceHistory: { year: string; price: number }[];

    // ── Liquidity
    daysOnMarket: number;            // average DOM
    absorptionRate: number;          // % of listings that sell per month
    monthsOfSupply: number;

    // ── Risk Metrics
    volatilityIndex: number;         // normalised 0-10 (lower = more stable)
    growthInstabilityScore: number;  // standard deviation of annual growth rates
    overpricingFlag: boolean;
    overpricingPct: number;          // % above fair value (negative = undervalued)

    // ── Forward Intelligence (ML outputs)
    forecast12mLow: number;
    forecast12mBase: number;
    forecast12mHigh: number;
    forecast24mLow: number;
    forecast24mBase: number;
    forecast24mHigh: number;
    growthProbability: number;       // 0-100: probability of positive return in 12m
    forecastConfidence: 'High' | 'Medium' | 'Low';

    // ── Institutional / Macro Signal
    institutionalPressureIndex: number; // 0-100
    zonClassification: 'Expansion' | 'Mature' | 'Transitional' | 'Speculative';
    infrastructureScore: number;    // 0-10
    zoningScore: number;            // 0-10 (favourable zoning for development)

    // ── Pre-computed normalised scores (0-1)
    norm: {
        growth: number;
        forecast: number;
        liquidity: number;
        stability: number;
        institutional: number;
        undervaluation: number;
        priceLevel: number;   // inverted: lower price = higher score for affordability
    };
}

// ─── Zone Dataset ─────────────────────────────────────────────────────────────
export const ZONES: ZoneIntelligence[] = [
    {
        id: 'bonapriso',
        name: 'Bonapriso',
        city: 'Douala',
        medianPricePerSqm: 97632,
        cityAvgPricePerSqm: 78000,
        priceP25: 78000,
        priceP75: 118000,
        listingCount: 16,
        listingTrend3m: -8,
        cagr3Year: 12.1,
        cagr5Year: 10.8,
        priceHistory: [
            { year: '2021', price: 69000 }, { year: '2022', price: 78000 },
            { year: '2023', price: 87000 }, { year: '2024', price: 95000 }, { year: '2025', price: 97632 },
        ],
        daysOnMarket: 35,
        absorptionRate: 28,
        monthsOfSupply: 3.5,
        volatilityIndex: 2.8,
        growthInstabilityScore: 1.4,
        overpricingFlag: false,
        overpricingPct: 25.2,
        forecast12mLow: 98500,
        forecast12mBase: 108000,
        forecast12mHigh: 118000,
        forecast24mLow: 102000,
        forecast24mBase: 120000,
        forecast24mHigh: 138000,
        growthProbability: 84,
        forecastConfidence: 'High',
        institutionalPressureIndex: 72,
        zonClassification: 'Mature',
        infrastructureScore: 8.5,
        zoningScore: 7.2,
        norm: { growth: 0.82, forecast: 0.78, liquidity: 0.85, stability: 0.88, institutional: 0.72, undervaluation: 0.20, priceLevel: 0.25 },
    },
    {
        id: 'bastos',
        name: 'Bastos',
        city: 'Yaoundé',
        medianPricePerSqm: 124229,
        cityAvgPricePerSqm: 94000,
        priceP25: 98000,
        priceP75: 158000,
        listingCount: 12,
        listingTrend3m: -12,
        cagr3Year: 8.4,
        cagr5Year: 8.1,
        priceHistory: [
            { year: '2021', price: 98000 }, { year: '2022', price: 104000 },
            { year: '2023', price: 112000 }, { year: '2024', price: 119000 }, { year: '2025', price: 124229 },
        ],
        daysOnMarket: 25,
        absorptionRate: 40,
        monthsOfSupply: 2.5,
        volatilityIndex: 1.9,
        growthInstabilityScore: 0.8,
        overpricingFlag: true,
        overpricingPct: 32.2,
        forecast12mLow: 122000,
        forecast12mBase: 130000,
        forecast12mHigh: 139000,
        forecast24mLow: 124000,
        forecast24mBase: 138000,
        forecast24mHigh: 155000,
        growthProbability: 76,
        forecastConfidence: 'High',
        institutionalPressureIndex: 88,
        zonClassification: 'Mature',
        infrastructureScore: 9.2,
        zoningScore: 6.8,
        norm: { growth: 0.58, forecast: 0.72, liquidity: 0.95, stability: 0.94, institutional: 0.88, undervaluation: 0.05, priceLevel: 0.08 },
    },
    {
        id: 'makepe',
        name: 'Makepe',
        city: 'Douala',
        medianPricePerSqm: 52932,
        cityAvgPricePerSqm: 78000,
        priceP25: 38000,
        priceP75: 68000,
        listingCount: 15,
        listingTrend3m: 18,
        cagr3Year: 15.2,
        cagr5Year: 13.4,
        priceHistory: [
            { year: '2021', price: 28000 }, { year: '2022', price: 35000 },
            { year: '2023', price: 42000 }, { year: '2024', price: 48000 }, { year: '2025', price: 52932 },
        ],
        daysOnMarket: 52,
        absorptionRate: 18,
        monthsOfSupply: 5.8,
        volatilityIndex: 4.8,
        growthInstabilityScore: 3.2,
        overpricingFlag: false,
        overpricingPct: -32.1,
        forecast12mLow: 55000,
        forecast12mBase: 64000,
        forecast12mHigh: 76000,
        forecast24mLow: 60000,
        forecast24mBase: 78000,
        forecast24mHigh: 98000,
        growthProbability: 72,
        forecastConfidence: 'Medium',
        institutionalPressureIndex: 55,
        zonClassification: 'Expansion',
        infrastructureScore: 5.8,
        zoningScore: 8.5,
        norm: { growth: 0.95, forecast: 0.92, liquidity: 0.42, stability: 0.55, institutional: 0.55, undervaluation: 0.90, priceLevel: 0.80 },
    },
    {
        id: 'akwa',
        name: 'Akwa',
        city: 'Douala',
        medianPricePerSqm: 118500,
        cityAvgPricePerSqm: 78000,
        priceP25: 95000,
        priceP75: 145000,
        listingCount: 28,
        listingTrend3m: 5,
        cagr3Year: 10.2,
        cagr5Year: 9.6,
        priceHistory: [
            { year: '2021', price: 87000 }, { year: '2022', price: 98000 },
            { year: '2023', price: 105000 }, { year: '2024', price: 114000 }, { year: '2025', price: 118500 },
        ],
        daysOnMarket: 28,
        absorptionRate: 35,
        monthsOfSupply: 2.8,
        volatilityIndex: 2.2,
        growthInstabilityScore: 1.1,
        overpricingFlag: true,
        overpricingPct: 52.0,
        forecast12mLow: 118000,
        forecast12mBase: 126000,
        forecast12mHigh: 134000,
        forecast24mLow: 120000,
        forecast24mBase: 136000,
        forecast24mHigh: 152000,
        growthProbability: 79,
        forecastConfidence: 'High',
        institutionalPressureIndex: 82,
        zonClassification: 'Mature',
        infrastructureScore: 9.0,
        zoningScore: 5.5,
        norm: { growth: 0.70, forecast: 0.68, liquidity: 0.92, stability: 0.92, institutional: 0.82, undervaluation: 0.02, priceLevel: 0.09 },
    },
    {
        id: 'nlongkak',
        name: 'Nlongkak',
        city: 'Yaoundé',
        medianPricePerSqm: 68000,
        cityAvgPricePerSqm: 94000,
        priceP25: 52000,
        priceP75: 84000,
        listingCount: 22,
        listingTrend3m: 12,
        cagr3Year: 13.8,
        cagr5Year: 11.9,
        priceHistory: [
            { year: '2021', price: 44000 }, { year: '2022', price: 52000 },
            { year: '2023', price: 58000 }, { year: '2024', price: 64000 }, { year: '2025', price: 68000 },
        ],
        daysOnMarket: 39,
        absorptionRate: 22,
        monthsOfSupply: 4.2,
        volatilityIndex: 3.5,
        growthInstabilityScore: 2.1,
        overpricingFlag: false,
        overpricingPct: -27.7,
        forecast12mLow: 70000,
        forecast12mBase: 80000,
        forecast12mHigh: 92000,
        forecast24mLow: 74000,
        forecast24mBase: 92000,
        forecast24mHigh: 112000,
        growthProbability: 78,
        forecastConfidence: 'Medium',
        institutionalPressureIndex: 62,
        zonClassification: 'Expansion',
        infrastructureScore: 6.5,
        zoningScore: 7.8,
        norm: { growth: 0.88, forecast: 0.88, liquidity: 0.62, stability: 0.70, institutional: 0.62, undervaluation: 0.82, priceLevel: 0.65 },
    },
    {
        id: 'essos',
        name: 'Essos',
        city: 'Yaoundé',
        medianPricePerSqm: 55000,
        cityAvgPricePerSqm: 94000,
        priceP25: 40000,
        priceP75: 72000,
        listingCount: 31,
        listingTrend3m: 22,
        cagr3Year: 17.5,
        cagr5Year: 14.2,
        priceHistory: [
            { year: '2021', price: 28000 }, { year: '2022', price: 36000 },
            { year: '2023', price: 44000 }, { year: '2024', price: 50000 }, { year: '2025', price: 55000 },
        ],
        daysOnMarket: 47,
        absorptionRate: 15,
        monthsOfSupply: 5.1,
        volatilityIndex: 5.5,
        growthInstabilityScore: 4.1,
        overpricingFlag: false,
        overpricingPct: -41.5,
        forecast12mLow: 58000,
        forecast12mBase: 70000,
        forecast12mHigh: 85000,
        forecast24mLow: 65000,
        forecast24mBase: 88000,
        forecast24mHigh: 112000,
        growthProbability: 68,
        forecastConfidence: 'Medium',
        institutionalPressureIndex: 48,
        zonClassification: 'Speculative',
        infrastructureScore: 4.8,
        zoningScore: 9.0,
        norm: { growth: 0.99, forecast: 0.95, liquidity: 0.35, stability: 0.42, institutional: 0.48, undervaluation: 0.95, priceLevel: 0.88 },
    },
    {
        id: 'logbaba',
        name: 'Logbaba',
        city: 'Douala',
        medianPricePerSqm: 41000,
        cityAvgPricePerSqm: 78000,
        priceP25: 30000,
        priceP75: 54000,
        listingCount: 9,
        listingTrend3m: 8,
        cagr3Year: 11.6,
        cagr5Year: 10.1,
        priceHistory: [
            { year: '2021', price: 26000 }, { year: '2022', price: 30000 },
            { year: '2023', price: 35000 }, { year: '2024', price: 38000 }, { year: '2025', price: 41000 },
        ],
        daysOnMarket: 48,
        absorptionRate: 12,
        monthsOfSupply: 5.2,
        volatilityIndex: 3.2,
        growthInstabilityScore: 2.0,
        overpricingFlag: false,
        overpricingPct: -47.4,
        forecast12mLow: 43000,
        forecast12mBase: 50000,
        forecast12mHigh: 60000,
        forecast24mLow: 48000,
        forecast24mBase: 60000,
        forecast24mHigh: 76000,
        growthProbability: 71,
        forecastConfidence: 'Low',
        institutionalPressureIndex: 42,
        zonClassification: 'Transitional',
        infrastructureScore: 5.2,
        zoningScore: 7.5,
        norm: { growth: 0.78, forecast: 0.78, liquidity: 0.30, stability: 0.72, institutional: 0.42, undervaluation: 0.92, priceLevel: 0.92 },
    },
    {
        id: 'bonanjo',
        name: 'Bonanjo',
        city: 'Douala',
        medianPricePerSqm: 108200,
        cityAvgPricePerSqm: 78000,
        priceP25: 88000,
        priceP75: 132000,
        listingCount: 12,
        listingTrend3m: -5,
        cagr3Year: 9.8,
        cagr5Year: 9.1,
        priceHistory: [
            { year: '2021', price: 80000 }, { year: '2022', price: 88000 },
            { year: '2023', price: 97000 }, { year: '2024', price: 104000 }, { year: '2025', price: 108200 },
        ],
        daysOnMarket: 32,
        absorptionRate: 32,
        monthsOfSupply: 3.1,
        volatilityIndex: 2.0,
        growthInstabilityScore: 0.9,
        overpricingFlag: true,
        overpricingPct: 38.7,
        forecast12mLow: 108000,
        forecast12mBase: 116000,
        forecast12mHigh: 124000,
        forecast24mLow: 112000,
        forecast24mBase: 126000,
        forecast24mHigh: 142000,
        growthProbability: 75,
        forecastConfidence: 'High',
        institutionalPressureIndex: 78,
        zonClassification: 'Mature',
        infrastructureScore: 8.8,
        zoningScore: 5.8,
        norm: { growth: 0.66, forecast: 0.62, liquidity: 0.90, stability: 0.93, institutional: 0.78, undervaluation: 0.08, priceLevel: 0.12 },
    },
];

export const ZONE_MAP: Record<string, ZoneIntelligence> = Object.fromEntries(ZONES.map(z => [z.id, z]));
