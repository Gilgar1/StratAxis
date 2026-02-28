/**
 * StratAxis – Centralized Market Data by Property Type & Land Classification
 * Used across Core Intelligence and Market Metrics pages.
 *
 * Land Types:   Urban, Suburban, Rural
 * Property Types (Rental): Simple Room, Modern Room, Room & Parlor, 2BR Apartment, 3BR Apartment, Villa
 */

// ─── Land Price Data by Classification ───────────────────────────────────────

export type LandType = 'Urban' | 'Suburban' | 'Rural';
export type City = 'Douala' | 'Yaoundé';

export interface LandPriceByType {
    city: City;
    landType: LandType;
    avgPricePerSqm: number;
    medianPricePerSqm: number;
    lowRange: number;
    highRange: number;
    yoyChange: number;          // % year-over-year
    appreciation5yr: number;    // 5-year avg annual %
    sampleSize: number;
    trend: number[];            // last 5 years index (2021–2025)
}

export const LAND_PRICES: LandPriceByType[] = [
    // ─── Douala ──────────────────────────────────
    { city: 'Douala', landType: 'Urban', avgPricePerSqm: 135000, medianPricePerSqm: 128000, lowRange: 85000, highRange: 220000, yoyChange: 14.2, appreciation5yr: 11.8, sampleSize: 142, trend: [82000, 95000, 108000, 118000, 135000] },
    { city: 'Douala', landType: 'Suburban', avgPricePerSqm: 52000, medianPricePerSqm: 48000, lowRange: 28000, highRange: 85000, yoyChange: 18.5, appreciation5yr: 14.2, sampleSize: 98, trend: [25000, 32000, 38000, 44000, 52000] },
    { city: 'Douala', landType: 'Rural', avgPricePerSqm: 12000, medianPricePerSqm: 10000, lowRange: 4000, highRange: 25000, yoyChange: 8.1, appreciation5yr: 6.5, sampleSize: 45, trend: [7500, 8500, 9800, 11100, 12000] },

    // ─── Yaoundé ─────────────────────────────────
    { city: 'Yaoundé', landType: 'Urban', avgPricePerSqm: 148000, medianPricePerSqm: 142000, lowRange: 95000, highRange: 250000, yoyChange: 9.8, appreciation5yr: 8.9, sampleSize: 135, trend: [98000, 110000, 122000, 135000, 148000] },
    { city: 'Yaoundé', landType: 'Suburban', avgPricePerSqm: 45000, medianPricePerSqm: 42000, lowRange: 22000, highRange: 78000, yoyChange: 15.4, appreciation5yr: 12.1, sampleSize: 88, trend: [22000, 28000, 34000, 39000, 45000] },
    { city: 'Yaoundé', landType: 'Rural', avgPricePerSqm: 8500, medianPricePerSqm: 7500, lowRange: 3000, highRange: 18000, yoyChange: 6.3, appreciation5yr: 5.2, sampleSize: 38, trend: [5800, 6500, 7200, 8000, 8500] },
];

// ─── Rental Data by Property Type ────────────────────────────────────────────

export type PropertyType = 'Simple Room' | 'Modern Room' | 'Room & Parlor' | '2BR Apartment' | '3BR Apartment' | 'Villa';

export interface RentByPropertyType {
    city: City;
    propertyType: PropertyType;
    avgMonthlyRent: number;
    medianMonthlyRent: number;
    lowRange: number;
    highRange: number;
    yoyChange: number;
    avgPropertyValue: number;   // for yield calculation
    grossYield: number;         // computed: (rent*12 / propertyValue) * 100
    sampleSize: number;
}

