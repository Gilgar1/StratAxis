import React from 'react';
import heroBg from '../assets/images/hero-bg.jpg';

const Home = () => {
    return (
        <div className="flex flex-col w-full">
            {/* SECTION 1: HERO / VALUE PROPOSITION */}
            <section className="bg-brand-black overflow-hidden relative min-h-[600px] flex items-center">
                <div className="container-custom relative z-10 grid grid-cols-1 lg:grid-cols-10 gap-12 items-center">
                    <div className="lg:col-span-6 py-20">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-[1.2]">
                            Institutional-grade intelligence for the property market.
                        </h1>
                        <p className="text-lg md:text-xl text-brand-mediumGrey mb-12 max-w-xl leading-relaxed">
                            StratAxis provides decision-grade data and predictive analytics for real estate investors and policymakers in Cameroon's primary markets.
                        </p>
                        <div className="flex">
                            <button className="relative group overflow-hidden">
                                <span className="text-brand-gold font-bold tracking-widest uppercase text-sm border-b-2 border-brand-gold pb-1 transition-all group-hover:pr-4">
                                    Explore our solutions
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Hero Image occupying 40% to the right */}
                <div
                    className="hidden lg:block absolute top-0 right-0 w-[40%] h-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${heroBg})` }}
                >
                    <div className="w-full h-full bg-gradient-to-r from-brand-black via-brand-black/20 to-transparent"></div>
                </div>
            </section>

            {/* SECTION 2: DATA COVERAGE */}
            <section className="bg-brand-charcoal py-24">
                <div className="container-custom">
                    <h2 className="text-xs font-bold text-brand-gold uppercase tracking-[0.3em] mb-16">Data Coverage</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                        <div>
                            <h3 className="text-white text-xl font-semibold mb-4">Real Estate Coverage</h3>
                            <p className="text-brand-mediumGrey text-sm leading-relaxed">
                                Comprehensive tracking of residential, commercial, and industrial property trends across Yaoundé and Douala.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-white text-xl font-semibold mb-4">Market Indicators</h3>
                            <p className="text-brand-mediumGrey text-sm leading-relaxed">
                                Real-time monitoring of price-per-square-meter, absorption rates, and yield benchmarks for diverse asset classes.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-white text-xl font-semibold mb-4">Policy & Economic Signals</h3>
                            <p className="text-brand-mediumGrey text-sm leading-relaxed">
                                Aggregated signals from urban planning policies, interest rate shifts, and regional infrastructure developments.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-white text-xl font-semibold mb-4">Geographic Focus</h3>
                            <p className="text-brand-mediumGrey text-sm leading-relaxed">
                                Deep-dive analytics focused on the economic hubs of Yaoundé and Douala for the initial development phase.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* NEW SECTION 3: INDUSTRY TRUSTED INSIGHTS */}
            <section className="bg-white py-24">
                <div className="container-custom text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-brand-black mb-8">
                        Explore our industry trusted insights
                    </h2>
                    <p className="text-brand-mediumGrey max-w-2xl mx-auto mb-12">
                        Our data scientists and real estate analysts provide rigorous analysis on emergent market trends, providing the clarity required for high-stakes capital allocation.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                        <div className="p-8 border border-brand-lightGrey hover:shadow-lg transition-shadow">
                            <span className="text-brand-gold text-xs font-bold uppercase tracking-widest mb-4 block">Report — Jan 2026</span>
                            <h4 className="text-xl font-bold text-brand-black mb-4">The Douala Commercial Boom</h4>
                            <p className="text-sm text-brand-mediumGrey mb-6 line-clamp-3">
                                Tracking the shift from informal retail clusters to structured commercial hubs in key metropolitan corridors.
                            </p>
                            <button className="text-brand-black font-semibold text-sm border-b border-brand-black">Read More</button>
                        </div>
                        <div className="p-8 border border-brand-lightGrey hover:shadow-lg transition-shadow">
                            <span className="text-brand-gold text-xs font-bold uppercase tracking-widest mb-4 block">Analysis — Dec 2025</span>
                            <h4 className="text-xl font-bold text-brand-black mb-4">Yaoundé Residential Yields</h4>
                            <p className="text-sm text-brand-mediumGrey mb-6 line-clamp-3">
                                A comparative study on net yields across luxury apartments versus mid-market residential developments.
                            </p>
                            <button className="text-brand-black font-semibold text-sm border-b border-brand-black">Read More</button>
                        </div>
                        <div className="p-8 border border-brand-lightGrey hover:shadow-lg transition-shadow">
                            <span className="text-brand-gold text-xs font-bold uppercase tracking-widest mb-4 block">Policy — Nov 2025</span>
                            <h4 className="text-xl font-bold text-brand-black mb-4">Infrastructure & Land Value</h4>
                            <p className="text-sm text-brand-mediumGrey mb-6 line-clamp-3">
                                How upcoming road network expansions are recalibrating land valuations in suburban expansion zones.
                            </p>
                            <button className="text-brand-black font-semibold text-sm border-b border-brand-black">Read More</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* PREVIOUS SECTION 3 (NOW 4): SOLUTIONS / CUSTOMER BENEFITS */}
            <section className="bg-brand-darkGrey py-24">
                <div className="container-custom">
                    <h2 className="text-xs font-bold text-brand-gold uppercase tracking-[0.3em] mb-16">Solutions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-brand-black/30 border border-white/5 p-10 hover:border-brand-gold/20 transition-colors">
                            <h3 className="text-white text-2xl font-bold mb-6">Investor Intelligence</h3>
                            <p className="text-brand-mediumGrey leading-relaxed">
                                Minimize capital risk with data-driven valuations. Move beyond anecdotal evidence to quantified market entry and exit strategies.
                            </p>
                        </div>
                        <div className="bg-brand-black/30 border border-white/5 p-10 hover:border-brand-gold/20 transition-colors">
                            <h3 className="text-white text-2xl font-bold mb-6">Decision-Grade Analytics</h3>
                            <p className="text-brand-mediumGrey leading-relaxed">
                                Access curated insights that clarify market noise. Our platform translates raw data into actionable intelligence for long-term growth.
                            </p>
                        </div>
                        <div className="bg-brand-black/30 border border-white/5 p-10 hover:border-brand-gold/20 transition-colors">
                            <h3 className="text-white text-2xl font-bold mb-6">Market Risk Reduction</h3>
                            <p className="text-brand-mediumGrey leading-relaxed">
                                Identify over-saturated zones and emerging hotspots before they hit mainstream awareness through our predictive mapping tools.
                            </p>
                        </div>
                        <div className="bg-brand-black/30 border border-white/5 p-10 hover:border-brand-gold/20 transition-colors">
                            <h3 className="text-white text-2xl font-bold mb-6">Advisory & Consultation</h3>
                            <p className="text-brand-mediumGrey leading-relaxed">
                                Direct access to expert interpretation of data signals. Tailored reports designed for specific portfolio requirements and policy goals.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
