import React from 'react';
import { Link } from 'react-router-dom';
import heroBg from '../assets/images/hero-bg.jpg';

const Home = () => {
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
        </div>
    );
};

export default Home;
