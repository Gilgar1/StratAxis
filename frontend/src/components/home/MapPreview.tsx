import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const MapPreview: React.FC = () => {
    return (
        <section className="py-20 bg-primary-950 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#404040 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

            <div className="container-custom relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                            Visualise Market Trends Geographically
                        </h2>
                        <p className="text-lg text-primary-300 mb-8 max-w-lg">
                            Our interactive quarter maps allow you to spot undervalued neighborhoods and high-growth zones instantly.
                        </p>

                        <div className="space-y-6 mb-10">
                            <div className="flex items-start">
                                <div className="w-10 h-10 rounded-full bg-accent-gold/20 flex items-center justify-center mr-4 flex-shrink-0">
                                    <span className="text-accent-gold font-bold">1</span>
                                </div>
                                <div>
                                    <h4 className="text-white font-semibold mb-1">Heatmaps</h4>
                                    <p className="text-primary-400 text-sm">Visualize price density and growth across Douala & Yaoundé.</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="w-10 h-10 rounded-full bg-accent-gold/20 flex items-center justify-center mr-4 flex-shrink-0">
                                    <span className="text-accent-gold font-bold">2</span>
                                </div>
                                <div>
                                    <h4 className="text-white font-semibold mb-1">Quarter Drill-down</h4>
                                    <p className="text-primary-400 text-sm">Click any zone for detailed price history and demographic proxies.</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="w-10 h-10 rounded-full bg-accent-gold/20 flex items-center justify-center mr-4 flex-shrink-0">
                                    <span className="text-accent-gold font-bold">3</span>
                                </div>
                                <div>
                                    <h4 className="text-white font-semibold mb-1">Infrastructure Layers</h4>
                                    <p className="text-primary-400 text-sm">See future development vectors and road networks.</p>
                                </div>
                            </div>
                        </div>

                        <Link to="/register" className="btn btn-gold px-8 py-3">
                            Unlock Interactive Maps
                        </Link>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        {/* Abstract Map UI Representation */}
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-primary-800 bg-primary-900/50 backdrop-blur-sm aspect-video group">
                            {/* Map Illustration (CSS Shapes) */}
                            <div className="absolute inset-0 bg-[#1a1a1a]">
                                {/* Roads */}
                                <div className="absolute top-0 bottom-0 left-1/3 w-2 bg-[#333] transform -skew-x-12"></div>
                                <div className="absolute top-1/2 left-0 right-0 h-2 bg-[#333] transform -skew-y-6"></div>

                                {/* Zones (Heatmap effect) */}
                                <div className="absolute top-1/4 left-1/4 w-24 h-24 bg-accent-gold/30 rounded-full blur-xl"></div>
                                <div className="absolute bottom-1/3 right-1/4 w-32 h-32 bg-semantic-success/20 rounded-full blur-xl"></div>

                                {/* UI Overlay */}
                                <div className="absolute top-4 left-4 right-4 flex justify-between">
                                    <div className="bg-primary-900/80 backdrop-blur px-3 py-1.5 rounded text-xs text-white border border-primary-700">
                                        Douala, Littoral
                                    </div>
                                    <div className="bg-primary-900/80 backdrop-blur px-3 py-1.5 rounded text-xs text-accent-gold border border-accent-gold/30">
                                        Price Growth: High
                                    </div>
                                </div>

                                {/* Tooltip */}
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-primary-800 p-4 rounded-lg shadow-xl border border-primary-700 opacity-90">
                                    <div className="text-xs font-bold text-white mb-1">Bonapriso</div>
                                    <div className="text-xl font-bold text-accent-gold mb-1">97,632 XAF/m²</div>
                                    <div className="flex items-center text-xs text-semantic-success">
                                        <span>▲ 12% YoY</span>
                                    </div>
                                </div>
                            </div>

                            {/* Unlock Overlay */}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <Link to="/register" className="btn btn-gold btn-sm">View Live Map</Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default MapPreview;
