import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  LAND_PRICES as DEFAULT_LAND_PRICES,
  RENT_BY_TYPE as DEFAULT_RENT_BY_TYPE,
  LandPriceByType,
  RentByPropertyType,
} from '../data/marketData';

// ─── Dashboard stat types ─────────────────────────────────────────────────────

export interface DashboardStat {
  id: string;
  label: string;
  value: string;
  change: string;
  period: string;
}

export interface DashboardStats {
  admin_totalUsers: DashboardStat;
  admin_activeSessions: DashboardStat;
  admin_dbSize: DashboardStat;
  admin_systemHealth: DashboardStat;
  paid_avgLandDouala: DashboardStat;
  paid_avgLandYaounde: DashboardStat;
  paid_rentalYield: DashboardStat;
  paid_activeListings: DashboardStat;
  free_avgLandDouala: DashboardStat;
}

// ─── Economics types ──────────────────────────────────────────────────────────

export interface EconomicsCurrent {
  beacRate: number;
  beacChange: number;
  avgMortgageDouala: number;
  avgMortgageYaounde: number;
  inflationDouala: number;
  inflationYaounde: number;
  inflationNational: number;
}

export interface InterestRatePoint {
  year: string;
  beacRate: number;
  avgMortgage: number;
  doualaAvg: number;
  yaoundeAvg: number;
}

export interface InflationPoint {
  year: string;
  national: number;
  douala: number;
  yaounde: number;
}

export interface EconomicsData {
  current: EconomicsCurrent;
  interestHistory: InterestRatePoint[];
  inflationHistory: InflationPoint[];
}

// ─── Neighborhood types ───────────────────────────────────────────────────────

export interface NeighborhoodEntry {
  name: string;
  grossYield: number;
  netYield: number;
  avgRent: number;
  avgPrice: number;
}

export interface NeighborhoodData {
  douala: NeighborhoodEntry[];
  yaounde: NeighborhoodEntry[];
}

// ─── Smart Insights types ─────────────────────────────────────────────────────

export type InsightType = 'opportunity' | 'trend' | 'risk';

export interface SmartInsight {
  id: number;
  type: InsightType;
  title: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
  confidence: number;
  date: string;
}

// ─── Default values ───────────────────────────────────────────────────────────

const DEFAULT_DASHBOARD_STATS: DashboardStats = {
  admin_totalUsers: { id: 'admin_totalUsers', label: 'Total Users', value: '1,247', change: '+23', period: 'this month' },
  admin_activeSessions: { id: 'admin_activeSessions', label: 'Active Sessions', value: '342', change: '+12', period: 'currently' },
  admin_dbSize: { id: 'admin_dbSize', label: 'Database Size', value: '2.4 GB', change: '+150 MB', period: 'this week' },
  admin_systemHealth: { id: 'admin_systemHealth', label: 'System Health', value: '98.5%', change: '+1.2%', period: 'uptime' },
  paid_avgLandDouala: { id: 'paid_avgLandDouala', label: 'Avg Land Price (Douala)', value: '97,500 FCFA/m²', change: '+12.3%', period: 'last year' },
  paid_avgLandYaounde: { id: 'paid_avgLandYaounde', label: 'Avg Land Price (Yaoundé)', value: '108,000 FCFA/m²', change: '+8.1%', period: 'last year' },
  paid_rentalYield: { id: 'paid_rentalYield', label: 'Rental Yield (Prime)', value: '7.8%', change: '+0.5%', period: 'last quarter' },
  paid_activeListings: { id: 'paid_activeListings', label: 'Active Listings', value: '510', change: '+45', period: 'last month' },
  free_avgLandDouala: { id: 'free_avgLandDouala', label: 'Avg Land Price (Douala)', value: '97,500 FCFA/m²', change: '+12.3%', period: 'last year' },
};

const DEFAULT_ECONOMICS: EconomicsData = {
  current: {
    beacRate: 4.75,
    beacChange: -0.25,
    avgMortgageDouala: 11.8,
    avgMortgageYaounde: 11.0,
    inflationDouala: 5.7,
    inflationYaounde: 4.8,
    inflationNational: 5.2,
  },
  interestHistory: [
    { year: '2020', beacRate: 3.50, avgMortgage: 10.5, doualaAvg: 11.2, yaoundeAvg: 10.8 },
    { year: '2021', beacRate: 3.50, avgMortgage: 10.0, doualaAvg: 10.5, yaoundeAvg: 10.2 },
    { year: '2022', beacRate: 4.50, avgMortgage: 11.5, doualaAvg: 12.0, yaoundeAvg: 11.2 },
    { year: '2023', beacRate: 5.00, avgMortgage: 12.0, doualaAvg: 12.5, yaoundeAvg: 11.8 },
    { year: '2024', beacRate: 5.00, avgMortgage: 11.8, doualaAvg: 12.2, yaoundeAvg: 11.5 },
    { year: '2025', beacRate: 4.75, avgMortgage: 11.2, doualaAvg: 11.8, yaoundeAvg: 11.0 },
  ],
  inflationHistory: [
    { year: '2020', national: 2.5, douala: 2.8, yaounde: 2.3 },
    { year: '2021', national: 3.2, douala: 3.6, yaounde: 2.9 },
    { year: '2022', national: 6.3, douala: 7.1, yaounde: 5.8 },
    { year: '2023', national: 7.4, douala: 8.2, yaounde: 6.9 },
    { year: '2024', national: 5.8, douala: 6.4, yaounde: 5.3 },
    { year: '2025', national: 5.2, douala: 5.7, yaounde: 4.8 },
  ],
};

