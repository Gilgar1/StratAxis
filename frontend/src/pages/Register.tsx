import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, CheckCircle2, User, Building, AlertCircle } from 'lucide-react';
import { isValidEmail, isValidPassword } from '../utils/validators';
import Loading from '../components/common/Loading';

const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    userType: 'individual' as 'individual' | 'institution',
    intendedUse: 'investment' as 'research' | 'investment' | 'policy'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const setType = (type: 'individual' | 'institution') => {
    setFormData({ ...formData, userType: type });
  };

  const validateStep1 = () => {
    if (!formData.firstName || !formData.lastName) return "Name fields are required";
    if (!isValidEmail(formData.email)) return "Please enter a valid email address";
    const passCheck = isValidPassword(formData.password);
    if (!passCheck.valid) return passCheck.errors[0];
    if (formData.password !== formData.confirmPassword) return "Passwords do not match";
    return null;
  };

  const handleNext = () => {
    const err = validateStep1();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Since backend isn't fully connected yet, we'll simulate a success or call the mock
      // In a real scenario: await register(formData);
      // For now, let's pretend we registered and redirect to login or dashboard

      // Simulating loading delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Register logic from AuthContext would go here
      // For MVP Demo purposes, we can redirect to Login
      navigate('/login', { state: { message: "Account created successfully! Please login." } });
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 bg-primary-50 dark:bg-primary-950">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-primary-900 rounded-2xl shadow-xl overflow-hidden border border-primary-200 dark:border-primary-800"
          >
            {/* Header */}
            <div className="bg-primary-950 px-8 py-6 text-center">
              <h2 className="text-2xl font-bold text-white">Create Account</h2>
              <p className="text-primary-400 text-sm mt-2">
                Step {step} of 2: {step === 1 ? 'Credentials' : 'User Profile'}
              </p>

              {/* Progress Bar */}
              <div className="w-full h-1 bg-primary-800 mt-6 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-accent-gold"
                  initial={{ width: "50%" }}
                  animate={{ width: step === 1 ? "50%" : "100%" }}
                />
              </div>
            </div>

            <div className="p-8">
              {error && (
                <div className="mb-6 p-4 bg-semantic-error/10 border border-semantic-error/20 rounded-lg flex items-start text-semantic-error text-sm">
                  <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {step === 1 ? (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-5"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">First Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
                          <input
                            name="firstName"
                            type="text"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="input pl-10"
                            placeholder="John"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">Last Name</label>
                        <input
                          name="lastName"
                          type="text"
                          value={formData.lastName}
                          onChange={handleChange}
                          className="input"
                          placeholder="Doe"
                        />
                      </div>
                    </div>

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
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">Password</label>
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
                      <p className="text-xs text-primary-500 mt-1">Min. 8 chars, 1 upgrade, 1 number</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
                        <input
                          name="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="input pl-10"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleNext}
                      className="btn btn-primary w-full py-3"
                    >
                      Next Step
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-3">I am a...</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setType('individual')}
                          className={`p-4 rounded-xl border-2 text-center transition-all ${formData.userType === 'individual' ? 'border-accent-gold bg-accent-gold/5' : 'border-primary-200 dark:border-primary-700 opacity-70'}`}
                        >
                          <User className={`w-8 h-8 mx-auto mb-2 ${formData.userType === 'individual' ? 'text-accent-gold' : 'text-primary-400'}`} />
                          <div className="font-medium text-sm">Individual<br />Investor</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setType('institution')}
                          className={`p-4 rounded-xl border-2 text-center transition-all ${formData.userType === 'institution' ? 'border-accent-gold bg-accent-gold/5' : 'border-primary-200 dark:border-primary-700 opacity-70'}`}
                        >
                          <Building className={`w-8 h-8 mx-auto mb-2 ${formData.userType === 'institution' ? 'text-accent-gold' : 'text-primary-400'}`} />
                          <div className="font-medium text-sm">Institution /<br />Developer</div>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">My primary goal is...</label>
                      <select
                        name="intendedUse"
                        value={formData.intendedUse}
                        onChange={handleChange}
                        className="input"
                      >
                        <option value="investment">Strategic Investment</option>
                        <option value="research">Market Research</option>
                        <option value="policy">Policy & Development</option>
                      </select>
                    </div>

                    <div className="flex space-x-3 mt-8">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="btn btn-outline flex-1"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-gold flex-1"
                      >
                        {loading ? 'Creating...' : 'Create Account'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </form>

              <div className="mt-6 text-center text-sm text-primary-500">
                Already have an account?{' '}
                <Link to="/login" className="text-accent-gold hover:underline font-medium">
                  Sign In
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Register;
