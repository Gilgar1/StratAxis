import React, { useState } from 'react';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import { Star, Trash2, TrendingUp, MapPin } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { Link } from 'react-router-dom';

const Watchlists: React.FC = () => {
  // Mock watchlist data
  const [watchlist, setWatchlist] = useState([
    { id: 1, neighborhood: 'Bonapriso', city: 'Douala', currentPrice: 97632, change: '+12%', type: 'Land' },
    { id: 2, neighborhood: 'Bastos', city: 'Yaoundé', currentPrice: 124229, change: '+3.5%', type: 'Land' },
    { id: 3, neighborhood: 'Makepe', city: 'Douala', currentPrice: 52932, change: '+8.1%', type: 'Land' },
  ]);

  const removeFromWatchlist = (id: number) => {
    setWatchlist(watchlist.filter(item => item.id !== id));
  };

  return (
    <AuthenticatedLayout>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary-900 dark:text-white mb-2">My Watchlists</h1>
            <p className="text-primary-600 dark:text-primary-400">Track key neighborhoods and get notified of price changes.</p>
          </div>
          <Link to="/land-intelligence" className="btn btn-primary">Add New Item</Link>
        </div>

        <div className="bg-white dark:bg-primary-900 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm overflow-hidden">
          {watchlist.length > 0 ? (
            <table className="w-full text-left">
              <thead className="bg-primary-50 dark:bg-primary-800 border-b border-primary-200 dark:border-primary-700">
                <tr>
                  <th className="p-4 font-semibold text-primary-900 dark:text-white">Neighborhood</th>
                  <th className="p-4 font-semibold text-primary-900 dark:text-white">City</th>
                  <th className="p-4 font-semibold text-primary-900 dark:text-white">Type</th>
                  <th className="p-4 font-semibold text-primary-900 dark:text-white text-right">Current Price</th>
                  <th className="p-4 font-semibold text-primary-900 dark:text-white text-right">30d Change</th>
                  <th className="p-4 font-semibold text-primary-900 dark:text-white text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-100 dark:divide-primary-800">
                {watchlist.map((item) => (
                  <tr key={item.id} className="hover:bg-primary-50 dark:hover:bg-primary-800/50 transition-colors">
                    <td className="p-4 font-bold text-primary-900 dark:text-white flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-primary-400" />
                      {item.neighborhood}
                    </td>
                    <td className="p-4 text-primary-600 dark:text-primary-300">{item.city}</td>
                    <td className="p-4 text-primary-600 dark:text-primary-300">{item.type}</td>
                    <td className="p-4 text-right font-mono font-bold text-primary-900 dark:text-white">
                      {formatCurrency(item.currentPrice)}/m²
                    </td>
                    <td className="p-4 text-right">
                      <span className="inline-flex items-center text-semantic-success font-medium bg-semantic-success/10 px-2 py-1 rounded">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {item.change}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => removeFromWatchlist(item.id)}
                        className="p-2 text-primary-400 hover:text-semantic-error hover:bg-semantic-error/10 rounded-full transition-colors"
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
              <p className="text-primary-500 mb-6">Start exploring markets to track opportunities.</p>
              <Link to="/land-intelligence" className="btn btn-outline">Browse Neighborhoods</Link>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Watchlists;
