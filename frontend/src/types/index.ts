// Land Price Intelligence Types
export interface LandPriceNeighborhood {
    city: string;
    neighborhood: string;
    median_land_price_per_sqm_xaf: number;
    p25_land_price_per_sqm_xaf: number;
    p75_land_price_per_sqm_xaf: number;
    listing_count: number;
    data_confidence_flag: 'High' | 'Medium' | 'Low';
}

export interface LandPriceData {
    metadata: {
        generated_at: string;
        total_neighborhoods: number;
        cities: string[];
        total_listings_analyzed: number;
        data_source: string;
    };
    neighborhoods: LandPriceNeighborhood[];
}

// Rental Intelligence Types
export interface RentalData {
    median_monthly_rent_xaf: number;
    p25_monthly_rent_xaf: number;
    p75_monthly_rent_xaf: number;
    median_rent_per_sqm: number | null;
    listing_count: number;
    rent_volatility_score: number;
    data_confidence: 'high' | 'medium' | 'low';
}

export interface RentalIntelligence {
    [city: string]: {
        [neighborhood: string]: {
            [housingType: string]: {
                [year: string]: RentalData;
            };
        };
    };
}

// User Types
export interface User {
    id: string;
    email: string;
    role: 'FREE_USER' | 'PAID_USER' | 'INSTITUTIONAL' | 'ADMIN';
    first_name?: string;
    last_name?: string;
    created_at: string;
}

// Auth Types
export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    user_type: 'individual' | 'institution';
    intended_use: 'research' | 'investment' | 'policy';
}

// Map Types
export interface MapBounds {
    north: number;
    south: number;
    east: number;
    west: number;
}

export interface NeighborhoodCoordinates {
    lat: number;
    lng: number;
    name: string;
    city: string;
}

// Analytics Types
export interface MarketSnapshot {
    land_price_index: number;
    rent_index: number;
    volatility_indicator: number;
    last_updated: string;
}

export interface TrendData {
    period: string;
    value: number;
    change_percentage: number;
}

// Watchlist Types
export interface WatchlistItem {
    id: string;
    user_id: string;
    type: 'neighborhood' | 'property_type';
    city: string;
    neighborhood?: string;
    property_type?: string;
    created_at: string;
}

// Comparison Types
export interface ComparisonItem {
    city: string;
    neighborhood: string;
    median_land_price: number;
    median_rent: number;
    growth_rate: number;
    volatility: number;
    confidence: string;
}

// Scenario Types
export interface ScenarioInput {
    land_price: number;
    expected_rent: number;
    investment_horizon_years: number;
    scenario_type: 'conservative' | 'moderate' | 'aggressive';
}

export interface ScenarioResult {
    gross_yield: number;
    net_yield: number;
    roi_projection: number;
    break_even_years: number;
}

// Insight Types
export interface SmartInsight {
    id: string;
    title: string;
    description: string;
    confidence_score: number;
    time_relevance: string;
    supporting_data: any;
    category: 'opportunity' | 'risk' | 'trend';
}

// Blog/Article Types
export interface Article {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    author: string;
    published_date: string;
    category: 'market_report' | 'deep_dive' | 'analysis';
    image_url?: string;
    read_time_minutes: number;
}

// Confidence Score Mapping
export const CONFIDENCE_SCORE_MAP = {
    High: 5.0,
    Medium: 3.0,
    Low: 1.0,
    high: 5.0,
    medium: 3.0,
    low: 1.0,
} as const;

// City Coordinates
export const CITY_COORDINATES = {
    Douala: { lat: 4.0511, lng: 9.7679 },
    Yaoundé: { lat: 3.8480, lng: 11.5021 },
} as const;
