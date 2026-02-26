import { useState, useCallback } from 'react';
import { STORAGE_KEYS } from '../utils/constants';

export interface WatchlistEntry {
    id: string;
    neighborhood: string;
    city: string;
    type: string;
    currentPrice: number;
    change: string;
    addedAt: string;
}

const WATCHLIST_KEY = STORAGE_KEYS.WATCHLIST;

function loadWatchlist(): WatchlistEntry[] {
    try {
        const raw = localStorage.getItem(WATCHLIST_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveWatchlist(items: WatchlistEntry[]) {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(items));
}

export function useWatchlist() {
    const [watchlist, setWatchlistState] = useState<WatchlistEntry[]>(loadWatchlist);

    const addToWatchlist = useCallback((entry: Omit<WatchlistEntry, 'id' | 'addedAt'>) => {
        setWatchlistState(prev => {
            const alreadyExists = prev.some(
                item => item.neighborhood === entry.neighborhood && item.city === entry.city && item.type === entry.type
            );
            if (alreadyExists) return prev;
            const newItem: WatchlistEntry = {
                ...entry,
                id: `${entry.city}-${entry.neighborhood}-${entry.type}-${Date.now()}`,
                addedAt: new Date().toISOString(),
            };
            const updated = [...prev, newItem];
            saveWatchlist(updated);
            return updated;
        });
    }, []);

    const removeFromWatchlist = useCallback((id: string) => {
        setWatchlistState(prev => {
            const updated = prev.filter(item => item.id !== id);
            saveWatchlist(updated);
            return updated;
        });
    }, []);

    const isInWatchlist = useCallback((neighborhood: string, city: string, type: string) => {
        return loadWatchlist().some(
            item => item.neighborhood === neighborhood && item.city === city && item.type === type
        );
    }, []);

    return { watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist };
}
