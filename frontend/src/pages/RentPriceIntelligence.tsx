import React, { useState } from 'react';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import { formatCurrency } from '../utils/formatters';
import { Search, Filter, Info } from 'lucide-react';
import clsx from 'clsx';

// Import JSON directly
import rentalDataRaw from '../data/rental_intelligence.json';
import { RentalIntelligence } from '../types';

const RentPriceIntelligence: React.FC = () => {
  // Cast the raw JSON to our type. Note: structure is City -> Neighborhood -> Data
  // The provided JSON has City -> Neighborhood -> HousingType -> Year -> Data
  const data = rentalDataRaw as unknown as RentalIntelligence;

  const [selectedCity, setSelectedCity] = useState<string>('douala');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('');
  const [housingFilter, setHousingFilter] = useState<string>('all');

  // Flatten logic to visuals
  // We need to transform the nested object into a flat array for rendering rows
  const flattenedRows: any[] = [];

  Object.entries(data).forEach(([cityKey, cityData]) => {
    if (selectedCity && cityKey.toLowerCase() !== selectedCity.toLowerCase()) return;

    Object.entries(cityData).forEach(([neighborhoodKey, neighborhoodData]) => {
      // Filter by neighborhood if needed
      if (selectedNeighborhood && !neighborhoodKey.toLowerCase().includes(selectedNeighborhood.toLowerCase())) return;

      Object.entries(neighborhoodData).forEach(([housingType, yearlyData]) => {
        if (housingFilter !== 'all' && housingType !== housingFilter) return;

        Object.entries(yearlyData).forEach(([year, stats]) => {
          flattenedRows.push({
            city: cityKey,
            neighborhood: neighborhoodKey || '(Unknown)',
            housingType,
            year,
            ...stats
          });
        });
      });
    });
  });

  return (
    <AuthenticatedLayout>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-900 dark:text-white mb-2">Rental Intelligence</h1>
          <p className="text-primary-600 dark:text-primary-400">
            Median monthly rents and volatility indices by housing type.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* City Tabs */}
          <div className="flex bg-primary-100 dark:bg-primary-800 p-1 rounded-lg">
            <button
              onClick={() => setSelectedCity('douala')}
              className={clsx(
                "px-4 py-2 text-sm font-medium rounded-md transition-all",
                selectedCity === 'douala' ? "bg-white dark:bg-primary-900 text-primary-900 dark:text-white shadow-sm" : "text-primary-500 hover:text-primary-700"
              )}
            >
              Douala
            </button>
            <button
              onClick={() => setSelectedCity('yaounde')}
              className={clsx(
                "px-4 py-2 text-sm font-medium rounded-md transition-all",
                selectedCity === 'yaounde' ? "bg-white dark:bg-primary-900 text-primary-900 dark:text-white shadow-sm" : "text-primary-500 hover:text-primary-700"
              )}
            >
              Yaoundé
            </button>
          </div>

          {/* Neighborhood Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
            <input
              type="text"
              placeholder="Filter by neighborhood..."
              className="input pl-10"
              value={selectedNeighborhood}
              onChange={(e) => setSelectedNeighborhood(e.target.value)}
            />
          </div>

          {/* Housing Type Filter */}
          <div className="flex items-center">
            <Filter className="w-4 h-4 mr-2 text-primary-400" />
            <select
              className="input w-48"
              value={housingFilter}
              onChange={(e) => setHousingFilter(e.target.value)}
            >
              <option value="all">All Housing Types</option>
              <option value="studio">Studio</option>
              <option value="one_bedroom">1 Bedroom</option>
              <option value="two_bedroom">2 Bedrooms</option>
              <option value="three_bedroom">3 Bedrooms</option>
              <option value="villa_house">Villa / House</option>
            </select>
          </div>
        </div>

        {/* Grid/Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flattenedRows.map((row, idx) => (
            <div key={idx} className="bg-white dark:bg-primary-900 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm p-5 hover:border-accent-gold transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary-500">{row.city}</span>
                  <h3 className="text-lg font-bold text-primary-900 dark:text-white">{row.neighborhood}</h3>
                </div>
                <span className={clsx(
                  "px-2 py-1 rounded text-xs font-medium capitalize",
                  row.data_confidence === 'high' ? "bg-semantic-success/10 text-semantic-success" :
                    row.data_confidence === 'medium' ? "bg-semantic-warning/10 text-semantic-warning" :
                      "bg-semantic-error/10 text-semantic-error"
                )}>
                  {row.data_confidence} Conf.
                </span>
              </div>

              <div className="flex items-center space-x-2 text-sm text-primary-600 dark:text-primary-300 mb-4 bg-primary-50 dark:bg-primary-800 p-2 rounded">
                <span className="capitalize font-medium">{row.housingType.replace('_', ' ')}</span>
                <span>•</span>
                <span>{row.year}</span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-primary-500">Median Rent</span>
                  <span className="font-mono text-lg font-bold text-accent-gold-dark dark:text-accent-gold">
                    {formatCurrency(row.median_monthly_rent_xaf)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-primary-500">Range (P25 - P75)</span>
                  <span className="font-mono text-primary-700 dark:text-primary-300">
                    {formatCurrency(row.p25_monthly_rent_xaf).replace('FCFA', '')} - {formatCurrency(row.p75_monthly_rent_xaf)}
                  </span>
                </div>
                {row.median_rent_per_sqm && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-primary-500">Price / m²</span>
                    <span className="font-mono text-primary-700 dark:text-primary-300">
                      {formatCurrency(row.median_rent_per_sqm).replace('FCFA', '')}/m²
                    </span>
                  </div>
                )}
                <div className="pt-3 border-t border-primary-100 dark:border-primary-800 flex justify-between items-center">
                  <div className="flex items-center text-xs text-primary-400">
                    <Info className="w-3 h-3 mr-1" />
                    {row.listing_count} listings
                  </div>
                  <div className="text-xs">
                    Volatility: <span className={row.rent_volatility_score > 0.5 ? "text-semantic-warning" : "text-semantic-success"}>
                      {row.rent_volatility_score.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {flattenedRows.length === 0 && (
            <div className="col-span-full py-12 text-center text-primary-500">
              No rental data found. Try adjusting filters (e.g., select 'Unknown' type if specific types are missing).
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default RentPriceIntelligence;
