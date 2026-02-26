import React from 'react';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, FileText } from 'lucide-react';
import { exportToCSV, downloadAsPDF } from '../utils/exportUtils';

const TIME_SERIES_DATA = [
  { year: '2020', douala: 65000, yaounde: 72000, inflation: 2.5 },
  { year: '2021', douala: 72000, yaounde: 78000, inflation: 2.3 },
  { year: '2022', douala: 78000, yaounde: 85000, inflation: 6.2 },
  { year: '2023', douala: 85000, yaounde: 94000, inflation: 5.9 },
  { year: '2024', douala: 92000, yaounde: 102000, inflation: 4.8 },
  { year: '2025', douala: 97500, yaounde: 108000, inflation: 4.2 },
];

const TimeSeriesAnalysis: React.FC = () => {

  const handleExportCSV = () => {
    const rows = TIME_SERIES_DATA.map(row => ({
      Year: row.year,
      'Douala Avg Land Price (XAF/m²)': row.douala,
      'Yaoundé Avg Land Price (XAF/m²)': row.yaounde,
      'Inflation Rate (%)': row.inflation,
      'Douala YoY Growth (%)': row.year === '2020' ? '-' : (((row.douala - (TIME_SERIES_DATA.find(d => d.year === String(Number(row.year) - 1))?.douala ?? row.douala)) / (TIME_SERIES_DATA.find(d => d.year === String(Number(row.year) - 1))?.douala ?? row.douala)) * 100).toFixed(1),
    }));
    exportToCSV(rows, `StratAxis_Time_Series_Analysis_${new Date().toISOString().slice(0, 10)}`);
  };

  const handleDownloadPDF = () => {
    downloadAsPDF('StratAxis – Time Series & Trend Analysis');
  };

  return (
    <AuthenticatedLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary-900 dark:text-white mb-2">Time Series &amp; Trend Analysis</h1>
            <p className="text-primary-600 dark:text-primary-400">
              Historical performance of major markets against economic indicators.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleDownloadPDF} className="btn btn-outline flex items-center">
              <FileText className="w-4 h-4 mr-2" /> Download PDF
            </button>
            <button onClick={handleExportCSV} className="btn btn-outline flex items-center">
              <Download className="w-4 h-4 mr-2" /> Export CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart 1: Price Growth */}
          <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm">
            <h3 className="font-bold text-lg mb-6 text-primary-900 dark:text-white">5-Year Land Price Evolution</h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={TIME_SERIES_DATA}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => [`${value.toLocaleString()} XAF/m²`]} />
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
                <ComposedChart data={TIME_SERIES_DATA}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="year" />
                  <YAxis yAxisId="left" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${v}%`} />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="douala" stroke="#D4AF37" strokeWidth={3} name="Douala Price" />
                  <Line yAxisId="right" type="step" dataKey="inflation" stroke="#ef4444" strokeWidth={2} name="Inflation %" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-primary-900 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-primary-100 dark:border-primary-800">
            <h3 className="font-bold text-primary-900 dark:text-white">Historical Data Table</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-primary-50 dark:bg-primary-800">
                <tr>
                  <th className="p-4 font-semibold text-primary-900 dark:text-white">Year</th>
                  <th className="p-4 font-semibold text-primary-900 dark:text-white text-right">Douala (XAF/m²)</th>
                  <th className="p-4 font-semibold text-primary-900 dark:text-white text-right">Yaoundé (XAF/m²)</th>
                  <th className="p-4 font-semibold text-primary-900 dark:text-white text-right">Inflation</th>
                  <th className="p-4 font-semibold text-primary-900 dark:text-white text-right">Douala YoY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-100 dark:divide-primary-800">
                {TIME_SERIES_DATA.map((row, idx) => {
                  const prev = TIME_SERIES_DATA[idx - 1];
                  const yoy = prev ? (((row.douala - prev.douala) / prev.douala) * 100).toFixed(1) : null;
                  return (
                    <tr key={row.year} className="hover:bg-primary-50 dark:hover:bg-primary-800/50 transition-colors">
                      <td className="p-4 font-bold text-primary-900 dark:text-white">{row.year}</td>
                      <td className="p-4 text-right font-mono text-accent-gold-dark dark:text-accent-gold">{row.douala.toLocaleString()}</td>
                      <td className="p-4 text-right font-mono text-primary-700 dark:text-primary-300">{row.yaounde.toLocaleString()}</td>
                      <td className="p-4 text-right">
                        <span className="text-semantic-error font-medium">{row.inflation}%</span>
                      </td>
                      <td className="p-4 text-right">
                        {yoy ? (
                          <span className="text-semantic-success font-medium">+{yoy}%</span>
                        ) : (
                          <span className="text-primary-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default TimeSeriesAnalysis;
