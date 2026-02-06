import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Briefcase, Landmark, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const UserSegments: React.FC = () => {
    const segments = [
        {
            icon: Building2,
            title: "Individual Investors",
            description: "Make confident decisions for your next land or property acquisition.",
            features: ["Price history analysis", "Neighborhood comparisons", "ROI estimates"],
            cta: "Start Investing",
            link: "/register?type=individual"
        },
        {
            icon: Briefcase,
            title: "Real Estate Professionals",
            description: "Enhance your advisory services with defensible market data.",
            features: ["Client-ready reports", "Market trend forecasting", "Portfolio valuation"],
            cta: "Professional Access",
            link: "/register?type=professional"
        },
        {
            icon: Landmark,
            title: "Institutions & Developers",
            description: "Strategic intelligence for large-scale development and policy.",
            features: ["Deep raw data access", "Custom API integration", "Quarterly strategy briefings"],
            cta: "Contact Sales",
            link: "/book-consultation?type=institutional"
        }
    ];

    return (
        <section className="section-padding bg-white dark:bg-primary-950">
            <div className="container-custom">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary-900 dark:text-white">
                        Tailored Intelligence for Every Stakeholder
                    </h2>
                    <p className="text-lg text-primary-600 dark:text-primary-400">
                        Whether you are buying your first plot or planning a city district, StratAxis delivers the right level of insight.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {segments.map((segment, index) => {
                        const Icon = segment.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="group flex flex-col p-8 rounded-2xl bg-white dark:bg-primary-900 border border-primary-200 dark:border-primary-800 hover:border-accent-gold/50 dark:hover:border-accent-gold/50 hover:shadow-hard transition-all duration-300"
                            >
                                <div className="w-14 h-14 rounded-xl bg-primary-50 dark:bg-primary-800 flex items-center justify-center mb-6 group-hover:bg-accent-gold/10 transition-colors">
                                    <Icon className="w-7 h-7 text-primary-700 dark:text-primary-300 group-hover:text-accent-gold transition-colors" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-primary-900 dark:text-white">
                                    {segment.title}
                                </h3>
                                <p className="text-primary-600 dark:text-primary-400 mb-6 flex-grow">
                                    {segment.description}
                                </p>

                                <ul className="space-y-3 mb-8">
                                    {segment.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start text-sm text-primary-600 dark:text-primary-400">
                                            <CheckCircle2 className="w-4 h-4 text-accent-gold mr-2 mt-0.5" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    to={segment.link}
                                    className="btn btn-outline w-full text-center group-hover:bg-primary-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-primary-900 group-hover:border-transparent transition-all"
                                >
                                    {segment.cta}
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default UserSegments;
