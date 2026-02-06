import React from 'react';
import PublicLayout from '../layouts/PublicLayout';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Share2 } from 'lucide-react';

const BlogArticle: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  return (
    <PublicLayout>
      <article className="bg-white dark:bg-primary-950 pb-20">
        {/* Simple Cover Header */}
        <div className="bg-primary-50 dark:bg-primary-900 py-16 md:py-24">
          <div className="container-custom max-w-4xl mx-auto">
            <Link to="/blog" className="inline-flex items-center text-sm font-bold text-accent-gold mb-8 hover:underline">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Insights
            </Link>

            <div className="flex items-center space-x-4 text-sm text-primary-500 mb-6">
              <span className="bg-primary-200 dark:bg-primary-800 text-primary-800 dark:text-primary-200 px-3 py-1 rounded-full font-bold uppercase text-xs tracking-wider">
                Market Report
              </span>
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" /> Jan 12, 2026
              </span>
              <span className="flex items-center">
                <User className="w-4 h-4 mr-1" /> StratAxis Analytics
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-primary-900 dark:text-white leading-tight mb-6">
              {slug
                ? slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') // Mock title from slug
                : "Douala Market Report Q4 2025: Bonapriso Surges"}
            </h1>

            <p className="text-xl text-primary-600 dark:text-primary-300 leading-relaxed">
              Land prices in Bonapriso have hit a historic high of 97,000 XAF/m², driven by scarcity and a new wave of mixed-use developments. Here is what investors need to know.
            </p>
          </div>
        </div>

        {/* Article Body */}
        <div className="container-custom max-w-3xl mx-auto mt-12">
          <div className="prose prose-lg dark:prose-invert prose-primary max-w-none">
            <p>
              The Douala real estate market has shown resilience in Q4 2025, with the <strong>Compound Annual Growth Rate (CAGR)</strong> for prime residential land exceeding 12% in select neighborhoods.
            </p>

            <h3>The Bonapriso Anomaly</h3>
            <p>
              While broader Douala growth sits at 4-6%, Bonapriso continues to defy gravity. Analyzing over 50 listings from Q3 to Q4, we observed a tightening of supply which has pushed median asking prices from 88,500 XAF/m² to 97,632 XAF/m².
            </p>

            <blockquote>
              "The scarcity of developable plots larger than 500m² is the primary driver. Developers are now competing for the same limited inventory."
            </blockquote>

            <h3>Key Drivers</h3>
            <ul>
              <li><strong>Infrastructure:</strong> Completion of the secondary access road has improved traffic flow.</li>
              <li><strong>Zoning Changes:</strong> New permits for vertical density (G+4 to G+6) have increased land value utility.</li>
              <li><strong>Expat Demand:</strong> Rental yields for furnished apartments in the zone remain the highest in the city.</li>
            </ul>

            <div className="bg-primary-50 dark:bg-primary-900 p-6 rounded-xl border-l-4 border-accent-gold my-8">
              <h4 className="font-bold text-primary-900 dark:text-white mt-0 mb-2">Investor Tip</h4>
              <p className="text-sm m-0">
                Look for older villas with large setbacks. The tear-down value for redevelopment is currently outpacing the rental value of the existing structures.
              </p>
            </div>

            <h3>Outlook for 2026</h3>
            <p>
              We project this trend to stabilize by Q2 2026 as buyers reach price resistance levels. However, look for spillover effects into adjacent neighborhoods like <strong>Bali</strong> and the southern edges of <strong>Akwa</strong>.
            </p>
          </div>

          {/* Share / Footer */}
          <div className="mt-12 pt-8 border-t border-primary-200 dark:border-primary-800 flex justify-between items-center">
            <div className="text-sm text-primary-500">
              Categories: <span className="font-medium text-primary-900 dark:text-white">Market Analysis, Investment</span>
            </div>
            <button className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 hover:text-accent-gold transition-colors">
              <Share2 className="w-4 h-4" />
              <span className="text-sm font-medium">Share Report</span>
            </button>
          </div>
        </div>
      </article>
    </PublicLayout>
  );
};

export default BlogArticle;
