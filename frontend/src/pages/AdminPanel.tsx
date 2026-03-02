import React, { useState } from 'react';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import {
  Activity, Users, Search, AlertTriangle, CheckCircle, Server,
  Edit, Ban, Terminal, CreditCard, BarChart3, Calendar, Clock,
  FileText, Plus, Trash2, Eye, EyeOff, X, Save
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { formatCurrency } from '../utils/formatters';
import MetricsEditor from '../components/admin/MetricsEditor';

type Tab = 'users' | 'payments' | 'appointments' | 'blog' | 'system' | 'overrides' | 'metrics';

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const {
    appointments, updateAppointmentStatus, scheduleAppointment,
    pendingPayments, approvePayment, rejectPayment,
    blogPosts, addBlogPost, updateBlogPost, deleteBlogPost,
  } = useApp();

  const [activeTab, setActiveTab] = useState<Tab>('users');

  // --- MOCK DATA (kept for legacy tabs) ---
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'FREE_USER', status: 'Active', lastLogin: '2 mins ago' },
    { id: 2, name: 'Sarah Smith', email: 'sarah@invest.com', role: 'PAID_USER', status: 'Active', lastLogin: '1 hour ago' },
    { id: 3, name: 'Dev Corp', email: 'admin@devcorp.cm', role: 'PAID_USER', status: 'Expiring', lastLogin: '3 days ago' },
    { id: 4, name: 'Demo User', email: 'demo@strataxis.cm', role: 'FREE_USER', status: 'Active', lastLogin: 'Now' },
  ]);

  const [scraperLogs] = useState([
    { id: 110, timestamp: '2026-02-06 04:40:23', level: 'SUCCESS', message: 'Job completed successfully.' },
  ]);

  const [dataOverrides, setDataOverrides] = useState([
    { id: 1, neighborhood: 'Bonapriso', city: 'Douala', price: 97632, source: 'Automated', flag: 'High Variance' },
    { id: 2, neighborhood: 'Bastos', city: 'Yaoundé', price: 124229, source: 'Automated', flag: 'None' },
    { id: 3, neighborhood: 'Logbessou', city: 'Douala', price: 15400, source: 'Manual Override (Jan 15)', flag: 'Manual' },
  ]);

  // Blog compose state
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState({
    title: '', excerpt: '', content: '', category: 'Market Report', author: 'StratAxis Analytics', readTime: '5 min read', published: true,
  });

  const handleBanUser = (id: number) => {
    if (confirm('Are you sure you want to suspend this user?')) {
      setUsers(users.map(u => u.id === id ? { ...u, status: 'Suspended' } : u));
    }
  };

  const handleUpdatePrice = (id: number, newPrice: number) => {
    setDataOverrides(dataOverrides.map(d => d.id === id ? { ...d, price: newPrice, source: 'Manual Override (Now)', flag: 'Manual' } : d));
  };

  const handlePublishPost = () => {
    if (!draft.title.trim() || !draft.content.trim()) { alert('Title and content are required.'); return; }
    addBlogPost(draft);
    setDraft({ title: '', excerpt: '', content: '', category: 'Market Report', author: 'StratAxis Analytics', readTime: '5 min read', published: true });
    setComposing(false);
  };

  // Counts for badges
  const pendingAppointments = appointments.filter(a => a.status === 'pending').length;
  const pendingPaymentCount = pendingPayments.filter(p => p.status === 'pending').length;

  if (user?.role !== 'ADMIN') {
    return (
      <AuthenticatedLayout>
        <div className="p-8 text-center text-semantic-error">Access Denied. Admin privileges required.</div>
      </AuthenticatedLayout>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType; badge?: number; badgeColor?: string; extra?: React.ReactNode }[] = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'payments', label: 'Payment Verification', icon: CreditCard, badge: pendingPaymentCount, badgeColor: 'bg-semantic-error' },
    { id: 'appointments', label: 'Appointments', icon: Calendar, badge: pendingAppointments, badgeColor: 'bg-blue-500' },
    { id: 'blog', label: 'Blog Management', icon: FileText },
    { id: 'system', label: 'System & Scraper', icon: Server },
    { id: 'overrides', label: 'Data Overrides', icon: Edit },
    { id: 'metrics', label: 'Metrics Editor', icon: BarChart3, extra: <span className="ml-1.5 bg-accent-gold/20 text-accent-gold text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide">Live</span> },
  ];

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

        {/* Tabs */}
        <div className="flex space-x-1 border-b border-primary-200 dark:border-primary-800 mb-8 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-3 font-medium transition-colors border-b-2 flex items-center whitespace-nowrap text-sm ${activeTab === tab.id
                  ? 'border-accent-gold text-accent-gold'
                  : 'border-transparent text-primary-500 hover:text-primary-700 dark:hover:text-primary-300'
                }`}>
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
              {tab.badge && tab.badge > 0 && (
                <span className={`ml-2 ${tab.badgeColor} text-white text-xs font-bold px-2 py-0.5 rounded-full`}>
                  {tab.badge}
                </span>
              )}
              {tab.extra}
            </button>
          ))}
        </div>

        {/* ═══════════════════ USER MANAGEMENT ═══════════════════ */}
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
                    <tr key={u.id} className="hover:bg-primary-50 dark:hover:bg-primary-800/50 transition-colors">
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
                          {u.status === 'Active' && <CheckCircle className="w-3 h-3 mr-1" />}{u.status}
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

        {/* ═══════════════════ PAYMENT VERIFICATION ═══════════════════ */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800 flex items-start">
              <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Payment Verification Queue</h3>
                <p className="text-sm text-blue-700 dark:text-blue-200">
                  Review and approve pending mobile money payments submitted by users. Approve to upgrade them to PRO INVESTOR.
                </p>
              </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white dark:bg-primary-900 p-4 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm">
                <p className="text-xs font-bold uppercase text-primary-400 mb-1">Pending</p>
                <p className="text-3xl font-bold text-amber-500">{pendingPayments.filter(p => p.status === 'pending').length}</p>
              </div>
              <div className="bg-white dark:bg-primary-900 p-4 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm">
                <p className="text-xs font-bold uppercase text-primary-400 mb-1">Approved</p>
                <p className="text-3xl font-bold text-emerald-500">{pendingPayments.filter(p => p.status === 'approved').length}</p>
              </div>
              <div className="bg-white dark:bg-primary-900 p-4 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm">
                <p className="text-xs font-bold uppercase text-primary-400 mb-1">Rejected</p>
                <p className="text-3xl font-bold text-red-500">{pendingPayments.filter(p => p.status === 'rejected').length}</p>
              </div>
            </div>

            {pendingPayments.length === 0 ? (
              <div className="bg-white dark:bg-primary-900 rounded-xl border border-primary-200 dark:border-primary-800 p-12 text-center">
                <CheckCircle className="w-16 h-16 text-semantic-success mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold text-primary-900 dark:text-white mb-2">No Payments Yet</h3>
                <p className="text-primary-500">Payment submissions from users will appear here.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-primary-900 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-primary-50 dark:bg-primary-800">
                    <tr>
                      <th className="p-4 font-semibold text-primary-900 dark:text-white">User</th>
                      <th className="p-4 font-semibold text-primary-900 dark:text-white">Plan</th>
                      <th className="p-4 font-semibold text-primary-900 dark:text-white">Amount</th>
                      <th className="p-4 font-semibold text-primary-900 dark:text-white">Payment ID</th>
                      <th className="p-4 font-semibold text-primary-900 dark:text-white">Submitted</th>
                      <th className="p-4 font-semibold text-primary-900 dark:text-white">Status</th>
                      <th className="p-4 font-semibold text-primary-900 dark:text-white text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary-100 dark:divide-primary-800">
                    {pendingPayments.map(payment => (
                      <tr key={payment.id} className="hover:bg-primary-50 dark:hover:bg-primary-800/50 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-primary-900 dark:text-white">{payment.userName}</div>
                          <div className="text-sm text-primary-500">{payment.userEmail}</div>
                        </td>
                        <td className="p-4">
                          <span className="font-semibold text-primary-900 dark:text-white">Pro Investor</span>
                          <div className="text-sm text-primary-500">{payment.period === 'monthly' ? 'Monthly' : 'Yearly'}</div>
                        </td>
                        <td className="p-4"><span className="font-bold text-accent-gold">{formatCurrency(payment.amount)}</span></td>
                        <td className="p-4">
                          <span className="font-mono text-sm bg-primary-100 dark:bg-primary-800 px-3 py-1 rounded text-primary-900 dark:text-white">
                            ****{payment.paymentIdLastFour}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-primary-500">{new Date(payment.createdAt).toLocaleString()}</td>
                        <td className="p-4">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${payment.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                              payment.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                                'bg-red-500/10 text-red-500'
                            }`}>
                            {payment.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {payment.status === 'pending' && (
                            <div className="flex justify-end space-x-2">
                              <button onClick={() => approvePayment(payment.id)}
                                className="px-3 py-1.5 bg-semantic-success text-white rounded-lg hover:bg-semantic-success/90 transition-colors font-semibold text-sm flex items-center">
                                <CheckCircle className="w-3.5 h-3.5 mr-1" />Approve
                              </button>
                              <button onClick={() => rejectPayment(payment.id)}
                                className="px-3 py-1.5 bg-semantic-error text-white rounded-lg hover:bg-semantic-error/90 transition-colors font-semibold text-sm">
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════ APPOINTMENTS ═══════════════════ */}
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            <div className="bg-accent-gold/10 p-4 rounded-xl border border-accent-gold/30 flex items-start">
              <Calendar className="w-5 h-5 text-accent-gold mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-primary-900 dark:text-white mb-1">Consultation Appointments</h3>
                <p className="text-sm text-primary-600 dark:text-primary-400">
                  View incoming consultation requests, set appointment times, and update statuses.
                </p>
              </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-4 gap-4">
              {(['pending', 'scheduled', 'completed', 'cancelled'] as const).map(status => {
                const count = appointments.filter(a => a.status === status).length;
                const colors = { pending: 'text-amber-500', scheduled: 'text-blue-500', completed: 'text-emerald-500', cancelled: 'text-primary-400' };
                return (
                  <div key={status} className="bg-white dark:bg-primary-900 p-4 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm">
                    <p className="text-xs font-bold uppercase text-primary-400 mb-1">{status}</p>
                    <p className={`text-3xl font-bold ${colors[status]}`}>{count}</p>
                  </div>
                );
              })}
            </div>

            {appointments.length === 0 ? (
              <div className="bg-white dark:bg-primary-900 rounded-xl border border-primary-200 dark:border-primary-800 p-12 text-center">
                <Calendar className="w-16 h-16 text-primary-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-primary-900 dark:text-white mb-2">No Appointments Yet</h3>
                <p className="text-primary-500">Consultation requests from the Book Consultation form will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map(apt => (
                  <div key={apt.id} className="bg-white dark:bg-primary-900 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-3 bg-primary-50 dark:bg-primary-800 border-b border-primary-200 dark:border-primary-700">
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${apt.status === 'pending' ? 'bg-amber-500/10 text-amber-600' :
                            apt.status === 'scheduled' ? 'bg-blue-500/10 text-blue-600' :
                              apt.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600' :
                                'bg-primary-200 text-primary-500'
                          }`}>
                          {apt.status}
                        </span>
                        <span className="text-xs text-primary-400">{new Date(apt.submittedAt).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {apt.status === 'pending' && (
                          <>
                            <button onClick={() => updateAppointmentStatus(apt.id, 'cancelled')}
                              className="px-3 py-1 text-xs font-semibold rounded-lg bg-primary-100 dark:bg-primary-700 text-primary-500 hover:text-red-500 transition-colors">
                              Cancel
                            </button>
                          </>
                        )}
                        {apt.status === 'scheduled' && (
                          <button onClick={() => updateAppointmentStatus(apt.id, 'completed')}
                            className="px-3 py-1 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors">
                            Mark Complete
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Client info */}
                      <div className="md:col-span-2 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-accent-gold/10 flex items-center justify-center text-accent-gold font-bold text-lg">
                            {apt.firstName[0]}{apt.lastName[0]}
                          </div>
                          <div>
                            <p className="font-bold text-primary-900 dark:text-white">{apt.firstName} {apt.lastName}</p>
                            <p className="text-sm text-primary-500">{apt.email}</p>
                          </div>
                        </div>
                        {apt.organization && (
                          <div className="text-sm"><span className="text-primary-400">Organization:</span> <span className="font-medium text-primary-900 dark:text-white">{apt.organization}</span></div>
                        )}
                        <div className="text-sm"><span className="text-primary-400">Interest:</span> <span className="font-medium text-primary-900 dark:text-white">{apt.interest}</span></div>
                        <div className="bg-primary-50 dark:bg-primary-800 rounded-lg p-4">
                          <p className="text-xs font-bold text-primary-400 uppercase mb-1">Message</p>
                          <p className="text-sm text-primary-700 dark:text-primary-300 leading-relaxed">{apt.message}</p>
                        </div>
                      </div>

                      {/* Schedule section */}
                      <div className="bg-primary-50 dark:bg-primary-800 rounded-xl p-5 flex flex-col items-center justify-center">
                        <Clock className="w-8 h-8 text-accent-gold mb-3" />
                        {apt.scheduledTime ? (
                          <>
                            <p className="text-xs font-bold text-primary-400 uppercase mb-1">Scheduled For</p>
                            <p className="text-lg font-bold text-primary-900 dark:text-white">{new Date(apt.scheduledTime).toLocaleString()}</p>
                          </>
                        ) : (
                          <>
                            <p className="text-xs font-bold text-primary-400 uppercase mb-2">Set Appointment Time</p>
                            <input
                              type="datetime-local"
                              className="input text-sm w-full mb-2"
                              id={`schedule-${apt.id}`}
                            />
                            <button
                              onClick={() => {
                                const input = document.getElementById(`schedule-${apt.id}`) as HTMLInputElement;
                                if (input?.value) {
                                  scheduleAppointment(apt.id, input.value);
                                } else {
                                  alert('Please select a date and time.');
                                }
                              }}
                              className="btn btn-gold w-full text-sm py-2 flex items-center justify-center gap-1"
                            >
                              <Calendar className="w-3.5 h-3.5" /> Schedule
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════ BLOG MANAGEMENT ═══════════════════ */}
        {activeTab === 'blog' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-primary-900 dark:text-white">Blog Management</h2>
                <p className="text-sm text-primary-500">{blogPosts.filter(p => p.published).length} published · {blogPosts.filter(p => !p.published).length} drafts</p>
              </div>
              <button onClick={() => setComposing(!composing)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${composing ? 'bg-primary-200 dark:bg-primary-700 text-primary-700 dark:text-primary-300' : 'bg-accent-gold text-primary-950 shadow-lg'
                  }`}>
                {composing ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> New Post</>}
              </button>
            </div>

            {/* Compose form */}
            {composing && (
              <div className="bg-white dark:bg-primary-900 rounded-xl border-2 border-accent-gold/30 shadow-lg p-6 space-y-4">
                <h3 className="font-bold text-primary-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-accent-gold" /> Write New Blog Post
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-primary-400 uppercase mb-1">Title</label>
                    <input type="text" className="input w-full" placeholder="Article title..."
                      value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-primary-400 uppercase mb-1">Category</label>
                      <select className="input w-full" value={draft.category} onChange={e => setDraft({ ...draft, category: e.target.value })}>
                        <option>Market Report</option>
                        <option>Investment</option>
                        <option>Market Analysis</option>
                        <option>Comparison</option>
                        <option>Guide</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-primary-400 uppercase mb-1">Read Time</label>
                      <input type="text" className="input w-full" placeholder="5 min read"
                        value={draft.readTime} onChange={e => setDraft({ ...draft, readTime: e.target.value })} />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary-400 uppercase mb-1">Excerpt (shown on blog card)</label>
                  <input type="text" className="input w-full" placeholder="Brief summary..."
                    value={draft.excerpt} onChange={e => setDraft({ ...draft, excerpt: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary-400 uppercase mb-1">Content (supports **bold**, ## headings, - bullets, {'>'} blockquotes)</label>
                  <textarea className="input w-full h-48 resize-y font-mono text-sm" placeholder="Write your article content here..."
                    value={draft.content} onChange={e => setDraft({ ...draft, content: e.target.value })} />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-primary-500">Author:</label>
                    <input type="text" className="input w-48 text-sm" value={draft.author}
                      onChange={e => setDraft({ ...draft, author: e.target.value })} />
                  </div>
                  <button onClick={handlePublishPost}
                    className="flex items-center gap-2 px-6 py-2.5 bg-accent-gold text-primary-950 font-bold rounded-lg hover:bg-accent-gold/90 transition-all shadow-lg">
                    <Save className="w-4 h-4" /> Publish Post
                  </button>
                </div>
              </div>
            )}

            {/* Posts list */}
            <div className="bg-white dark:bg-primary-900 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-primary-50 dark:bg-primary-800">
                  <tr>
                    <th className="p-4 font-semibold text-primary-900 dark:text-white">Title</th>
                    <th className="p-4 font-semibold text-primary-900 dark:text-white">Category</th>
                    <th className="p-4 font-semibold text-primary-900 dark:text-white">Date</th>
                    <th className="p-4 font-semibold text-primary-900 dark:text-white">Status</th>
                    <th className="p-4 font-semibold text-primary-900 dark:text-white text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-100 dark:divide-primary-800">
                  {blogPosts.map(post => (
                    <tr key={post.id} className="hover:bg-primary-50 dark:hover:bg-primary-800/50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-primary-900 dark:text-white line-clamp-1">{post.title}</div>
                        <div className="text-xs text-primary-400 line-clamp-1">{post.excerpt}</div>
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-bold px-2 py-1 rounded bg-primary-100 dark:bg-primary-700 text-primary-600 dark:text-primary-300">
                          {post.category}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-primary-500">{post.date}</td>
                      <td className="p-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${post.published ? 'bg-emerald-500/10 text-emerald-600' : 'bg-primary-200 text-primary-500'
                          }`}>
                          {post.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end items-center space-x-2">
                          <button onClick={() => updateBlogPost(post.id, { published: !post.published })}
                            className="p-1.5 text-primary-400 hover:text-accent-gold transition-colors" title={post.published ? 'Unpublish' : 'Publish'}>
                            {post.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button onClick={() => { if (confirm('Delete this post?')) deleteBlogPost(post.id); }}
                            className="p-1.5 text-primary-400 hover:text-semantic-error transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══════════════════ SYSTEM STATUS ═══════════════════ */}
        {activeTab === 'system' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm flex flex-col h-[500px]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold flex items-center text-primary-900 dark:text-white">
                  <Terminal className="w-5 h-5 mr-2 text-primary-500" />Scraper Logs
                </h3>
                <span className="text-xs px-2 py-1 bg-semantic-success/10 text-semantic-success rounded font-bold">RUNNING</span>
              </div>
              <div className="bg-primary-950 rounded-lg p-4 flex-1 overflow-y-auto font-mono text-sm border border-primary-800 shadow-inner">
                {scraperLogs.map(log => (
                  <div key={log.id} className="mb-2 last:mb-0">
                    <span className="text-primary-500 mr-2">[{log.timestamp.split(' ')[1]}]</span>
                    <span className={`font-bold mr-2 ${log.level === 'SUCCESS' ? 'text-green-400' : 'text-blue-400'}`}>{log.level}</span>
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
            <div className="space-y-6">
              <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm">
                <h3 className="font-bold mb-4 flex items-center text-primary-900 dark:text-white">
                  <Activity className="w-5 h-5 mr-2 text-semantic-success" />Infrastructure Health
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between"><span className="text-sm text-primary-600 dark:text-primary-400">Database</span><span className="flex items-center text-semantic-success text-sm font-bold"><CheckCircle className="w-3 h-3 mr-1" />Stable</span></div>
                  <div className="flex justify-between"><span className="text-sm text-primary-600 dark:text-primary-400">Cache Hit Rate</span><span className="text-sm font-mono text-primary-900 dark:text-white">94.2%</span></div>
                  <div className="flex justify-between"><span className="text-sm text-primary-600 dark:text-primary-400">API Latency (p95)</span><span className="text-sm font-mono text-primary-900 dark:text-white">120ms</span></div>
                  <div className="w-full bg-primary-100 dark:bg-primary-800 h-2 rounded-full mt-2 overflow-hidden"><div className="bg-semantic-success h-full w-[90%]"></div></div>
                </div>
              </div>
              <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm">
                <h3 className="font-bold mb-4 flex items-center text-primary-900 dark:text-white">
                  <AlertTriangle className="w-5 h-5 mr-2 text-semantic-warning" />Recent Alerts
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

        {/* ═══════════════════ DATA OVERRIDES ═══════════════════ */}
        {activeTab === 'overrides' && (
          <div className="space-y-6">
            <div className="bg-semantic-warning/10 p-4 rounded-xl border border-semantic-warning/20 text-semantic-warning flex items-start">
              <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
              <p className="text-sm"><strong>Warning:</strong> Manual overrides bypass the automated pipeline.</p>
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
                    <tr key={item.id} className="hover:bg-primary-50 dark:hover:bg-primary-800/50">
                      <td className="p-4">
                        <div className="font-bold text-primary-900 dark:text-white">{item.neighborhood}</div>
                        <div className="text-sm text-primary-500">{item.city}</div>
                      </td>
                      <td className="p-4 font-mono font-bold text-accent-gold">{formatCurrency(item.price)}</td>
                      <td className="p-4 text-sm text-primary-500">{item.source}</td>
                      <td className="p-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${item.flag === 'Manual' ? 'bg-primary-200 dark:bg-primary-700 text-primary-600 dark:text-primary-300' : 'bg-semantic-warning/10 text-semantic-warning'}`}>
                          {item.flag}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => {
                          const val = prompt('Enter new price (XAF):', item.price.toString());
                          if (val) handleUpdatePrice(item.id, parseInt(val));
                        }} className="btn btn-sm btn-outline flex items-center ml-auto">
                          <Edit className="w-3 h-3 mr-1" />Override
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══════════════════ METRICS EDITOR ═══════════════════ */}
        {activeTab === 'metrics' && <MetricsEditor />}

      </div>
    </AuthenticatedLayout>
  );
};

export default AdminPanel;
