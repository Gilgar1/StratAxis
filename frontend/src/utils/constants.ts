// Cities
export const CITIES = ['Douala', 'Yaoundé'] as const;
export type City = typeof CITIES[number];

// Property Types
export const PROPERTY_TYPES = ['apartment', 'house', 'land', 'commercial'] as const;
export type PropertyType = typeof PROPERTY_TYPES[number];

// Housing Types (for rentals)
export const HOUSING_TYPES = ['studio', 'one_bedroom', 'two_bedroom', 'three_bedroom', 'villa_house', 'unknown'] as const;
export type HousingType = typeof HOUSING_TYPES[number];

// User Roles
export const USER_ROLES = ['FREE_USER', 'PAID_USER', 'ADMIN'] as const;
export type UserRole = typeof USER_ROLES[number];

// Confidence Levels
export const CONFIDENCE_LEVELS = ['High', 'Medium', 'Low'] as const;
export type ConfidenceLevel = typeof CONFIDENCE_LEVELS[number];

// Consultation Types
export const CONSULTATION_TYPES = ['market_analysis', 'investment_advice', 'property_valuation'] as const;
export type ConsultationType = typeof CONSULTATION_TYPES[number];

// Scenario Types
export const SCENARIO_TYPES = ['conservative', 'moderate', 'aggressive'] as const;
export type ScenarioType = typeof SCENARIO_TYPES[number];

// Time Periods
export const TIME_PERIODS = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'] as const;
export type TimePeriod = typeof TIME_PERIODS[number];

// Chart Colors (StratAxis Brand)
export const CHART_COLORS = {
    primary: '#171717', // primary-950
    secondary: '#737373', // primary-500
    accent: '#D4AF37', // accent-gold
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    douala: '#D4AF37', // Gold for Douala
    yaounde: '#525252', // Dark grey for Yaoundé
} as const;

// Map Configuration
export const MAP_CONFIG = {
    defaultCenter: { lat: 4.0, lng: 10.5 }, // Center between Douala and Yaoundé
    defaultZoom: 8,
    doualaCenter: { lat: 4.0511, lng: 9.7679 },
    yaoundeCenter: { lat: 3.8480, lng: 11.5021 },
    cityZoom: 12,
    neighborhoodZoom: 14,
} as const;

// API Endpoints
export const API_ENDPOINTS = {
    // Auth
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY: '/auth/verify',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',

    // Properties
    PROPERTIES: '/properties',
    PROPERTY_BY_ID: (id: string) => `/properties/${id}`,

    // Analytics
    ANALYTICS_OVERVIEW: '/analytics/overview',
    ANALYTICS_TRENDS: '/analytics/trends',
    ANALYTICS_NEIGHBORHOODS: '/analytics/neighborhoods',

    // Predictions
    PREDICT_PRICE: '/predictions/price',
    PREDICT_TREND: '/predictions/trend',

    // Bookings
    BOOKINGS: '/bookings',
    BOOKING_BY_ID: (id: string) => `/bookings/${id}`,

    // Admin
    ADMIN_USERS: '/admin/users',
    ADMIN_DATA_SOURCES: '/admin/data-sources',
    ADMIN_MODELS: '/admin/models',
    ADMIN_STATS: '/admin/stats',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
    TOKEN: 'strataxis_token',
    REFRESH_TOKEN: 'strataxis_refresh_token',
    USER: 'strataxis_user',
    THEME: 'strataxis_theme',
    LANGUAGE: 'strataxis_language',
    WATCHLIST: 'strataxis_watchlist',
} as const;

// Pagination
export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 20,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

// Date Ranges
export const DATE_RANGES = {
    LAST_MONTH: 30,
    LAST_QUARTER: 90,
    LAST_6_MONTHS: 180,
    LAST_YEAR: 365,
    LAST_2_YEARS: 730,
    ALL_TIME: 9999,
} as const;

// Translations
export const TRANSLATIONS = {
    en: {
        cities: {
            Douala: 'Douala',
            Yaoundé: 'Yaoundé',
        },
        propertyTypes: {
            apartment: 'Apartment',
            house: 'House',
            land: 'Land',
            commercial: 'Commercial',
        },
        housingTypes: {
            studio: 'Studio',
            one_bedroom: '1 Bedroom',
            two_bedroom: '2 Bedrooms',
            three_bedroom: '3 Bedrooms',
            villa_house: 'Villa/House',
            unknown: 'Unknown',
        },
        confidence: {
            High: 'High Confidence',
            Medium: 'Medium Confidence',
            Low: 'Low Confidence',
        },
    },
    fr: {
        cities: {
            Douala: 'Douala',
            Yaoundé: 'Yaoundé',
        },
        propertyTypes: {
            apartment: 'Appartement',
            house: 'Maison',
            land: 'Terrain',
            commercial: 'Commercial',
        },
        housingTypes: {
            studio: 'Studio',
            one_bedroom: '1 Chambre',
            two_bedroom: '2 Chambres',
            three_bedroom: '3 Chambres',
            villa_house: 'Villa/Maison',
            unknown: 'Inconnu',
        },
        confidence: {
            High: 'Confiance Élevée',
            Medium: 'Confiance Moyenne',
            Low: 'Confiance Faible',
        },
    },
} as const;