const DEFAULT_NEIGHBORHOODS: NeighborhoodData = {
  douala: [
    { name: 'Akwa', grossYield: 8.2, netYield: 6.1, avgRent: 450000, avgPrice: 65800000 },
    { name: 'Bonanjo', grossYield: 7.8, netYield: 5.9, avgRent: 420000, avgPrice: 64600000 },
    { name: 'Bonapriso', grossYield: 7.5, netYield: 5.6, avgRent: 520000, avgPrice: 83200000 },
    { name: 'Logbaba', grossYield: 9.1, netYield: 7.2, avgRent: 280000, avgPrice: 36900000 },
    { name: 'Kotto', grossYield: 8.8, netYield: 6.9, avgRent: 310000, avgPrice: 42300000 },
    { name: 'Makepe', grossYield: 8.5, netYield: 6.6, avgRent: 295000, avgPrice: 41600000 },
  ],
  yaounde: [
    { name: 'Bastos', grossYield: 6.9, netYield: 5.1, avgRent: 580000, avgPrice: 100800000 },
    { name: 'Nlongkak', grossYield: 7.6, netYield: 5.8, avgRent: 380000, avgPrice: 60000000 },
    { name: 'Essos', grossYield: 8.3, netYield: 6.4, avgRent: 320000, avgPrice: 46200000 },
    { name: 'Mvan', grossYield: 8.7, netYield: 6.8, avgRent: 285000, avgPrice: 39300000 },
    { name: 'Odza', grossYield: 8.4, netYield: 6.5, avgRent: 295000, avgPrice: 42100000 },
    { name: 'Mokolo', grossYield: 9.2, netYield: 7.3, avgRent: 240000, avgPrice: 31300000 },
  ],
};

const DEFAULT_INSIGHTS: SmartInsight[] = [
  {
    id: 1, type: 'opportunity',
    title: 'Undervalued Zone: Makepe',
    description: 'Makepe is trading at 52,900 XAF/m², which is 15% below the expected value given its rental yield potential. This suggests a strong buy opportunity.',
    impact: 'High', confidence: 0.85, date: '2 days ago',
  },
  {
    id: 2, type: 'trend',
    title: 'Rental Demand Shift',
    description: 'Search volume for "Studio" apartments in Yaoundé has increased by 40% month-over-month, outpacing 2-bedroom requests.',
    impact: 'Medium', confidence: 0.92, date: '1 week ago',
  },
  {
    id: 3, type: 'risk',
    title: 'Price Plateau in Bonanjo',
    description: 'Asking prices in Bonanjo have remained flat for 3 consecutive quarters, indicating a possible market ceiling has been reached.',
    impact: 'Medium', confidence: 0.78, date: '2 weeks ago',
  },
];

// ─── Context shape ────────────────────────────────────────────────────────────

interface MetricsContextType {
  // Land & Rent (Category pages)
  landPrices: LandPriceByType[];
  rentByType: RentByPropertyType[];
  updateLandPrice: (city: string, landType: string, field: keyof LandPriceByType, value: number) => void;
  updateRentByType: (city: string, propertyType: string, field: keyof RentByPropertyType, value: number) => void;

  // Dashboard stat cards
  dashboardStats: DashboardStats;
  updateDashboardStat: (id: keyof DashboardStats, field: keyof DashboardStat, value: string) => void;

  // Economics
  economics: EconomicsData;
  updateEconomicsCurrent: (field: keyof EconomicsCurrent, value: number) => void;
  updateInterestHistory: (year: string, field: keyof InterestRatePoint, value: number) => void;
  updateInflationHistory: (year: string, field: keyof InflationPoint, value: number) => void;

  // Neighborhood analytics
  neighborhoods: NeighborhoodData;
  updateNeighborhood: (city: 'douala' | 'yaounde', name: string, field: keyof NeighborhoodEntry, value: number) => void;

  // Smart Insights
  smartInsights: SmartInsight[];
  updateSmartInsight: (id: number, field: keyof SmartInsight, value: string | number) => void;

  // Reset
  resetToDefaults: () => void;
}

const MetricsContext = createContext<MetricsContextType | undefined>(undefined);

// ─── localStorage helpers ─────────────────────────────────────────────────────

const KEYS = {
  landPrices: 'strataxis_metrics_land_prices',
  rentByType: 'strataxis_metrics_rent_by_type',
  dashboardStats: 'strataxis_metrics_dashboard_stats',
  economics: 'strataxis_metrics_economics',
  neighborhoods: 'strataxis_metrics_neighborhoods',
  smartInsights: 'strataxis_metrics_smart_insights',
};

