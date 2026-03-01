import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the keys that match the DB
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

// Default values to show before data loads or if nothing is set in the DB
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
    ])
};

interface MetricsContextType {
    metrics: Record<string, string>;
    isLoading: boolean;
    updateMetric: (key: string, value: string) => Promise<void>;
    bulkUpdateMetrics: (data: Record<string, string>) => Promise<void>;
    refreshMetrics: () => Promise<void>;
}

const MetricsContext = createContext<MetricsContextType | undefined>(undefined);

export const MetricsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [metrics, setMetrics] = useState<Record<string, string>>(defaultMetrics);
    const [isLoading, setIsLoading] = useState(true);

    const fetchMetrics = async () => {
        try {
            const token = localStorage.getItem('strataxis_token');
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/metrics/dict`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                const data = await response.json();
                setMetrics(prev => ({ ...prev, ...data }));
            }
        } catch (error) {
            console.error('Failed to fetch metrics:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMetrics();
        // Refresh market metrics periodically every 15 seconds
        const interval = setInterval(fetchMetrics, 15000);
        return () => clearInterval(interval);
    }, []);

    const updateMetric = async (key: string, value: string) => {
        try {
            const token = localStorage.getItem('strataxis_token');
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/metrics/${key}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ value })
            });
            if (!res.ok && res.status === 404) {
                // If not found, create it
                await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/metrics/`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ key, value })
                });
            }
            setMetrics(prev => ({ ...prev, [key]: value }));
        } catch (err) {
            console.error('Error updating metric', err);
        }
    };

    const bulkUpdateMetrics = async (newMetrics: Record<string, string>) => {
        try {
            const token = localStorage.getItem('strataxis_token');
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/metrics/bulk/update`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ metrics: newMetrics })
            });
            if (res.ok) {
                const updated = await res.json();
                setMetrics(prev => ({ ...prev, ...updated }));
            }
        } catch (err) {
            console.error('Error bulk updating metrics', err);
        }
    };

    return (
        <MetricsContext.Provider value={{ metrics: { ...defaultMetrics, ...metrics }, isLoading, updateMetric, bulkUpdateMetrics, refreshMetrics: fetchMetrics }}>
            {children}
        </MetricsContext.Provider>
    );
};

export const useMetrics = () => {
    const context = useContext(MetricsContext);
    if (context === undefined) {
        throw new Error('useMetrics must be used within a MetricsProvider');
    }
    return context;
};
