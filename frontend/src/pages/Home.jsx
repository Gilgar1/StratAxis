import React from 'react';
import { Link } from 'react-router-dom';
import heroBg from '../assets/images/hero-bg.jpg';

const Home = () => {
    const stats = [
        { value: '10K+', label: 'Properties Tracked', icon: '🏢' },
        { value: '95%', label: 'Data Accuracy', icon: '📊' },
        { value: '2', label: 'Major Cities', icon: '🌍' },
        { value: '24/7', label: 'Real-time Updates', icon: '⚡' },
    ];

    const features = [
        {
            title: 'Investor Intelligence',
            description: 'Minimize capital risk with data-driven valuations. Move beyond anecdotal evidence to quantified market entry and exit strategies.',
            icon: '💼',
        },
        {
            title: 'Decision-Grade Analytics',
            description: 'Access curated insights that clarify market noise. Our platform translates raw data into actionable intelligence for long-term growth.',
            icon: '📈',
        },
        {
            title: 'Market Risk Reduction',
            description: 'Identify over-saturated zones and emerging hotspots before they hit mainstream awareness through our predictive mapping tools.',
            icon: '🎯',
        },
        {
            title: 'Advisory & Consultation',
            description: 'Direct access to expert interpretation of data signals. Tailored reports designed for specific portfolio requirements and policy goals.',
            icon: '🤝',
        },
    ];

    const insights = [
        {
            badge: 'Report — Jan 2026',
            title: 'The Douala Commercial Boom',
            description: 'Tracking the shift from informal retail clusters to structured commercial hubs in key metropolitan corridors.',
        },
        {
            badge: 'Analysis — Dec 2025',
            title: 'Yaoundé Residential Yields',
            description: 'A comparative study on net yields across luxury apartments versus mid-market residential developments.',
        },
        {
            badge: 'Policy — Nov 2025',
            title: 'Infrastructure & Land Value',
            description: 'How upcoming road network expansions are recalibrating land valuations in suburban expansion zones.',
        },
    ];

    return (
        <div className="flex flex-col w-full">
            {/* HERO SECTION */}
            <section className="relative min-h-screen flex items-center overflow-hidden">
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${heroBg})` }}
                >
                    <div className="hero-gradient"></div>
                    <div className="absolute inset-0 bg-brand-black/60"></div>
                </div>

                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 grid-pattern opacity-20"></div>

                {/* Content */}
                <div className="relative container-custom py-32 z-10">
                    <div className="max-w-4xl">
                        <div className="badge mb-8 animate-fade-in">
                            Institutional-Grade Intelligence
                        </div>
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-8 leading-tight animate-slide-up">
                            Precision Data for{' '}
                            <span className="gradient-text">Strategic</span>{' '}
                            Real Estate Decisions
                        </h1>
                        <p className="text-xl md:text-2xl text-brand-lightGrey mb-12 max-w-2xl leading-relaxed animate-slide-up">
                            StratAxis provides decision-grade data and predictive analytics for real estate investors and policymakers in Cameroon's primary markets.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 animate-slide-up">
                            <Link to="/register" className="btn-primary">
                                Get Started Free
                            </Link>
                            <Link to="/analytics" className="btn-outline-gold">
                                Explore Analytics
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <svg className="w-6 h-6 text-brand-gold" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                    </svg>
                </div>
            </section>

            {/* STATS SECTION */}
            <section className="relative bg-brand-charcoal py-24 overflow-hidden">
                <div className="absolute inset-0 grid-pattern opacity-10"></div>
                <div className="relative container-custom">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div
                                key={index}
                                className="stat-card group hover:scale-105 transition-transform duration-300"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="text-4xl mb-3">{stat.icon}</div>
                                <div className="text-4xl md:text-5xl font-display font-bold gradient-text mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-brand-mediumGrey text-sm uppercase tracking-wider">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* TRUSTED INSIGHTS SECTION */}
            <section className="bg-white py-24">
                <div className="container-custom">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-display font-bold text-brand-black mb-6">
                            Industry-Trusted <span className="gradient-text">Insights</span>
                        </h2>
                        <p className="text-brand-mediumGrey text-lg max-w-3xl mx-auto leading-relaxed">
                            Our data scientists and real estate analysts provide rigorous analysis on emergent market trends, providing the clarity required for high-stakes capital allocation.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {insights.map((insight, index) => (
                            <div
                                key={index}
                                className="group bg-white border border-brand-lightGrey/30 rounded-2xl p-8 transition-all duration-300 hover:border-brand-gold/50 hover:shadow-2xl hover:shadow-brand-gold/10 hover:-translate-y-2"
                            >
                                <div className="badge mb-6">{insight.badge}</div>
                                <h4 className="text-2xl font-display font-bold text-brand-black mb-4 group-hover:text-brand-gold transition-colors">
                                    {insight.title}
                                </h4>
                                <p className="text-brand-mediumGrey text-sm leading-relaxed mb-6">
                                    {insight.description}
                                </p>
                                <button className="link-animated text-sm">
                                    Read More →
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FEATURES SECTION */}
            <section className="relative bg-brand-darkGrey py-24 overflow-hidden">
                <div className="absolute inset-0 grid-pattern opacity-10"></div>
                <div className="relative container-custom">
                    <div className="text-center mb-16">
                        <div className="section-label mx-auto">Solutions</div>
                        <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
                            Built for <span className="gradient-text">Decision Makers</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-item">
                                <div className="relative z-10">
                                    <div className="text-5xl mb-6">{feature.icon}</div>
                                    <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-4">
                                        {feature.title}
                                    </h3>
                                    <p className="text-brand-lightGrey leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA SECTION */}
            <section className="relative bg-brand-black py-32 overflow-hidden">
                <div className="absolute inset-0 grid-pattern opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/5 to-transparent"></div>

                <div className="relative container-custom text-center">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-8">
                        Ready to Make <span className="gradient-text">Informed</span> Decisions?
                    </h2>
                    <p className="text-xl text-brand-lightGrey mb-12 max-w-2xl mx-auto">
                        Join institutional investors and policymakers leveraging StratAxis for strategic real estate intelligence.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register" className="btn-primary text-lg px-12 py-4">
                            Start Free Trial
                        </Link>
                        <Link to="/booking" className="btn-ghost text-lg px-12 py-4 border border-white/20">
                            Book Consultation
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