function load<T>(key: string, def: T): T {
  try { const r = localStorage.getItem(key); if (r) return JSON.parse(r) as T; } catch { /* ignore */ }
  return def;
}
function save<T>(key: string, v: T) {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* ignore */ }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export const MetricsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [landPrices, setLandPrices] = useState<LandPriceByType[]>(() => load(KEYS.landPrices, DEFAULT_LAND_PRICES));
  const [rentByType, setRentByType] = useState<RentByPropertyType[]>(() => load(KEYS.rentByType, DEFAULT_RENT_BY_TYPE));
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>(() => load(KEYS.dashboardStats, DEFAULT_DASHBOARD_STATS));
  const [economics, setEconomics] = useState<EconomicsData>(() => load(KEYS.economics, DEFAULT_ECONOMICS));
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodData>(() => load(KEYS.neighborhoods, DEFAULT_NEIGHBORHOODS));
  const [smartInsights, setSmartInsights] = useState<SmartInsight[]>(() => load(KEYS.smartInsights, DEFAULT_INSIGHTS));

  // ── Land prices ──
  const updateLandPrice = useCallback((city: string, landType: string, field: keyof LandPriceByType, value: number) => {
    setLandPrices(prev => {
      const updated = prev.map(r => r.city === city && r.landType === landType ? { ...r, [field]: value } : r);
      save(KEYS.landPrices, updated); return updated;
    });
  }, []);

  // ── Rent by type ──
  const updateRentByType = useCallback((city: string, propertyType: string, field: keyof RentByPropertyType, value: number) => {
    setRentByType(prev => {
      const updated = prev.map(r => r.city === city && r.propertyType === propertyType ? { ...r, [field]: value } : r);
      save(KEYS.rentByType, updated); return updated;
    });
  }, []);

  // ── Dashboard stats ──
  const updateDashboardStat = useCallback((id: keyof DashboardStats, field: keyof DashboardStat, value: string) => {
    setDashboardStats(prev => {
      const updated = { ...prev, [id]: { ...prev[id], [field]: value } };
      save(KEYS.dashboardStats, updated); return updated;
    });
  }, []);

  // ── Economics: current snapshot ──
  const updateEconomicsCurrent = useCallback((field: keyof EconomicsCurrent, value: number) => {
    setEconomics(prev => {
      const updated = { ...prev, current: { ...prev.current, [field]: value } };
      save(KEYS.economics, updated); return updated;
    });
  }, []);

  // ── Economics: interest rate history row ──
  const updateInterestHistory = useCallback((year: string, field: keyof InterestRatePoint, value: number) => {
    setEconomics(prev => {
      const updated = {
        ...prev,
        interestHistory: prev.interestHistory.map(r => r.year === year ? { ...r, [field]: value } : r),
      };
      save(KEYS.economics, updated); return updated;
    });
  }, []);

  // ── Economics: inflation history row ──
  const updateInflationHistory = useCallback((year: string, field: keyof InflationPoint, value: number) => {
    setEconomics(prev => {
      const updated = {
        ...prev,
        inflationHistory: prev.inflationHistory.map(r => r.year === year ? { ...r, [field]: value } : r),
      };
      save(KEYS.economics, updated); return updated;
    });
  }, []);

  // ── Neighborhood analytics ──
  const updateNeighborhood = useCallback((city: 'douala' | 'yaounde', name: string, field: keyof NeighborhoodEntry, value: number) => {
    setNeighborhoods(prev => {
      const updated = {
        ...prev,
        [city]: prev[city].map(n => n.name === name ? { ...n, [field]: value } : n),
      };
      save(KEYS.neighborhoods, updated); return updated;
    });
  }, []);

  // ── Smart insights ──
  const updateSmartInsight = useCallback((id: number, field: keyof SmartInsight, value: string | number) => {
    setSmartInsights(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, [field]: value } : s);
      save(KEYS.smartInsights, updated); return updated;
    });
  }, []);

  // ── Reset all ──
  const resetToDefaults = useCallback(() => {
    setLandPrices(DEFAULT_LAND_PRICES);
    setRentByType(DEFAULT_RENT_BY_TYPE);
    setDashboardStats(DEFAULT_DASHBOARD_STATS);
    setEconomics(DEFAULT_ECONOMICS);
    setNeighborhoods(DEFAULT_NEIGHBORHOODS);
    setSmartInsights(DEFAULT_INSIGHTS);
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  }, []);

  return (
    <MetricsContext.Provider value={{
      landPrices, rentByType, updateLandPrice, updateRentByType,
      dashboardStats, updateDashboardStat,
      economics, updateEconomicsCurrent, updateInterestHistory, updateInflationHistory,
      neighborhoods, updateNeighborhood,
      smartInsights, updateSmartInsight,
      resetToDefaults,
    }}>
      {children}
    </MetricsContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useMetrics = (): MetricsContextType => {
  const ctx = useContext(MetricsContext);
  if (!ctx) throw new Error('useMetrics must be used within a MetricsProvider');
  return ctx;
};
