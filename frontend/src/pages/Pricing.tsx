import React from 'react';
import PublicLayout from '../layouts/PublicLayout';
import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const Pricing: React.FC = () => {
  const plans = [
    {
      name: "Free",
      price: "0",
      period: "forever",
      description: "Basic market awareness for casual house hunters.",
      features: [
        "Public market reports",
        "Basic search",
        "Limited blog access",
        "Community support"
      ],
      cta: "Get Started",
      featured: false,
      role: "FREE_USER"
    },
    {
      name: "Pro Investor",
      price: "15,000",
      currency: "XAF",
      period: "per month",
      description: "Deep intelligence for active investors and agents.",
      features: [
        "Interactive Heatmaps (Douala & Yaoundé)",
        "Price History (2020-Present)",
        "Smart Insights & Alerts",
        "Yield Calculator",
        "Watchlists (up to 20 properties)"
      ],
      cta: "Start Free Trial",
      featured: true,
      role: "PAID_USER"
    },
    {
      name: "Institutional",
      price: "Custom",
      description: "Raw data API and strategy for developers.",
      features: [
        "Full API Access",
        "Raw Data Exports (CSV/JSON)",
        "Custom Geography Mapping",
        "Quarterly Analyst Briefings",
        "Priority Support"
      ],
      cta: "Contact Sales",
      featured: false,
      role: "INSTITUTIONAL"
    }
  ];

  return (
    <PublicLayout>
      <div className="bg-primary-50 dark:bg-primary-950 py-20 px-4">
        <div className="container-custom">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl font-bold text-primary-900 dark:text-white mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-primary-600 dark:text-primary-400">
              Invest in intelligence that pays for itself in one deal.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative flex flex-col p-8 rounded-2xl ${plan.featured
                    ? 'bg-primary-900 text-white shadow-2xl scale-105 border border-accent-gold'
                    : 'bg-white dark:bg-primary-900 border border-primary-200 dark:border-primary-800'
                  }`}
              >
                {plan.featured && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-accent-gold text-primary-950 text-sm font-bold px-4 py-1 rounded-full uppercase tracking-wide flex items-center shadow-lg">
                      <Star className="w-4 h-4 mr-1 fill-current" /> Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-8">
                  <h3 className={`text-xl font-bold mb-2 ${plan.featured ? 'text-white' : 'text-primary-900 dark:text-white'}`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline mb-4">
                    <span className="text-4xl font-extrabold">{plan.currency && <span className="text-base align-top mr-1">FCFA</span>}{plan.price}</span>
                    <span className={`ml-2 text-sm ${plan.featured ? 'text-primary-300' : 'text-primary-500'}`}>
                      {plan.period ? `/${plan.period}` : ''}
                    </span>
                  </div>
                  <p className={`text-sm ${plan.featured ? 'text-primary-300' : 'text-primary-500 dark:text-primary-400'}`}>
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-4 mb-8 flex-grow">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className={`w-5 h-5 mr-3 flex-shrink-0 ${plan.featured ? 'text-accent-gold' : 'text-semantic-success'}`} />
                      <span className={`text-sm ${plan.featured ? 'text-primary-100' : 'text-primary-600 dark:text-primary-300'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={plan.price === 'Custom' ? '/book-consultation' : '/register'}
                  className={`w-full py-3 px-6 rounded-lg font-bold text-center transition-colors ${plan.featured
                      ? 'bg-accent-gold text-primary-950 hover:bg-accent-gold-light'
                      : 'bg-primary-100 dark:bg-primary-800 text-primary-900 dark:text-white hover:bg-primary-200 dark:hover:bg-primary-700'
                    }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* FAQ or Trust signal */}
          <div className="mt-20 text-center">
            <p className="text-primary-500">
              Need help choosing? <Link to="/book-consultation" className="text-accent-gold font-medium hover:underline">Book a free strategy call</Link>
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Pricing;