export const RENT_BY_TYPE: RentByPropertyType[] = [
    // ─── Douala ──────────────────────────────────
    { city: 'Douala', propertyType: 'Simple Room', avgMonthlyRent: 25000, medianMonthlyRent: 22000, lowRange: 15000, highRange: 35000, yoyChange: 4.2, avgPropertyValue: 3500000, grossYield: 8.6, sampleSize: 85 },
    { city: 'Douala', propertyType: 'Modern Room', avgMonthlyRent: 45000, medianMonthlyRent: 42000, lowRange: 30000, highRange: 65000, yoyChange: 5.8, avgPropertyValue: 6500000, grossYield: 8.3, sampleSize: 72 },
    { city: 'Douala', propertyType: 'Room & Parlor', avgMonthlyRent: 75000, medianMonthlyRent: 70000, lowRange: 50000, highRange: 100000, yoyChange: 6.1, avgPropertyValue: 12000000, grossYield: 7.5, sampleSize: 95 },
    { city: 'Douala', propertyType: '2BR Apartment', avgMonthlyRent: 150000, medianMonthlyRent: 140000, lowRange: 100000, highRange: 250000, yoyChange: 7.4, avgPropertyValue: 28000000, grossYield: 6.4, sampleSize: 110 },
    { city: 'Douala', propertyType: '3BR Apartment', avgMonthlyRent: 285000, medianMonthlyRent: 270000, lowRange: 180000, highRange: 450000, yoyChange: 5.2, avgPropertyValue: 47500000, grossYield: 7.2, sampleSize: 68 },
    { city: 'Douala', propertyType: 'Villa', avgMonthlyRent: 550000, medianMonthlyRent: 500000, lowRange: 350000, highRange: 1200000, yoyChange: 3.8, avgPropertyValue: 95000000, grossYield: 6.9, sampleSize: 32 },

    // ─── Yaoundé ─────────────────────────────────
    { city: 'Yaoundé', propertyType: 'Simple Room', avgMonthlyRent: 20000, medianMonthlyRent: 18000, lowRange: 12000, highRange: 30000, yoyChange: 3.5, avgPropertyValue: 3200000, grossYield: 7.5, sampleSize: 78 },
    { city: 'Yaoundé', propertyType: 'Modern Room', avgMonthlyRent: 40000, medianMonthlyRent: 38000, lowRange: 25000, highRange: 60000, yoyChange: 4.8, avgPropertyValue: 6000000, grossYield: 8.0, sampleSize: 65 },
    { city: 'Yaoundé', propertyType: 'Room & Parlor', avgMonthlyRent: 70000, medianMonthlyRent: 65000, lowRange: 45000, highRange: 95000, yoyChange: 5.5, avgPropertyValue: 11500000, grossYield: 7.3, sampleSize: 88 },
    { city: 'Yaoundé', propertyType: '2BR Apartment', avgMonthlyRent: 165000, medianMonthlyRent: 155000, lowRange: 110000, highRange: 280000, yoyChange: 6.8, avgPropertyValue: 32000000, grossYield: 6.2, sampleSize: 102 },
    { city: 'Yaoundé', propertyType: '3BR Apartment', avgMonthlyRent: 310000, medianMonthlyRent: 295000, lowRange: 200000, highRange: 500000, yoyChange: 4.5, avgPropertyValue: 54800000, grossYield: 6.8, sampleSize: 55 },
    { city: 'Yaoundé', propertyType: 'Villa', avgMonthlyRent: 650000, medianMonthlyRent: 580000, lowRange: 400000, highRange: 1500000, yoyChange: 3.2, avgPropertyValue: 110000000, grossYield: 7.1, sampleSize: 28 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const LAND_TYPES: LandType[] = ['Urban', 'Suburban', 'Rural'];
export const PROPERTY_TYPES: PropertyType[] = ['Simple Room', 'Modern Room', 'Room & Parlor', '2BR Apartment', '3BR Apartment', 'Villa'];
export const CITIES: City[] = ['Douala', 'Yaoundé'];
export const YEARS = ['2021', '2022', '2023', '2024', '2025'];

export const LAND_TYPE_COLORS: Record<LandType, string> = {
    Urban: '#D4AF37',
    Suburban: '#3b82f6',
    Rural: '#10b981',
};

export const PROPERTY_TYPE_COLORS: Record<PropertyType, string> = {
    'Simple Room': '#10b981',
    'Modern Room': '#3b82f6',
    'Room & Parlor': '#8b5cf6',
    '2BR Apartment': '#D4AF37',
    '3BR Apartment': '#f59e0b',
    'Villa': '#ef4444',
};

export const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });
