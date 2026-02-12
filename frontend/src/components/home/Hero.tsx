import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Hero: React.FC = () => {
    return (
        <section className="relative overflow-hidden bg-white dark:bg-primary-950 pt-20 pb-16 md:pt-32 md:pb-24">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-30 dark:opacity-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-96 h-96 rounded-full bg-accent-gold filter blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary-200 dark:bg-primary-800 filter blur-[120px]" />
            </div>

            <div className="container-custom relative z-10">
                <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-accent-gold/10 text-accent-gold-dark dark:text-accent-gold text-sm font-medium mb-6 border border-accent-gold/20">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-gold opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-gold"></span>
                            </span>
                            <span>Live Market Intelligence 2026</span>
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-primary-900 dark:text-white mb-6"
                    >
                        The Trusted Intelligence for{' '}
                        <span className="text-gradient">Real Estate in Cameroon</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-xl text-primary-600 dark:text-primary-300 mb-2 max-w-2xl"
                    >
                        Data-driven insight for profitable strategic real estate ventures.
                    </motion.p>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="text-lg text-primary-500 dark:text-primary-400 mb-10 italic max-w-2xl"
                    >
                        "Intelligence décisionnelle pour l'immobilier au Cameroun."
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto"
                    >
                        <Link to="/register" className="btn btn-gold btn-lg w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-4 text-lg shadow-lg shadow-accent-gold/20 hover:shadow-accent-gold/30 transition-shadow">
                            <span>Explore Markets</span>
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link to="/book-consultation" className="btn btn-outline btn-lg w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-4 text-lg">
                            <span>Book Consultation</span>
                        </Link>
                    </motion.div>

                    {/* Feature Highlights */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 w-full border-t border-primary-200 dark:border-primary-800 pt-8"
                    >
                        <div className="text-left">
                            <div className="flex items-center text-primary-900 dark:text-white font-bold text-2xl md:text-3xl mb-1">
                                2
                            </div>
                            <div className="text-sm md:text-base text-primary-500 font-medium">Major Cities<br />Covered</div>
                        </div>
                        <div className="text-left">
                            <div className="flex items-center text-primary-900 dark:text-white font-bold text-2xl md:text-3xl mb-1">
                                31+
                            </div>
                            <div className="text-sm md:text-base text-primary-500 font-medium">Neighborhoods<br />Analyzed</div>
                        </div>
                        <div className="text-left">
                            <div className="flex items-center text-primary-900 dark:text-white font-bold text-2xl md:text-3xl mb-1">
                                500+
                            </div>
                            <div className="text-sm md:text-base text-primary-500 font-medium">Listings<br />Processed</div>
                        </div>
                        <div className="text-left">
                            <div className="flex items-center text-primary-900 dark:text-white font-bold text-2xl md:text-3xl mb-1">
                                2026
                            </div>
                            <div className="text-sm md:text-base text-primary-500 font-medium">Forecast<br />Horizon</div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
