import React, { useState } from 'react';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import { Users, Server, Activity, Ban, Edit, Trash2, CheckCircle, AlertTriangle, Terminal, Save, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../utils/formatters';

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'system' | 'overrides'>('users');

  // --- MOCK DATA ---
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'FREE_USER', status: 'Active', lastLogin: '2 mins ago' },
    { id: 2, name: 'Sarah Smith', email: 'sarah@invest.com', role: 'PAID_USER', status: 'Active', lastLogin: '1 hour ago' },
    { id: 3, name: 'Dev Corp', email: 'admin@devcorp.cm', role: 'PAID_USER', status: 'Expiring', lastLogin: '3 days ago' },
    { id: 4, name: 'Demo User', email: 'demo@strataxis.cm', role: 'FREE_USER', status: 'Active', lastLogin: 'Now' },
  ]);

  const [scraperLogs, setScraperLogs] = useState([
    { id: 105, timestamp: '2026-02-06 04:30:15', level: 'INFO', message: 'Job started: Daily Land Price Scrape' },
    { id: 106, timestamp: '2026-02-06 04:32:10', level: 'INFO', message: 'Connected to Source A (immo-cm). Found 45 new listings.' },
    { id: 107, timestamp: '2026-02-06 04:35:45', level: 'WARN', message: 'Source B response slow (2500ms). Retrying...' },
    { id: 108, timestamp: '2026-02-06 04:36:00', level: 'INFO', message: 'Source B connected. Found 12 listings.' },
    { id: 109, timestamp: '2026-02-06 04:40:22', level: 'INFO', message: 'ETL Pipeline finished. 57 records processed. 0 errors.' },
    { id: 110, timestamp: '2026-02-06 04:40:23', level: 'SUCCESS', message: 'Job completed successfully.' },
  ]);

  const [dataOverrides, setDataOverrides] = useState([
    { id: 1, neighborhood: 'Bonapriso', city: 'Douala', price: 97632, source: 'Automated', flag: 'High Variance' },
    { id: 2, neighborhood: 'Bastos', city: 'Yaoundé', price: 124229, source: 'Automated', flag: 'None' },
    { id: 3, neighborhood: 'Logbessou', city: 'Douala', price: 15400, source: 'Manual Override (Jan 15)', flag: 'Manual' },
  ]);

  // --- ACTIONS ---
  const handleBanUser = (id: number) => {
    if (confirm('Are you sure you want to suspend this user?')) {
      setUsers(users.map(u => u.id === id ? { ...u, status: 'Suspended' } : u));
    }
  };

  const handleUpdatePrice = (id: number, newPrice: number) => {
    setDataOverrides(dataOverrides.map(d => d.id === id ? { ...d, price: newPrice, source: 'Manual Override (Now)', flag: 'Manual' } : d));
  };


  if (user?.role !== 'ADMIN') {
    return (
      <AuthenticatedLayout>
        <div className="p-8 text-center text-semantic-error">
          Access Denied. Admin privileges required.
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary-900 dark:text-white">Admin Command Center</h1>
          <div className="flex items-center space-x-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-semantic-success animate-pulse"></span>
            <span className="text-semantic-success font-bold">System Operational</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-6 border-b border-primary-200 dark:border-primary-800 mb-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-4 px-2 font-medium transition-colors border-b-2 flex items-center ${activeTab === 'users' ? 'border-accent-gold text-accent-gold' : 'border-transparent text-primary-500 hover:text-primary-700'}`}
          >
            <Users className="w-4 h-4 mr-2" />
            User Management
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`pb-4 px-2 font-medium transition-colors border-b-2 flex items-center ${activeTab === 'system' ? 'border-accent-gold text-accent-gold' : 'border-transparent text-primary-500 hover:text-primary-700'}`}
          >
            <Server className="w-4 h-4 mr-2" />
            System & Scraper
          </button>
          <button
            onClick={() => setActiveTab('overrides')}
            className={`pb-4 px-2 font-medium transition-colors border-b-2 flex items-center ${activeTab === 'overrides' ? 'border-accent-gold text-accent-gold' : 'border-transparent text-primary-500 hover:text-primary-700'}`}
          >
            <Edit className="w-4 h-4 mr-2" />
            Data Overrides
          </button>
        </div>

        {/* --- USER MANAGEMENT --- */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-primary-900 p-4 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
                <input type="text" placeholder="Search users by email..." className="input pl-10 w-64" />
              </div>
              <button className="btn btn-primary">Add New User</button>
            </div>

            <div className="bg-white dark:bg-primary-900 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-primary-50 dark:bg-primary-800">
                  <tr>
                    <th className="p-4 font-semibold text-primary-900 dark:text-white">User</th>
                    <th className="p-4 font-semibold text-primary-900 dark:text-white">Role</th>
                    <th className="p-4 font-semibold text-primary-900 dark:text-white">Status</th>
                    <th className="p-4 font-semibold text-primary-900 dark:text-white">Last Activity</th>
                    <th className="p-4 font-semibold text-primary-900 dark:text-white text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-100 dark:divide-primary-800">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-primary-50 dark:hover:bg-primary-800/50 transition-colors bg-white dark:bg-primary-900">
                      <td className="p-4">
                        <div className="font-bold text-primary-900 dark:text-white">{u.name}</div>
                        <div className="text-sm text-primary-500">{u.email}</div>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${u.role === 'PAID_USER' ? 'bg-accent-gold/10 text-accent-gold' : 'bg-primary-100 dark:bg-primary-700 text-primary-600 dark:text-primary-300'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`flex items-center text-sm ${u.status === 'Active' ? 'text-semantic-success' : u.status === 'Suspended' ? 'text-semantic-error' : 'text-semantic-warning'}`}>
                          {u.status === 'Active' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {u.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-primary-500">{u.lastLogin}</td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button className="p-1 text-primary-400 hover:text-accent-gold transition-colors"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleBanUser(u.id)} className="p-1 text-primary-400 hover:text-semantic-error transition-colors"><Ban className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- SYSTEM STATUS --- */}
        {activeTab === 'system' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scraper Control & Logs */}
            <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm flex flex-col h-[500px]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold flex items-center text-primary-900 dark:text-white">
                  <Terminal className="w-5 h-5 mr-2 text-primary-500" />
                  Scraper Logs (Daily Job)
                </h3>
                <div className="flex space-x-2">
                  <span className="text-xs px-2 py-1 bg-semantic-success/10 text-semantic-success rounded font-bold">RUNNING</span>
                  <button className="text-xs text-primary-500 hover:text-primary-900 underline">View Full History</button>
                </div>
              </div>

              <div className="bg-primary-950 rounded-lg p-4 flex-1 overflow-y-auto font-mono text-sm border border-primary-800 shadow-inner">
                {scraperLogs.map((log) => (
                  <div key={log.id} className="mb-2 last:mb-0">
                    <span className="text-primary-500 mr-2">[{log.timestamp.split(' ')[1]}]</span>
                    <span className={`font-bold mr-2 ${log.level === 'INFO' ? 'text-blue-400' :
                        log.level === 'WARN' ? 'text-yellow-400' :
                          log.level === 'SUCCESS' ? 'text-green-400' : 'text-red-400'
                      }`}>
                      {log.level}
                    </span>
                    <span className="text-primary-300">{log.message}</span>
                  </div>
                ))}
                <div className="animate-pulse text-accent-gold mt-2">_</div>
              </div>

              <div className="mt-4 flex space-x-4">
                <button className="btn btn-primary flex-1">Trigger Manual Scrape</button>
                <button className="btn btn-outline flex-1 text-semantic-error border-semantic-error hover:bg-semantic-error hover:text-white">Stop Job</button>
              </div>
            </div>

            {/* Health Metrics */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm">
                <h3 className="font-bold mb-4 flex items-center text-primary-900 dark:text-white">
                  <Activity className="w-5 h-5 mr-2 text-semantic-success" />
                  Infrastructure Health
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-primary-600 dark:text-primary-400">Database Connection</span>
                    <span className="flex items-center text-semantic-success text-sm font-bold"><CheckCircle className="w-3 h-3 mr-1" /> Stable</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-primary-600 dark:text-primary-400">Redis Cache Hit Rate</span>
                    <span className="text-primary-900 dark:text-white text-sm font-mono">94.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-primary-600 dark:text-primary-400">API Latency (p95)</span>
                    <span className="text-primary-900 dark:text-white text-sm font-mono">120ms</span>
                  </div>
                  <div className="w-full bg-primary-100 dark:bg-primary-800 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-semantic-success h-full w-[90%]"></div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm">
                <h3 className="font-bold mb-4 flex items-center text-primary-900 dark:text-white">
                  <AlertTriangle className="w-5 h-5 mr-2 text-semantic-warning" />
                  Recent Alerts
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-semantic-warning/5 border border-semantic-warning/20 rounded-lg flex items-start">
                    <AlertTriangle className="w-4 h-4 text-semantic-warning mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-primary-900 dark:text-white">High Scraping Failure Rate</h4>
                      <p className="text-xs text-primary-500">Source 'immo-yde' reported 15 connection timeouts in last 24h.</p>
                    </div>
                  </div>
                  <div className="p-3 bg-semantic-info/5 border border-semantic-info/20 rounded-lg flex items-start">
                    <Server className="w-4 h-4 text-semantic-info mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-primary-900 dark:text-white">Database Backup Created</h4>
                      <p className="text-xs text-primary-500">Manual snapshot 'bk_20260206' created successfully.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- DATA OVERRIDES --- */}
        {activeTab === 'overrides' && (
          <div className="space-y-6">
            <div className="bg-semantic-warning/10 p-4 rounded-xl border border-semantic-warning/20 text-semantic-warning flex items-start">
              <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
              <p className="text-sm">
                <strong>Warning:</strong> Manual overrides bypass the automated scraping and cleaning pipeline. Changes made here persist until the next full re-indexing of the specific neighborhood, which may be up to 30 days.
              </p>
            </div>

            <div className="bg-white dark:bg-primary-900 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-primary-50 dark:bg-primary-800">
                  <tr>
                    <th className="p-4 font-semibold text-primary-900 dark:text-white">Neighborhood</th>
                    <th className="p-4 font-semibold text-primary-900 dark:text-white">Current Price/m²</th>
                    <th className="p-4 font-semibold text-primary-900 dark:text-white">Source</th>
                    <th className="p-4 font-semibold text-primary-900 dark:text-white">Status</th>
                    <th className="p-4 font-semibold text-primary-900 dark:text-white text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-100 dark:divide-primary-800">
                  {dataOverrides.map(item => (
                    <tr key={item.id} className="bg-white dark:bg-primary-900 hover:bg-primary-50 dark:hover:bg-primary-800/50">
                      <td className="p-4">
                        <div className="font-bold text-primary-900 dark:text-white">{item.neighborhood}</div>
                        <div className="text-sm text-primary-500">{item.city}</div>
                      </td>
                      <td className="p-4 font-mono font-bold text-accent-gold-dark dark:text-accent-gold">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="p-4 text-sm text-primary-600 dark:text-primary-400">{item.source}</td>
                      <td className="p-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${item.flag === 'Manual' ? 'bg-primary-200 dark:bg-primary-700 text-primary-800 dark:text-primary-200' : 'bg-semantic-warning/10 text-semantic-warning'}`}>
                          {item.flag}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => {
                            const val = prompt('Enter new price (XAF):', item.price.toString());
                            if (val) handleUpdatePrice(item.id, parseInt(val));
                          }}
                          className="btn btn-sm btn-outline flex items-center ml-auto"
                        >
                          <Edit className="w-3 h-3 mr-1" /> Override
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </AuthenticatedLayout>
  );
};

export default AdminPanel;
