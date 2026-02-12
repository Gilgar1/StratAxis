import React from 'react';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const DataQuality: React.FC = () => {
  const sourceDistribution = [
    { name: 'Validated Listings', value: 350 },
    { name: 'Partner Feeds', value: 120 },
    { name: 'Public Records', value: 40 },
  ];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b'];

  const qualityMetrics = [
    { label: 'Data Completeness', score: 92, status: 'good' },
    { label: 'Geocoding Accuracy', score: 88, status: 'good' },
    { label: 'Price Outlier Removal', score: 95, status: 'excellent' },
    { label: 'Refresh Rate', score: 98, status: 'excellent' },
  ];

  return (
    <AuthenticatedLayout>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center space-x-3 mb-8">
          <div className="p-2 bg-semantic-success/10 rounded-lg">
            <CheckCircle className="w-6 h-6 text-semantic-success" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary-900 dark:text-white">Data Quality & Confidence</h1>
            <p className="text-primary-600 dark:text-primary-400">Transparency report on our data sources and validation pipelines.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Overall Score */}
          <div className="bg-white dark:bg-primary-900 p-8 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm flex flex-col items-center justify-center text-center">
            <h3 className="text-lg font-bold text-primary-600 dark:text-primary-300 mb-6">Global Confidence Score</h3>
            <div className="relative w-48 h-48 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-8 border-primary-100 dark:border-primary-800"></div>
              <div className="absolute inset-0 rounded-full border-8 border-accent-gold border-t-transparent border-l-transparent transform -rotate-45" style={{ clipPath: 'circle(100%)' }}></div>
              <div className="text-center">
                <span className="text-6xl font-bold text-primary-900 dark:text-white">4.8</span>
                <span className="block text-sm text-primary-500 dark:text-primary-400">out of 5.0</span>
              </div>
            </div>
            <p className="mt-6 text-sm text-primary-600 dark:text-primary-400 max-w-sm">
              Our data is currently rated <strong>High Confidence</strong>. 92% of listings have passed strict verification checks.
            </p>
          </div>

          {/* Source Distribution */}
          <div className="bg-white dark:bg-primary-900 p-8 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm">
            <h3 className="text-lg font-bold text-primary-900 dark:text-white mb-4">Source Composition</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceDistribution}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {sourceDistribution.map((_, index) => (
                      <Cell key={`cell - ${index} `} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-6 mt-4">
              {sourceDistribution.map((entry, index) => (
                <div key={index} className="flex items-center text-sm text-primary-600 dark:text-primary-400">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index] }}></div>
                  {entry.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="bg-white dark:bg-primary-900 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-primary-200 dark:border-primary-800">
            <h3 className="font-bold text-lg text-primary-900 dark:text-white">Validation Pipeline Metrics</h3>
          </div>
          <div className="divide-y divide-primary-200 dark:divide-primary-800">
            {qualityMetrics.map((metric, idx) => (
              <div key={idx} className="p-6 flex items-center justify-between hover:bg-primary-50 dark:hover:bg-primary-800/50 transition-colors">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-semantic-success mr-4" />
                  <span className="font-medium text-primary-900 dark:text-white">{metric.label}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-48 h-2 bg-primary-100 dark:bg-primary-800 rounded-full overflow-hidden">
                    <div className="h-full bg-semantic-success" style={{ width: `${metric.score}% ` }}></div>
                  </div>
                  <span className="font-bold text-primary-700 dark:text-primary-300 w-8 text-right">{metric.score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-primary-50 dark:bg-primary-900/50 rounded-lg flex items-start text-sm text-primary-500">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          <p>
            StratAxis employs automated anomaly detection. While we strive for accuracy, real estate markets are opaque. Always verify critical data points with offline due diligence.
          </p>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default DataQuality;
