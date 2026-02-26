import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import clsx from 'clsx';
import { useWatchlist, WatchlistEntry } from '../../hooks/useWatchlist';

interface WatchlistButtonProps {
    neighborhood: string;
    city: string;
    type: string;
    currentPrice?: number;
    change?: string;
    /** If true renders a compact icon-only button */
    compact?: boolean;
}

const WatchlistButton: React.FC<WatchlistButtonProps> = ({
    neighborhood,
    city,
    type,
    currentPrice = 0,
    change = '+0%',
    compact = false,
}) => {
    const { addToWatchlist, removeFromWatchlist, isInWatchlist, watchlist } = useWatchlist();

    // derive state from the hook so it reacts to external changes
    const [inList, setInList] = useState(false);
    const [flash, setFlash] = useState(false);

    // sync whenever the watchlist changes
    useEffect(() => {
        setInList(isInWatchlist(neighborhood, city, type));
    }, [watchlist, neighborhood, city, type, isInWatchlist]);

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (inList) {
            // find the id
            const entry = watchlist.find(
                i => i.neighborhood === neighborhood && i.city === city && i.type === type
            );
            if (entry) removeFromWatchlist(entry.id);
        } else {
            const entry: Omit<WatchlistEntry, 'id' | 'addedAt'> = {
                neighborhood,
                city,
                type,
                currentPrice,
                change,
            };
            addToWatchlist(entry);
            setFlash(true);
            setTimeout(() => setFlash(false), 600);
        }
    };

    if (compact) {
        return (
            <button
                onClick={handleClick}
                title={inList ? 'Remove from watchlist' : 'Add to watchlist'}
                className={clsx(
                    'p-2 rounded-full transition-all duration-200',
                    inList
                        ? 'text-accent-gold bg-accent-gold/10 hover:bg-semantic-error/10 hover:text-semantic-error'
                        : 'text-primary-400 hover:text-accent-gold hover:bg-accent-gold/10',
                    flash && 'scale-125'
                )}
            >
                <Star className={clsx('w-4 h-4', inList && 'fill-current')} />
            </button>
        );
    }

    return (
        <button
            onClick={handleClick}
            className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-all duration-200',
                inList
                    ? 'bg-accent-gold/10 text-accent-gold border-accent-gold/30 hover:bg-semantic-error/10 hover:text-semantic-error hover:border-semantic-error/30'
                    : 'bg-white dark:bg-primary-800 text-primary-700 dark:text-primary-200 border-primary-200 dark:border-primary-700 hover:bg-accent-gold/10 hover:text-accent-gold hover:border-accent-gold/30',
                flash && 'scale-105'
            )}
        >
            <Star className={clsx('w-4 h-4', inList && 'fill-current')} />
            {inList ? 'In Watchlist' : 'Add to Watchlist'}
        </button>
    );
};

export default WatchlistButton;
