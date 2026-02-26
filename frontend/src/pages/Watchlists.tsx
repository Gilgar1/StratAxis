import React from 'react';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import { Star, Trash2, TrendingUp, MapPin, Download } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { Link } from 'react-router-dom';
import { useWatchlist } from '../hooks/useWatchlist';
import { exportToCSV } from '../utils/exportUtils';

const Watchlists: React.FC = () => {
  const { watchlist, removeFromWatchlist } = useWatchlist();

  const handleExportCSV = () => {
    const rows = watchlist.map(item => ({
      Neighborhood: item.neighborhood,
      City: item.city,
      Type: item.type,
      'Current Price': item.currentPrice,
      'Change': item.change,
      'Added At': new Date(item.addedAt).toLocaleDateString(),
    }));
    exportToCSV(rows, `StratAxis_Watchlist_${new Date().toISOString().slice(0, 10)}`);
  };

  return (
    <AuthenticatedLayout>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary-900 dark:text-white mb-2">My Watchlist</h1>
            <p className="text-primary-600 dark:text-primary-400">
              Track key neighborhoods and get notified of price changes.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {watchlist.length > 0 && (
              <button onClick={handleExportCSV} className="btn btn-outline flex items-center">
                <Download className="w-4 h-4 mr-2" /> Export CSV
              </button>
            )}
            <Link to="/land-intelligence" className="btn btn-primary">Add New Item</Link>
          </div>
        </div>

        <div className="bg-white dark:bg-primary-900 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm overflow-hidden">
          {watchlist.length > 0 ? (
            <table className="w-full text-left">
              <thead className="bg-primary-50 dark:bg-primary-800 border-b border-primary-200 dark:border-primary-700">
                <tr>
                  <th className="p-4 font-semibold text-primary-900 dark:text-white">Neighborhood</th>
                  <th className="p-4 font-semibold text-primary-900 dark:text-white">City</th>
                  <th className="p-4 font-semibold text-primary-900 dark:text-white">Type</th>
                  <th className="p-4 font-semibold text-primary-900 dark:text-white text-right">Price</th>
                  <th className="p-4 font-semibold text-primary-900 dark:text-white text-right">Change</th>
                  <th className="p-4 font-semibold text-primary-900 dark:text-white text-center">Added</th>
                  <th className="p-4 font-semibold text-primary-900 dark:text-white text-center">Remove</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-100 dark:divide-primary-800">
                {watchlist.map((item) => (
                  <tr key={item.id} className="hover:bg-primary-50 dark:hover:bg-primary-800/50 transition-colors">
                    <td className="p-4 font-bold text-primary-900 dark:text-white flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-primary-400 flex-shrink-0" />
                      {item.neighborhood}
                    </td>
                    <td className="p-4 text-primary-600 dark:text-primary-300">{item.city}</td>
                    <td className="p-4 text-primary-600 dark:text-primary-300">{item.type}</td>
                    <td className="p-4 text-right font-mono font-bold text-primary-900 dark:text-white">
                      {item.currentPrice > 0 ? `${formatCurrency(item.currentPrice)}/m²` : '—'}
                    </td>
                    <td className="p-4 text-right">
                      <span className="inline-flex items-center text-semantic-success font-medium bg-semantic-success/10 px-2 py-1 rounded">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {item.change}
                      </span>
                    </td>
                    <td className="p-4 text-center text-sm text-primary-500">
                      {new Date(item.addedAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => removeFromWatchlist(item.id)}
                        className="p-2 text-primary-400 hover:text-semantic-error hover:bg-semantic-error/10 rounded-full transition-colors"
                        title="Remove from watchlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-primary-400" />
              </div>
              <h3 className="text-lg font-bold text-primary-900 dark:text-white mb-2">Your watchlist is empty</h3>
              <p className="text-primary-500 mb-6">
                Star any neighborhood on the Land Price or Rental Intelligence pages to track it here.
              </p>
              <div className="flex justify-center gap-3">
                <Link to="/land-intelligence" className="btn btn-outline">Browse Land Prices</Link>
                <Link to="/rent-intelligence" className="btn btn-outline">Browse Rentals</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Watchlists;
