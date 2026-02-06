import React, { useState } from 'react';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import { useLandPrices } from '../hooks/useData';
import { formatCurrency, formatConfidenceScore, formatCompactNumber } from '../utils/formatters';
import { Search, Filter, Download, ArrowUpDown } from 'lucide-react';
import Loading from '../components/common/Loading';
import clsx from 'clsx';

// We need to create the hook first, but I'll write the component assuming the hook exists or inline the data loading for now.
// Actually, creating a hook based on the JSON file is better architecture.
// For this step, I'll import the JSON directly since it's in src/data

import landDataRaw from '../data/land_prices_intelligence.json';
import { LandPriceData, LandPriceNeighborhood } from '../types';

const LandPriceIntelligence: React.FC = () => {
  const data = landDataRaw as unknown as LandPriceData;
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState<'All' | 'Douala' | 'Yaoundé'>('All');
  const [sortField, setSortField] = useState<keyof LandPriceNeighborhood>('median_land_price_per_sqm_xaf');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: keyof LandPriceNeighborhood) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredData = data.neighborhoods.filter((item) => {
    const matchesSearch = item.neighborhood.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = cityFilter === 'All' || item.city === cityFilter;
    return matchesSearch && matchesCity;
  }).sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    // numeric sort
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <AuthenticatedLayout>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary-900 dark:text-white mb-2">Land Price Intelligence</h1>
            <p className="text-primary-600 dark:text-primary-400">
              Detailed price analysis per square meter across {data.metadata.total_neighborhoods} neighborhoods.
            </p>
          </div>
          <button className="btn btn-outline flex items-center">
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-primary-900 p-4 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
            <input
              type="text"
              placeholder="Search neighborhood..."
              className="input pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <Filter className="w-5 h-5 text-primary-400" />
            <select
              className="input w-40"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value as any)}
            >
              <option value="All">All Cities</option>
              <option value="Douala">Douala</option>
              <option value="Yaoundé">Yaoundé</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-primary-900 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary-50 dark:bg-primary-800 border-b border-primary-200 dark:border-primary-700">
                  <th className="p-4 font-semibold text-primary-900 dark:text-white cursor-pointer hover:bg-primary-100 dark:hover:bg-primary-700 transition" onClick={() => handleSort('city')}>
                    <div className="flex items-center">City <ArrowUpDown className="w-3 h-3 ml-2 opacity-50" /></div>
                  </th>
                  <th className="p-4 font-semibold text-primary-900 dark:text-white cursor-pointer hover:bg-primary-100 dark:hover:bg-primary-700 transition" onClick={() => handleSort('neighborhood')}>
                    <div className="flex items-center">Neighborhood <ArrowUpDown className="w-3 h-3 ml-2 opacity-50" /></div>
                  </th>
                  <th className="p-4 font-semibold text-primary-900 dark:text-white text-right cursor-pointer hover:bg-primary-100 dark:hover:bg-primary-700 transition" onClick={() => handleSort('median_land_price_per_sqm_xaf')}>
                    <div className="flex items-center justify-end">Median Price/m² <ArrowUpDown className="w-3 h-3 ml-2 opacity-50" /></div>
                  </th>
                  <th className="p-4 font-semibold text-primary-900 dark:text-white text-right cursor-pointer hover:bg-primary-100 dark:hover:bg-primary-700 transition" onClick={() => handleSort('p25_land_price_per_sqm_xaf')}>
                    <div className="flex items-center justify-end">Low Range (P25) <ArrowUpDown className="w-3 h-3 ml-2 opacity-50" /></div>
                  </th>
                  <th className="p-4 font-semibold text-primary-900 dark:text-white text-right cursor-pointer hover:bg-primary-100 dark:hover:bg-primary-700 transition" onClick={() => handleSort('p75_land_price_per_sqm_xaf')}>
                    <div className="flex items-center justify-end">High Range (P75) <ArrowUpDown className="w-3 h-3 ml-2 opacity-50" /></div>
                  </th>
                  <th className="p-4 font-semibold text-primary-900 dark:text-white text-center cursor-pointer hover:bg-primary-100 dark:hover:bg-primary-700 transition" onClick={() => handleSort('listing_count')}>
                    <div className="flex items-center justify-center">Listings <ArrowUpDown className="w-3 h-3 ml-2 opacity-50" /></div>
                  </th>
                  <th className="p-4 font-semibold text-primary-900 dark:text-white text-center cursor-pointer hover:bg-primary-100 dark:hover:bg-primary-700 transition" onClick={() => handleSort('data_confidence_flag')}>
                    <div className="flex items-center justify-center">Confidence <ArrowUpDown className="w-3 h-3 ml-2 opacity-50" /></div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, idx) => (
                  <tr
                    key={`${row.city}-${row.neighborhood}`}
                    className="border-b border-primary-100 dark:border-primary-800 hover:bg-primary-50 dark:hover:bg-primary-800/50 transition-colors"
                  >
                    <td className="p-4 text-primary-600 dark:text-primary-300 font-medium">{row.city}</td>
                    <td className="p-4 text-primary-900 dark:text-white font-bold">{row.neighborhood}</td>
                    <td className="p-4 text-right font-mono text-accent-gold-dark dark:text-accent-gold font-bold">
                      {formatCurrency(row.median_land_price_per_sqm_xaf)}
                    </td>
                    <td className="p-4 text-right font-mono text-sm text-primary-500">
                      {formatCurrency(row.p25_land_price_per_sqm_xaf)}
                    </td>
                    <td className="p-4 text-right font-mono text-sm text-primary-500">
                      {formatCurrency(row.p75_land_price_per_sqm_xaf)}
                    </td>
                    <td className="p-4 text-center text-sm">
                      <span className="bg-primary-100 dark:bg-primary-800 px-2 py-1 rounded text-primary-700 dark:text-primary-300 font-medium">
                        {row.listing_count}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={clsx(
                          'px-2 py-1 rounded text-xs font-bold uppercase tracking-wider',
                          row.data_confidence_flag === 'High' && 'bg-semantic-success/10 text-semantic-success',
                          row.data_confidence_flag === 'Medium' && 'bg-semantic-warning/10 text-semantic-warning',
                          row.data_confidence_flag === 'Low' && 'bg-semantic-error/10 text-semantic-error'
                        )}
                      >
                        {row.data_confidence_flag}
                      </span>
                    </td>
                  </tr>
                ))}

                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-primary-500">
                      No neighborhoods found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 text-right text-xs text-primary-400 bg-primary-50 dark:bg-primary-900 border-t border-primary-200 dark:border-primary-800">
            Based on {data.metadata.total_listings_analyzed} listings. Generated: {new Date(data.metadata.generated_at).toLocaleDateString()}.
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default LandPriceIntelligence;
