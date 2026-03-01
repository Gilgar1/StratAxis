import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// ── Single source of truth for the API base URL ──────────────────────────────
// Always reads from the Vite env var — never hardcodes a port.
// Set VITE_API_URL in frontend/.env (currently http://localhost:8081/api)
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

// ── Metric key types ──────────────────────────────────────────────────────────
export type MetricKeys =
    | 'avg_land_price_douala'
    | 'avg_land_price_douala_change'
    | 'avg_land_price_yaounde'
    | 'avg_land_price_yaounde_change'
    | 'rental_yield_prime'
    | 'rental_yield_prime_change'
    | 'active_listings'
    | 'active_listings_change'
    | 'chart_data_json';

// ── Fallback values shown before the DB responds ─────────────────────────────
export const defaultMetrics: Record<MetricKeys, string> = {
    avg_land_price_douala: '97,500',
    avg_land_price_douala_change: '+12.3%',
    avg_land_price_yaounde: '108,000',
    avg_land_price_yaounde_change: '+8.1%',
    rental_yield_prime: '7.8%',
    rental_yield_prime_change: '+0.5%',
    active_listings: '510',
    active_listings_change: '+45',
    chart_data_json: JSON.stringify([
        { p: 'Jan', douala: 88000, yaounde: 95000, listings: 120 },
        { p: 'Feb', douala: 89500, yaounde: 96000, listings: 135 },
        { p: 'Mar', douala: 91000, yaounde: 97500, listings: 140 },
        { p: 'Apr', douala: 92500, yaounde: 99000, listings: 155 },
        { p: 'May', douala: 95000, yaounde: 102000, listings: 180 },
        { p: 'Jun', douala: 97500, yaounde: 104000, listings: 210 },
        { p: 'Jul', douala: 97632, yaounde: 108000, listings: 250 },
    ]),
};

// ── Context type ──────────────────────────────────────────────────────────────
interface MetricsContextType {
    metrics: Record<string, string>;
    isLoading: boolean;
    updateMetric: (key: string, value: string) => Promise<void>;
    bulkUpdateMetrics: (data: Record<string, string>) => Promise<void>;
    refreshMetrics: () => Promise<void>;
}

const MetricsContext = createContext<MetricsContextType | undefined>(undefined);

// ── Helper — authenticated fetch headers ──────────────────────────────────────
const authHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('strataxis_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

// ── Provider ──────────────────────────────────────────────────────────────────
export const MetricsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [metrics, setMetrics] = useState<Record<string, string>>(defaultMetrics);
    const [isLoading, setIsLoading] = useState(true);

    const fetchMetrics = async () => {
        try {
            const response = await fetch(`${API_BASE}/metrics/dict`, {
                headers: authHeaders(),
            });
            if (response.ok) {
                const data = await response.json();
                setMetrics(prev => ({ ...prev, ...data }));
            }
            // If response is not ok (e.g. 401 before login), silently keep defaults
        } catch (error) {
            // Backend not reachable — keep showing defaults, don't crash
            console.warn('[MetricsContext] Backend unreachable, using default metrics.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMetrics();
        // Poll every 15 seconds so all open dashboards stay in sync
        const interval = setInterval(fetchMetrics, 15_000);
        return () => clearInterval(interval);
    }, []);

    const updateMetric = async (key: string, value: string) => {
        try {
            const res = await fetch(`${API_BASE}/metrics/${key}`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify({ value }),
            });
            if (res.status === 404) {
                // Metric doesn't exist yet — create it
                await fetch(`${API_BASE}/metrics/`, {
                    method: 'POST',
                    headers: authHeaders(),
                    body: JSON.stringify({ key, value }),
                });
            }
            // Optimistic update — reflect change immediately in UI
            setMetrics(prev => ({ ...prev, [key]: value }));
        } catch (err) {
            console.error('[MetricsContext] Error updating metric:', err);
        }
    };

    const bulkUpdateMetrics = async (newMetrics: Record<string, string>) => {
        try {
            const res = await fetch(`${API_BASE}/metrics/bulk/update`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify({ metrics: newMetrics }),
            });
            if (res.ok) {
                const updated = await res.json();
                setMetrics(prev => ({ ...prev, ...updated }));
            } else {
                const err = await res.json().catch(() => ({}));
                console.error('[MetricsContext] Bulk update failed:', err);
            }
        } catch (err) {
            console.error('[MetricsContext] Error bulk updating metrics:', err);
        }
    };

    return (
        <MetricsContext.Provider
            value={{
                metrics: { ...defaultMetrics, ...metrics },
                isLoading,
                updateMetric,
                bulkUpdateMetrics,
                refreshMetrics: fetchMetrics,
            }}
        >
            {children}
        </MetricsContext.Provider>
    );
};

// ── Hook ──────────────────────────────────────────────────────────────────────
export const useMetrics = () => {
    const context = useContext(MetricsContext);
    if (context === undefined) {
        throw new Error('useMetrics must be used within a MetricsProvider');
    }
    return context;
};
