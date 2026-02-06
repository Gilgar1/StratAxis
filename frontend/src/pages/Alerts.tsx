import React from 'react';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import { Bell, Settings, Mail } from 'lucide-react';

const Alerts: React.FC = () => {
  return (
    <AuthenticatedLayout>
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-primary-900 dark:text-white mb-2">Alerts & Notifications</h1>
        <p className="text-primary-600 dark:text-primary-400 mb-8">Manage how and when you want to be notified of market changes.</p>

        <div className="space-y-6">
          {/* Price Alert */}
          <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm flex items-start justify-between">
            <div>
              <h3 className="font-bold text-primary-900 dark:text-white mb-1">Significant Price Shifts</h3>
              <p className="text-sm text-primary-500 max-w-md">Notify me when any neighborhood in my watchlist changes average price by more than 5% in a single quarter.</p>
            </div>
            <div className="flex items-center space-x-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-primary-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent-gold rounded-full peer dark:bg-primary-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-semantic-success"></div>
              </label>
            </div>
          </div>

          {/* New Listings */}
          <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm flex items-start justify-between">
            <div>
              <h3 className="font-bold text-primary-900 dark:text-white mb-1">New Listings Summary</h3>
              <p className="text-sm text-primary-500 max-w-md">Weekly digest of new verified listings in Double and Yaoundé.</p>
            </div>
            <div className="flex items-center space-x-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-primary-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent-gold rounded-full peer dark:bg-primary-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-semantic-success"></div>
              </label>
            </div>
          </div>

          {/* System Updates */}
          <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm flex items-start justify-between">
            <div>
              <h3 className="font-bold text-primary-900 dark:text-white mb-1">System & Methodology Updates</h3>
              <p className="text-sm text-primary-500 max-w-md">Notifications about changes to our confidence scoring or data pipeline improvements.</p>
            </div>
            <div className="flex items-center space-x-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-primary-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent-gold rounded-full peer dark:bg-primary-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-semantic-success"></div>
              </label>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-primary-200 dark:border-primary-800">
            <h3 className="font-bold text-lg text-primary-900 dark:text-white mb-4">Delivery Channels</h3>
            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="checkbox" defaultChecked />
                <span>In-App Notifications</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="checkbox" defaultChecked />
                <span>Email Digest</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Alerts;
