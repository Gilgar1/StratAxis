import React from 'react';
import PublicLayout from '../layouts/PublicLayout';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Database, ShieldCheck, Filter, Search } from 'lucide-react';

const Methodology: React.FC = () => {
  return (
    <PublicLayout>
      <div className="bg-white dark:bg-primary-950">
        {/* Header */}
        <div className="bg-primary-50 dark:bg-primary-900 py-16 md:py-24">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-primary-900 dark:text-white mb-6">
                Data Methodology
              </h1>
              <p className="text-xl text-primary-600 dark:text-primary-300">
                How we collect, clean, and validate accurate real estate intelligence for the Cameroonian market.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Content */}
        <div className="container-custom py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              <section>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="p-3 bg-accent-gold/10 rounded-lg">
                    <Search className="w-6 h-6 text-accent-gold" />
                  </div>
                  <h2 className="text-2xl font-bold text-primary-900 dark:text-white">1. Data Collection</h2>
                </div>
                <p className="text-primary-600 dark:text-primary-400 leading-relaxed mb-4">
                  StratAxis aggregates data from a diverse set of sources to build a comprehensive picture of the market. Our automated pipelines scrape and ingest data daily from:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-primary-600 dark:text-primary-400">
                  <li>Major online real estate listings and marketplaces</li>
                  <li>Social media property groups (Facebook, WhatsApp)</li>
                  <li>Partner real estate agency feeds</li>
                  <li>Public land registry records (where available)</li>
                </ul>
              </section>

              <section>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="p-3 bg-semantic-info/10 rounded-lg">
                    <Filter className="w-6 h-6 text-semantic-info" />
                  </div>
                  <h2 className="text-2xl font-bold text-primary-900 dark:text-white">2. Cleaning & Normalization</h2>
                </div>
                <p className="text-primary-600 dark:text-primary-400 leading-relaxed">
                  Raw data is noisy. Our ETL (Extract, Transform, Load) engine standardizes every record:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-primary-600 dark:text-primary-400 mt-4">
                  <li><strong>Currency Normalization:</strong> All prices converted to XAF.</li>
                  <li><strong>Location Mapping:</strong> Fuzzy matching aligns varied neighborhood spellings (e.g., "Bonapriso", "Bona Priso") to standard geozones.</li>
                  <li><strong>Duplicate Removal:</strong> Deduplication algorithms identify multiple listings for the same property across different sites.</li>
                </ul>
              </section>

              <section>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="p-3 bg-semantic-success/10 rounded-lg">
                    <ShieldCheck className="w-6 h-6 text-semantic-success" />
                  </div>
                  <h2 className="text-2xl font-bold text-primary-900 dark:text-white">3. Confidence Scoring</h2>
                </div>
                <p className="text-primary-600 dark:text-primary-400 leading-relaxed mb-4">
                  We verify accuracy, we don't just assume it. Every data point is assigned a <strong>Confidence Score (1.0 - 5.0)</strong> based on:
                </p>
                <div className="bg-primary-50 dark:bg-primary-900 p-6 rounded-xl border border-primary-100 dark:border-primary-800">
                  <ul className="space-y-4">
                    <li className="flex justify-between items-center">
                      <span className="font-medium">Source Reliability</span>
                      <div className="w-32 h-2 bg-primary-200 rounded-full overflow-hidden">
                        <div className="bg-accent-gold h-full w-[80%]"></div>
                      </div>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="font-medium">Data Completeness</span>
                      <div className="w-32 h-2 bg-primary-200 rounded-full overflow-hidden">
                        <div className="bg-accent-gold h-full w-[60%]"></div>
                      </div>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="font-medium">Cross-Validation</span>
                      <div className="w-32 h-2 bg-primary-200 rounded-full overflow-hidden">
                        <div className="bg-accent-gold h-full w-[90%]"></div>
                      </div>
                    </li>
                  </ul>
                </div>
                <p className="text-sm text-primary-500 mt-4">
                  *Datapoints with a score below 3.0 are flagged as "Low Confidence" in the dashboard.
                </p>
              </section>

              <section>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="p-3 bg-primary-900 rounded-lg">
                    <Database className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-primary-900 dark:text-white">4. Limitations</h2>
                </div>
                <p className="text-primary-600 dark:text-primary-400 leading-relaxed">
                  Transparency is key. Our current limitations include:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-primary-600 dark:text-primary-400 mt-4">
                  <li><strong>Lag Time:</strong> Some offline transactions may not be reflected immediately.</li>
                  <li><strong>Negotiation Gap:</strong> Listing prices may differ from final transaction prices (typically 5-10% variance).</li>
                  <li><strong>Geographic Scope:</strong> Currently limited to Douala and Yaoundé metropolitan areas.</li>
                </ul>
              </section>
            </div>

            {/* Sidebar */}
            <div className="hidden lg:block">
              <div className="sticky top-24 space-y-6">
                <div className="p-6 bg-primary-50 dark:bg-primary-900 rounded-xl border border-primary-200 dark:border-primary-800">
                  <h3 className="font-bold text-lg mb-4">Data Summary</h3>
                  <div className="flex justify-between py-3 border-b border-primary-200 dark:border-primary-800">
                    <span className="text-primary-600">Update Frequency</span>
                    <span className="font-medium">Daily</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-primary-200 dark:border-primary-800">
                    <span className="text-primary-600">History From</span>
                    <span className="font-medium">2020</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-primary-200 dark:border-primary-800">
                    <span className="text-primary-600">Coverage</span>
                    <span className="font-medium">31 Quarters</span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="text-primary-600">Accuracy target</span>
                    <span className="font-medium text-semantic-success">&gt; 95%</span>
                  </div>
                </div>

                <div className="p-6 bg-primary-900 text-white rounded-xl">
                  <h3 className="font-bold text-lg mb-2">Have specific data needs?</h3>
                  <p className="text-primary-300 text-sm mb-4">
                    We offer custom scraping and API access for institutional clients.
                  </p>
                  <Link to="/contact" className="btn btn-gold w-full text-center block">
                    Contact Data Team
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Methodology;
