// Currency formatting
export const formatCurrency = (
    amount: number,
    currency: 'XAF' | 'USD' | 'EUR' = 'XAF',
    locale: 'en' | 'fr' = 'en'
): string => {
    const localeMap = {
        en: 'en-US',
        fr: 'fr-FR',
    };

    const currencySymbols = {
        XAF: 'FCFA',
        USD: '$',
        EUR: '€',
    };

    if (currency === 'XAF') {
        // Format XAF with custom formatting (no decimals, space separator)
        const formatted = new Intl.NumberFormat(localeMap[locale], {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);

        return locale === 'fr' ? `${formatted} ${currencySymbols.XAF}` : `${currencySymbols.XAF} ${formatted}`;
    }

    return new Intl.NumberFormat(localeMap[locale], {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

// Number formatting
export const formatNumber = (num: number, decimals: number = 0): string => {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(num);
};

// Percentage formatting
export const formatPercentage = (value: number, decimals: number = 1): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
};

// Date formatting
export const formatDate = (
    date: string | Date,
    format: 'short' | 'long' | 'relative' = 'short',
    locale: 'en' | 'fr' = 'en'
): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const localeMap = {
        en: 'en-US',
        fr: 'fr-FR',
    };

    if (format === 'relative') {
        return formatRelativeTime(dateObj, locale);
    }

    const options: Intl.DateTimeFormatOptions =
        format === 'long'
            ? { year: 'numeric', month: 'long', day: 'numeric' }
            : { year: 'numeric', month: 'short', day: 'numeric' };

    return new Intl.DateTimeFormat(localeMap[locale], options).format(dateObj);
};

// Relative time formatting (e.g., "2 hours ago")
export const formatRelativeTime = (date: Date, locale: 'en' | 'fr' = 'en'): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
    };

    const translations = {
        en: {
            year: 'year',
            month: 'month',
            week: 'week',
            day: 'day',
            hour: 'hour',
            minute: 'minute',
            ago: 'ago',
            justNow: 'just now',
        },
        fr: {
            year: 'an',
            month: 'mois',
            week: 'semaine',
            day: 'jour',
            hour: 'heure',
            minute: 'minute',
            ago: 'il y a',
            justNow: 'à l\'instant',
        },
    };

    const t = translations[locale];

    if (diffInSeconds < 60) {
        return t.justNow;
    }

    for (const [key, seconds] of Object.entries(intervals)) {
        const interval = Math.floor(diffInSeconds / seconds);
        if (interval >= 1) {
            const unit = t[key as keyof typeof t] as string;
            return locale === 'fr'
                ? `${t.ago} ${interval} ${unit}${interval > 1 ? 's' : ''}`
                : `${interval} ${unit}${interval > 1 ? 's' : ''} ${t.ago}`;
        }
    }

    return t.justNow;
};

// Compact number formatting (e.g., 1.5K, 2.3M)
export const formatCompactNumber = (num: number): string => {
    if (num < 1000) return num.toString();
    if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
    if (num < 1000000000) return `${(num / 1000000).toFixed(1)}M`;
    return `${(num / 1000000000).toFixed(1)}B`;
};

// Area formatting (m²)
export const formatArea = (sqm: number, locale: 'en' | 'fr' = 'en'): string => {
    const formatted = formatNumber(sqm, 0);
    return locale === 'fr' ? `${formatted} m²` : `${formatted} m²`;
};

// Confidence score to text
export const formatConfidenceScore = (score: number, locale: 'en' | 'fr' = 'en'): string => {
    const labels = {
        en: {
            high: 'High',
            medium: 'Medium',
            low: 'Low',
        },
        fr: {
            high: 'Élevée',
            medium: 'Moyenne',
            low: 'Faible',
        },
    };

    const t = labels[locale];

    if (score >= 4.0) return t.high;
    if (score >= 2.5) return t.medium;
    return t.low;
};

// Truncate text
export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength)}...`;
};

// Slugify text (for URLs)
export const slugify = (text: string): string => {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};
