import React from 'react';
import PublicLayout from '../layouts/PublicLayout';
import Hero from '../components/home/Hero';
import LiveMetrics from '../components/home/LiveMetrics';
import UserSegments from '../components/home/UserSegments';
import MapPreview from '../components/home/MapPreview';
import { motion } from 'framer-motion';
// import { CheckCircle2, TrendingUp, BarChart3, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
    return (
        <PublicLayout>
            <div className="flex flex-col min-h-screen">
                <Hero />
                <LiveMetrics />
                <UserSegments />
                <MapPreview />

                {/* Final CTA Section */}
                <section className="py-24 bg-white dark:bg-primary-950">
                    <div className="container-custom">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="bg-primary-900 dark:bg-primary-900 rounded-3xl p-12 md:p-20 text-center relative overflow-hidden"
                        >
                            {/* Decor */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-gold/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                            <div className="relative z-10 max-w-3xl mx-auto">
                                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                                    Ready to make better real estate decisions?
                                </h2>
                                <p className="text-lg text-primary-300 mb-10">
                                    Join individual investors and institutions using StratAxis to navigate the Cameroonian market with confidence.
                                </p>
                                <div className="flex flex-col sm:flex-row justify-center gap-4">
                                    <Link to="/register" className="btn btn-gold btn-lg text-lg px-10 py-4">
                                        Get Started Free
                                    </Link>
                                    <Link to="/book-consultation" className="btn btn-outline btn-lg text-lg px-10 py-4 border-primary-600 text-white hover:bg-primary-800">
                                        Talk to an Expert
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </div>
        </PublicLayout>
    );
};

export default Home;
