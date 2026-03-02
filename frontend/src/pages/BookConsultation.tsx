import React, { useState } from 'react';
import PublicLayout from '../layouts/PublicLayout';
import { motion } from 'framer-motion';
import { Calendar, MessageSquare, CheckCircle, ArrowRight, Clock } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const BookConsultation: React.FC = () => {
  const { addAppointment } = useApp();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    organization: '', interest: 'Investment Strategy Review', message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1200));

    addAppointment({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      organization: form.organization,
      interest: form.interest,
      message: form.message,
    });

    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <PublicLayout>
        <div className="min-h-[60vh] flex items-center justify-center bg-primary-50 dark:bg-primary-950 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md bg-white dark:bg-primary-900 p-10 rounded-2xl shadow-xl border border-primary-200 dark:border-primary-800"
          >
            <div className="w-16 h-16 bg-semantic-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-semantic-success" />
            </div>
            <h2 className="text-2xl font-bold text-primary-900 dark:text-white mb-3">Request Received!</h2>
            <p className="text-primary-600 dark:text-primary-400 mb-4 leading-relaxed">
              Thank you, <strong>{form.firstName}</strong>. Our strategy team will review your request and contact you at <strong>{form.email}</strong> within 24 hours to confirm your consultation.
            </p>
            <div className="flex items-center gap-2 justify-center bg-accent-gold/10 border border-accent-gold/30 rounded-xl p-4 mb-6">
              <Clock className="w-5 h-5 text-accent-gold flex-shrink-0" />
              <p className="text-sm text-primary-700 dark:text-primary-300 font-medium">
                Expected response: within 24 hours
              </p>
            </div>
            <a href="/" className="btn btn-primary w-full">Return Home</a>
          </motion.div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="bg-primary-50 dark:bg-primary-950 py-12 px-4">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-stretch">
            {/* Left Side */}
            <div className="flex flex-col justify-center">
              <h1 className="text-4xl md:text-5xl font-bold text-primary-900 dark:text-white mb-6">
                Expert Guidance for Complex Decisions
              </h1>
              <p className="text-lg text-primary-600 dark:text-primary-400 mb-8 leading-relaxed">
                Sometimes data alone isn't enough. Our analysts provide bespoke context, regulatory insight, and deeper due diligence for institutional investors and developers.
              </p>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="p-3 bg-accent-gold/10 rounded-lg mr-4">
                    <Calendar className="w-6 h-6 text-accent-gold" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-primary-900 dark:text-white">Strategy Session</h3>
                    <p className="text-primary-500">30-minute introductory call to define your investment thesis.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="p-3 bg-accent-gold/10 rounded-lg mr-4">
                    <MessageSquare className="w-6 h-6 text-accent-gold" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-primary-900 dark:text-white">Custom Feasibility</h3>
                    <p className="text-primary-500">We can run custom scraping and yield models for specific zones.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Form */}
            <div className="bg-white dark:bg-primary-900 p-8 rounded-2xl shadow-xl border border-primary-200 dark:border-primary-800">
              <h2 className="text-2xl font-bold text-primary-900 dark:text-white mb-6">Book Your Consultation</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">First Name</label>
                    <input name="firstName" type="text" className="input" placeholder="Jane" value={form.firstName} onChange={handleChange} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">Last Name</label>
                    <input name="lastName" type="text" className="input" placeholder="Doe" value={form.lastName} onChange={handleChange} required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">Business Email</label>
                  <input name="email" type="email" className="input" placeholder="jane@company.com" value={form.email} onChange={handleChange} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">Organization</label>
                  <input name="organization" type="text" className="input" placeholder="Company Name (Optional)" value={form.organization} onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">I'm interested in...</label>
                  <select name="interest" className="input" value={form.interest} onChange={handleChange}>
                    <option>Investment Strategy Review</option>
                    <option>Custom Data Access (API)</option>
                    <option>Development Feasibility Study</option>
                    <option>Other Partnership</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">Message</label>
                  <textarea name="message" className="input h-32 resize-none" placeholder="Tell us a bit about your project goals..." value={form.message} onChange={handleChange} required />
                </div>
                <button type="submit" disabled={loading} className="btn btn-gold w-full flex justify-center items-center py-3">
                  {loading ? 'Submitting...' : (<>Request Consultation <ArrowRight className="w-4 h-4 ml-2" /></>)}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default BookConsultation;
