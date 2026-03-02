import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Appointment {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    organization: string;
    interest: string;
    message: string;
    submittedAt: string;
    status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
    scheduledTime?: string;
}

export interface PendingPayment {
    id: string;
    userId: string;
    userEmail: string;
    userName: string;
    plan: string;
    period: 'monthly' | 'yearly';
    amount: number;
    paymentIdLastFour: string;
    createdAt: string;
    status: 'pending' | 'approved' | 'rejected';
}

export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    category: string;
    date: string;
    author: string;
    readTime: string;
    published: boolean;
}

// ─── Default blog posts (the ones already in Blog.tsx) ────────────────────────

const DEFAULT_BLOG_POSTS: BlogPost[] = [
    {
        id: 'bp_1', slug: 'douala-market-report-q4-2025',
        title: 'Douala Market Report Q4 2025: Bonapriso Surges',
        excerpt: 'Land prices in Bonapriso have hit a historic high of 97,000 XAF/m², driven by scarcity and a new wave of mixed-use developments.',
        content: `The Douala real estate market has shown resilience in Q4 2025, with the **Compound Annual Growth Rate (CAGR)** for prime residential land exceeding 12% in select neighborhoods.\n\n## The Bonapriso Anomaly\n\nWhile broader Douala growth sits at 4-6%, Bonapriso continues to defy gravity. Analyzing over 50 listings from Q3 to Q4, we observed a tightening of supply which has pushed median asking prices from 88,500 XAF/m² to 97,632 XAF/m².\n\n> "The scarcity of developable plots larger than 500m² is the primary driver. Developers are now competing for the same limited inventory."\n\n## Key Drivers\n\n- **Infrastructure:** Completion of the secondary access road has improved traffic flow.\n- **Zoning Changes:** New permits for vertical density (G+4 to G+6) have increased land value utility.\n- **Expat Demand:** Rental yields for furnished apartments in the zone remain the highest in the city.\n\n## Outlook for 2026\n\nWe project this trend to stabilize by Q2 2026 as buyers reach price resistance levels. However, look for spillover effects into adjacent neighborhoods like **Bali** and the southern edges of **Akwa**.`,
        category: 'Market Report', date: 'Jan 12, 2026', author: 'StratAxis Analytics', readTime: '5 min read', published: true,
    },
    {
        id: 'bp_2', slug: 'yaounde-rental-yields-2026',
        title: 'Yaoundé Rental Yields: Best Neighborhoods for ROI',
        excerpt: 'Discover which Yaoundé neighborhoods are delivering the highest rental yields for investors in 2026.',
        content: `Yaoundé's rental market has evolved significantly in 2025-2026. Here's our analysis of the best neighborhoods for rental ROI.\n\n## Top Performers\n\n- **Mokolo** — 9.2% gross yield, driven by high demand and affordable entry prices.\n- **Mvan** — 8.7% gross yield, benefiting from university proximity.\n- **Essos** — 8.3% gross yield, strong infrastructure improvements.\n\n## What's Driving Yields?\n\nExpanding universities, government relocations, and infrastructure projects are all contributing to rising rental demand in secondary neighborhoods.`,
        category: 'Investment', date: 'Jan 8, 2026', author: 'StratAxis Analytics', readTime: '7 min read', published: true,
    },
    {
        id: 'bp_3', slug: 'real-estate-trends-cameroon-2026',
        title: 'Top 5 Real Estate Trends Shaping Cameroon in 2026',
        excerpt: 'From digital transformation to infrastructure development, explore the key trends influencing the Cameroonian real estate market.',
        content: `The Cameroonian real estate market is undergoing a transformation. Here are the top 5 trends:\n\n## 1. Digital Platform Adoption\n\nOnline listing platforms and data analytics tools like StratAxis are changing how investors make decisions.\n\n## 2. Infrastructure-Driven Appreciation\n\nNew highways and the Kribi port expansion continue to drive land values in surrounding areas.\n\n## 3. Rise of Mixed-Use Development\n\nDevelopers are increasingly building combined residential-commercial projects.\n\n## 4. Student Housing Boom\n\nUniversity expansions in both Douala and Yaoundé are creating new rental demand.\n\n## 5. Sustainable Building\n\nGreen building practices are slowly gaining traction, with premium pricing for eco-friendly developments.`,
        category: 'Market Analysis', date: 'Jan 5, 2026', author: 'StratAxis Analytics', readTime: '6 min read', published: true,
    },
    {
        id: 'bp_4', slug: 'land-investment-guide-beginners',
        title: 'Land Investment Guide for First-Time Buyers',
        excerpt: 'A comprehensive guide to making your first land purchase in Douala or Yaoundé with confidence.',
        content: `Buying land in Cameroon can be incredibly rewarding — but it helps to know the process.\n\n## Step 1: Define Your Budget\n\nLand prices vary dramatically — from 5,000 XAF/m² in suburban areas to 100,000+ XAF/m² in prime zones.\n\n## Step 2: Verify Title Deeds\n\nAlways insist on a **Titre Foncier** (official land title). Avoid buying land with only a "certificat de propriété."\n\n## Step 3: Check Zoning\n\nVerify with the local urban community that your intended use is permitted.\n\n## Step 4: Negotiate Smartly\n\nUse StratAxis data to know the true market value before negotiating.`,
        category: 'Investment', date: 'Dec 28, 2025', author: 'StratAxis Analytics', readTime: '10 min read', published: true,
    },
    {
        id: 'bp_5', slug: 'bastos-vs-bonapriso-comparison',
        title: "Bastos vs Bonapriso: A Tale of Two Premium Markets",
        excerpt: "Comparing the dynamics, price trends, and investment potential of Yaoundé's Bastos and Douala's Bonapriso neighborhoods.",
        content: `Two of Cameroon's most prestigious neighborhoods go head to head.\n\n## Bastos (Yaoundé)\n\n- Average price: 124,000 XAF/m²\n- Target: Diplomats, government officials\n- Rental yield: 6.9%\n\n## Bonapriso (Douala)\n\n- Average price: 97,000 XAF/m²\n- Target: Expats, business elite\n- Rental yield: 7.5%\n\n## Verdict\n\nBonapriso offers better yield and appreciation potential, while Bastos provides more stability and prestige.`,
        category: 'Comparison', date: 'Dec 22, 2025', author: 'StratAxis Analytics', readTime: '8 min read', published: true,
    },
    {
        id: 'bp_6', slug: 'infrastructure-impact-property-values',
        title: 'How Infrastructure Projects Impact Property Values',
        excerpt: "Analyzing the correlation between new road construction and land price appreciation across Cameroon's major cities.",
        content: `Infrastructure projects are among the strongest predictors of land value appreciation.\n\n## The Data\n\nOur analysis of 15 major infrastructure projects over 5 years shows:\n- Land within 2km of new roads appreciated **28-45%** faster than city averages.\n- Port-adjacent industrial land saw **65%** appreciation over 3 years.\n\n## Key Projects to Watch\n\n- Yaoundé-Nsimalen Highway Extension\n- Kribi Deep Seaport Phase II\n- Ring Road Rehabilitation (Douala)\n\n## Investor Strategy\n\nBuy before construction begins. The biggest gains happen during the announcement and early construction phases.`,
        category: 'Market Analysis', date: 'Dec 15, 2025', author: 'StratAxis Analytics', readTime: '6 min read', published: true,
    },
];

