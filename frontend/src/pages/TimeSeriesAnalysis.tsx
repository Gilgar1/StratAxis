import React from 'react';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TimeSeriesAnalysis: React.FC = () => {
  // Mock time series data since real historical data isn't in JSON yet
  const data = [
    { year: '2020', douala: 65000, yaounde: 72000, inflation: 2.5 },
    { year: '2021', douala: 72000, yaounde: 78000, inflation: 2.3 },
    { year: '2022', douala: 78000, yaounde: 85000, inflation: 6.2 },
    { year: '2023', douala: 85000, yaounde: 94000, inflation: 5.9 },
    { year: '2024', douala: 92000, yaounde: 102000, inflation: 4.8 },
    { year: '2025', douala: 97500, yaounde: 108000, inflation: 4.2 },
  ];

  return (
    <AuthenticatedLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-primary-900 dark:text-white mb-2">Time Series & Trend Analysis</h1>
          <p className="text-primary-600 dark:text-primary-400">
            Historical performance of major markets against economic indicators.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart 1: Price Growth */}
          <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm">
            <h3 className="font-bold text-lg mb-6 text-primary-900 dark:text-white">5-Year Land Price Evolution</h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="douala" fill="#D4AF37" stroke="#D4AF37" fillOpacity={0.2} name="Douala Avg" />
                  <Area type="monotone" dataKey="yaounde" fill="#374151" stroke="#374151" fillOpacity={0.2} name="Yaoundé Avg" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Growth vs Inflation */}
          <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm">
            <h3 className="font-bold text-lg mb-6 text-primary-900 dark:text-white">Real Growth vs Inflation</h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="year" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="douala" stroke="#D4AF37" strokeWidth={3} name="Douala Price" />
                  <Line yAxisId="right" type="step" dataKey="inflation" stroke="#ef4444" strokeWidth={2} name="Inflation %" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default TimeSeriesAnalysis;
