import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const message = location.state?.message;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.email || !formData.password) {
        throw new Error("Please enter both email and password");
      }

      await login(formData);
      navigate('/dashboard');
    } catch (err: any) {
      if (err.message) {
        // If mock login works, great, if not we show error
        // For demo purposes, if login fails we'll simulate a mock login to allow testing
        // In production this Catch block would only show error
        if (formData.email === "demo@strataxis.cm" && formData.password === "demo123") {
          // Mock manual login if API fails locally without backend
          localStorage.setItem('strataxis_token', 'mock_token');
          localStorage.setItem('strataxis_user', JSON.stringify({ id: '1', email: 'demo@strataxis.cm', role: 'PAID_USER' }));
          window.location.href = '/dashboard';
          return;
        }
        setError(err.message || "Invalid credentials");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 bg-primary-50 dark:bg-primary-950">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-primary-900 rounded-2xl shadow-xl overflow-hidden border border-primary-200 dark:border-primary-800"
          >
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-primary-900 dark:text-white mb-2">Welcome Back</h2>
                <p className="text-primary-500 text-sm">Secure access to market intelligence</p>
              </div>

              {message && (
                <div className="mb-6 p-4 bg-semantic-success/10 border border-semantic-success/20 rounded-lg text-semantic-success text-center text-sm font-medium">
                  {message}
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-semantic-error/10 border border-semantic-error/20 rounded-lg flex items-start text-semantic-error text-sm">
                  <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="input pl-10"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-primary-700 dark:text-primary-300">Password</label>
                    <Link to="/forgot-password" className="text-xs text-accent-gold hover:underline">Forgot?</Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
                    <input
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="input pl-10"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full py-3 mt-4"
                >
                  {loading ? 'Authenticating...' : 'Sign In'}
                </button>
              </form>

              <div className="mt-8 text-center text-sm text-primary-500">
                New to StratAxis?{' '}
                <Link to="/register" className="text-accent-gold hover:underline font-medium">
                  Create an account
                </Link>
              </div>

              <div className="mt-8 pt-6 border-t border-primary-100 dark:border-primary-800 text-xs text-center text-primary-400">
                <p>Demo Login: demo@strataxis.cm / demo123</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Login;
