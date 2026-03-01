import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import { Activity, Users, Search, AlertTriangle, CheckCircle, Server, Edit, Ban, Terminal, CreditCard, FileText, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../utils/formatters';
import { api } from '../services/api';

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'payments' | 'system' | 'overrides' | 'blogs'>('users');

  // --- STATES ---
  const [users, setUsers] = useState<any[]>([]);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);

  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [loadingBlogs, setLoadingBlogs] = useState(false);

  // Blog form
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [blogForm, setBlogForm] = useState({ title: '', slug: '', content: '', cover_image: '', is_published: false });

  // Constants mock data for system & overrides
  const [scraperLogs] = useState([{ id: 110, timestamp: '2026-02-06 04:40:23', level: 'SUCCESS', message: 'Job completed successfully.' }]);
  const [dataOverrides] = useState([{ id: 1, neighborhood: 'Bonapriso', city: 'Douala', price: 97632, source: 'Automated', flag: 'High Variance' }]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      if (activeTab === 'users') fetchUsers();
      if (activeTab === 'payments') fetchPayments();
      if (activeTab === 'blogs') fetchBlogs();
    }
  }, [activeTab, user?.role]);

  // --- FETCHERS ---
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const data: any = await api.get('/admin/users');
      setUsers(data.items || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchPayments = async () => {
    setLoadingPayments(true);
    try {
      const data: any = await api.get('/payments/pending');
      setPendingPayments(data.payments || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingPayments(false);
    }
  };

  const fetchBlogs = async () => {
    setLoadingBlogs(true);
    try {
      const data: any = await api.get('/blogs');
      setBlogs(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingBlogs(false);
    }
  };

  // --- ACTIONS ---
  const handleBanUser = async (id: string, currentlyActive: boolean) => {
    if (confirm(`Are you sure you want to ${currentlyActive ? 'suspend' : 'reactivate'} this user?`)) {
      try {
        // If suspending, we hit DELETE /admin/users/{id}
        if (currentlyActive) {
          await api.delete(`/admin/users/${id}`);
        }
        fetchUsers();
      } catch (error) {
        alert('Error updating user status.');
      }
    }
  };

  const handleApprovePayment = async (paymentId: string) => {
    if (confirm('Approve this payment and upgrade user to PAID_USER?')) {
      try {
        await api.post('/payments/approve', { payment_id: paymentId });
        setPendingPayments(pendingPayments.filter(p => p.id !== paymentId));
        alert('Payment approved!');
      } catch (err: any) {
        alert('Error approving payment: ' + (err.response?.data?.detail || err.message));
      }
    }
  };

  const handleRejectPayment = async (paymentId: string) => {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      try {
        await api.post('/payments/reject', { payment_id: paymentId, reason });
        setPendingPayments(pendingPayments.filter(p => p.id !== paymentId));
        alert('Payment rejected.');
      } catch (err: any) {
        alert('Error rejecting payment: ' + (err.response?.data?.detail || err.message));
      }
    }
  };

  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/blogs', blogForm);
      alert('Blog created successfully');
      setShowBlogForm(false);
      setBlogForm({ title: '', slug: '', content: '', cover_image: '', is_published: false });
      fetchBlogs();
    } catch (err: any) {
      alert('Error creating blog: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleToggleBlogPublish = async (blogId: string, is_published: boolean) => {
    try {
      await api.put(`/blogs/${blogId}`, { is_published: !is_published });
      fetchBlogs();
    } catch (error) {
      alert('Failed to update blog publish status');
    }
  };

  const handleDeleteBlog = async (blogId: string) => {
    if (confirm('Are you sure you want to delete this blog post?')) {
      try {
        await api.delete(`/blogs/${blogId}`);
        fetchBlogs();
      } catch (error) {
        alert('Failed to delete blog');
      }
    }
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
        <div className="flex space-x-6 border-b border-primary-200 dark:border-primary-800 mb-8 overflow-x-auto whitespace-nowrap">
          <button onClick={() => setActiveTab('users')} className={`pb-4 px-2 font-medium transition-colors border-b-2 flex items-center ${activeTab === 'users' ? 'border-accent-gold text-accent-gold' : 'border-transparent text-primary-500'}`}>
            <Users className="w-4 h-4 mr-2" /> User Management
          </button>
          <button onClick={() => setActiveTab('payments')} className={`pb-4 px-2 font-medium transition-colors border-b-2 flex items-center relative ${activeTab === 'payments' ? 'border-accent-gold text-accent-gold' : 'border-transparent text-primary-500'}`}>
            <CreditCard className="w-4 h-4 mr-2" /> Payment Verification
            {pendingPayments.length > 0 && (
              <span className="ml-2 bg-semantic-error text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendingPayments.length}</span>
            )}
          </button>
          <button onClick={() => setActiveTab('blogs')} className={`pb-4 px-2 font-medium transition-colors border-b-2 flex items-center ${activeTab === 'blogs' ? 'border-accent-gold text-accent-gold' : 'border-transparent text-primary-500'}`}>
            <FileText className="w-4 h-4 mr-2" /> Blog Management
          </button>
          <button onClick={() => setActiveTab('system')} className={`pb-4 px-2 font-medium transition-colors border-b-2 flex items-center ${activeTab === 'system' ? 'border-accent-gold text-accent-gold' : 'border-transparent text-primary-500'}`}>
            <Server className="w-4 h-4 mr-2" /> System & Scraper
          </button>
        </div>

        {/* --- USER MANAGEMENT --- */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-primary-900 rounded-xl shadow-sm overflow-hidden border border-primary-200 dark:border-primary-800">
              <table className="w-full text-left">
                <thead className="bg-primary-50 dark:bg-primary-800">
                  <tr>
                    <th className="p-4 font-semibold text-primary-900 dark:text-white">User</th>
                    <th className="p-4 font-semibold text-primary-900 dark:text-white">Role</th>
                    <th className="p-4 font-semibold text-primary-900 dark:text-white">Status</th>
                    <th className="p-4 text-right font-semibold text-primary-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-100 dark:divide-primary-800">
                  {loadingUsers ? <tr><td colSpan={4} className="p-4 text-center">Loading...</td></tr> : users.map(u => (
                    <tr key={u.id}>
                      <td className="p-4">
                        <div className="font-bold">{u.first_name || 'User'} {u.last_name || ''}</div>
                        <div className="text-sm text-primary-500">{u.email}</div>
                      </td>
                      <td className="p-4 text-xs font-bold">{u.role}</td>
                      <td className="p-4">
                        <span className={`flex items-center text-sm ${u.is_active ? 'text-semantic-success' : 'text-semantic-error'}`}>
                          {u.is_active ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleBanUser(u.id, u.is_active)} className="p-1 text-primary-400 hover:text-semantic-error">
                          <Ban className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- PAYMENT VERIFICATION --- */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            {loadingPayments ? <div>Loading...</div> : pendingPayments.length === 0 ? (
              <div className="bg-white text-center p-12 rounded-xl dark:bg-primary-900">All Caught Up!</div>
            ) : (
              <div className="bg-white dark:bg-primary-900 rounded-xl shadow-sm overflow-hidden border border-primary-200 dark:border-primary-800">
                <table className="w-full text-left">
                  <thead className="bg-primary-50 dark:bg-primary-800">
                    <tr>
                      <th className="p-4 font-semibold">User ID</th>
                      <th className="p-4 font-semibold">Plan</th>
                      <th className="p-4 font-semibold">Amount</th>
                      <th className="p-4 font-semibold">Payment ID</th>
                      <th className="p-4 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary-100 dark:divide-primary-800">
                    {pendingPayments.map(p => (
                      <tr key={p.id}>
                        <td className="p-4 text-sm font-mono truncate max-w-[150px]">{p.user_id}</td>
                        <td className="p-4 text-sm">{p.plan} ({p.billing_period})</td>
                        <td className="p-4 font-bold text-accent-gold">{formatCurrency(p.amount)}</td>
                        <td className="p-4 font-mono">****{p.payment_id_last_four}</td>
                        <td className="p-4 text-right space-x-2">
                          <button onClick={() => handleApprovePayment(p.id)} className="px-3 py-1 bg-semantic-success text-white rounded">Approve</button>
                          <button onClick={() => handleRejectPayment(p.id)} className="px-3 py-1 bg-semantic-error text-white rounded">Reject</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* --- BLOG MANAGEMENT --- */}
        {activeTab === 'blogs' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-primary-900 p-4 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm">
              <h2 className="text-xl font-bold">Strategy Posts</h2>
              <button onClick={() => setShowBlogForm(!showBlogForm)} className="btn btn-primary flex items-center">
                <Plus className="w-4 h-4 mr-2" /> Write Post
              </button>
            </div>

            {showBlogForm && (
              <form onSubmit={handleBlogSubmit} className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Title</label>
                  <input required type="text" className="input w-full" value={blogForm.title} onChange={e => setBlogForm({ ...blogForm, title: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Slug (URL)</label>
                  <input required type="text" className="input w-full" value={blogForm.slug} onChange={e => setBlogForm({ ...blogForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} placeholder="awesome-post-title" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Cover Image URL</label>
                  <input type="url" className="input w-full" value={blogForm.cover_image} onChange={e => setBlogForm({ ...blogForm, cover_image: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Content (Markdown supported)</label>
                  <textarea required className="input w-full h-40" value={blogForm.content} onChange={e => setBlogForm({ ...blogForm, content: e.target.value })}></textarea>
                </div>
                <div className="flex items-center mt-2">
                  <input type="checkbox" id="publish" className="mr-2" checked={blogForm.is_published} onChange={e => setBlogForm({ ...blogForm, is_published: e.target.checked })} />
                  <label htmlFor="publish">Publish immediately</label>
                </div>
                <button type="submit" className="btn btn-primary w-full">Save Post</button>
              </form>
            )}

            <div className="bg-white dark:bg-primary-900 rounded-xl shadow-sm overflow-hidden border border-primary-200 dark:border-primary-800">
              <table className="w-full text-left">
                <thead className="bg-primary-50 dark:bg-primary-800">
                  <tr>
                    <th className="p-4 font-semibold">Title</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">Created</th>
                    <th className="p-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-100 dark:divide-primary-800">
                  {loadingBlogs ? <tr><td colSpan={4} className="p-4 text-center">Loading...</td></tr> : blogs.map(b => (
                    <tr key={b.id}>
                      <td className="p-4 font-bold">{b.title} <br /><span className="text-xs text-primary-500">{b.slug}</span></td>
                      <td className="p-4">
                        <button onClick={() => handleToggleBlogPublish(b.id, b.is_published)} className={`px-2 py-1 text-xs rounded font-bold ${b.is_published ? 'bg-semantic-success/20 text-semantic-success' : 'bg-primary-200 dark:bg-primary-700'}`}>
                          {b.is_published ? 'Published' : 'Draft'}
                        </button>
                      </td>
                      <td className="p-4 text-sm">{new Date(b.created_at).toLocaleDateString()}</td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => handleDeleteBlog(b.id)} className="p-1 text-primary-400 hover:text-semantic-error"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="p-8 text-center bg-white dark:bg-primary-900 rounded-xl">
            <Terminal className="w-8 h-8 mx-auto mb-2 text-primary-400" />
            <p>Basic System Stats & Scraping active in background.</p>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
};

export default AdminPanel;