// ─── localStorage helpers ─────────────────────────────────────────────────────

const KEYS = {
    appointments: 'strataxis_appointments',
    payments: 'strataxis_pending_payments',
    blogPosts: 'strataxis_blog_posts',
};

function load<T>(key: string, def: T): T {
    try { const r = localStorage.getItem(key); if (r) return JSON.parse(r) as T; } catch { /* */ }
    return def;
}
function save<T>(key: string, v: T) {
    try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* */ }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppContextType {
    // Appointments
    appointments: Appointment[];
    addAppointment: (a: Omit<Appointment, 'id' | 'submittedAt' | 'status'>) => void;
    updateAppointmentStatus: (id: string, status: Appointment['status']) => void;
    scheduleAppointment: (id: string, time: string) => void;

    // Payments
    pendingPayments: PendingPayment[];
    submitPayment: (p: Omit<PendingPayment, 'id' | 'createdAt' | 'status'>) => void;
    approvePayment: (id: string) => void;
    rejectPayment: (id: string) => void;

    // Blog
    blogPosts: BlogPost[];
    addBlogPost: (p: Omit<BlogPost, 'id' | 'slug' | 'date'>) => void;
    updateBlogPost: (id: string, updates: Partial<BlogPost>) => void;
    deleteBlogPost: (id: string) => void;
    getBlogBySlug: (slug: string) => BlogPost | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [appointments, setAppointments] = useState<Appointment[]>(() => load(KEYS.appointments, []));
    const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>(() => load(KEYS.payments, []));
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>(() => load(KEYS.blogPosts, DEFAULT_BLOG_POSTS));

    // ── Appointments ──
    const addAppointment = useCallback((a: Omit<Appointment, 'id' | 'submittedAt' | 'status'>) => {
        setAppointments(prev => {
            const entry: Appointment = {
                ...a,
                id: 'apt_' + Date.now(),
                submittedAt: new Date().toISOString(),
                status: 'pending',
            };
            const updated = [entry, ...prev];
            save(KEYS.appointments, updated);
            return updated;
        });
    }, []);

    const updateAppointmentStatus = useCallback((id: string, status: Appointment['status']) => {
        setAppointments(prev => {
            const updated = prev.map(a => a.id === id ? { ...a, status } : a);
            save(KEYS.appointments, updated);
            return updated;
        });
    }, []);

    const scheduleAppointment = useCallback((id: string, time: string) => {
        setAppointments(prev => {
            const updated = prev.map(a => a.id === id ? { ...a, status: 'scheduled' as const, scheduledTime: time } : a);
            save(KEYS.appointments, updated);
            return updated;
        });
    }, []);

    // ── Payments ──
    const submitPayment = useCallback((p: Omit<PendingPayment, 'id' | 'createdAt' | 'status'>) => {
        setPendingPayments(prev => {
            const entry: PendingPayment = {
                ...p,
                id: 'pay_' + Date.now(),
                createdAt: new Date().toISOString(),
                status: 'pending',
            };
            const updated = [entry, ...prev];
            save(KEYS.payments, updated);
            return updated;
        });
    }, []);

    const approvePayment = useCallback((id: string) => {
        setPendingPayments(prev => {
            const updated = prev.map(p => p.id === id ? { ...p, status: 'approved' as const } : p);
            save(KEYS.payments, updated);
            return updated;
        });
    }, []);

    const rejectPayment = useCallback((id: string) => {
        setPendingPayments(prev => {
            const updated = prev.map(p => p.id === id ? { ...p, status: 'rejected' as const } : p);
            save(KEYS.payments, updated);
            return updated;
        });
    }, []);

    // ── Blog ──
    const addBlogPost = useCallback((p: Omit<BlogPost, 'id' | 'slug' | 'date'>) => {
        setBlogPosts(prev => {
            const slug = p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const entry: BlogPost = {
                ...p,
                id: 'bp_' + Date.now(),
                slug,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            };
            const updated = [entry, ...prev];
            save(KEYS.blogPosts, updated);
            return updated;
        });
    }, []);

    const updateBlogPost = useCallback((id: string, updates: Partial<BlogPost>) => {
        setBlogPosts(prev => {
            const updated = prev.map(p => p.id === id ? { ...p, ...updates } : p);
            save(KEYS.blogPosts, updated);
            return updated;
        });
    }, []);

    const deleteBlogPost = useCallback((id: string) => {
        setBlogPosts(prev => {
            const updated = prev.filter(p => p.id !== id);
            save(KEYS.blogPosts, updated);
            return updated;
        });
    }, []);

    const getBlogBySlug = useCallback((slug: string) => {
        return blogPosts.find(p => p.slug === slug);
    }, [blogPosts]);

    return (
        <AppContext.Provider value={{
            appointments, addAppointment, updateAppointmentStatus, scheduleAppointment,
            pendingPayments, submitPayment, approvePayment, rejectPayment,
            blogPosts, addBlogPost, updateBlogPost, deleteBlogPost, getBlogBySlug,
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = (): AppContextType => {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useApp must be used within an AppProvider');
    return ctx;
};
