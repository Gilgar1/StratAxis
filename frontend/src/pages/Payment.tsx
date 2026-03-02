import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import { CreditCard, CheckCircle, AlertCircle, Clock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';

const Payment: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { submitPayment } = useApp();
    const [paymentId, setPaymentId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [countdown, setCountdown] = useState(60);

    const period = searchParams.get('period') as 'monthly' | 'yearly' | null;
    const amount = period === 'yearly' ? '150,000' : '15,000';
    const amountNum = period === 'yearly' ? 150000 : 15000;
    const billingText = period === 'yearly' ? 'per year' : 'per month';

    const handlePaymentComplete = async () => {
        if (paymentId.length !== 4 || !/^\d{4}$/.test(paymentId)) {
            alert('Please enter the last 4 digits of your payment ID');
            return;
        }
        setIsSubmitting(true);

        await new Promise(resolve => setTimeout(resolve, 1000));

        // Save to AppContext (frontend store → shows in admin payment verification)
        submitPayment({
            userId: user?.id || 'unknown',
            userEmail: user?.email || 'unknown',
            userName: `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.email || 'User',
            plan: 'PRO_INVESTOR',
            period: period || 'monthly',
            amount: amountNum,
            paymentIdLastFour: paymentId,
        });

        setIsSubmitting(false);
        setShowSuccess(true);

        // Countdown then redirect
        let t = 60;
        const interval = setInterval(() => {
            t -= 1;
            setCountdown(t);
            if (t <= 0) { clearInterval(interval); navigate('/dashboard'); }
        }, 1000);
    };

    if (showSuccess) {
        return (
            <AuthenticatedLayout>
                <div className="min-h-screen flex items-center justify-center p-4 bg-primary-50 dark:bg-primary-950">
                    <div className="max-w-lg w-full bg-white dark:bg-primary-900 p-10 rounded-2xl border border-primary-200 dark:border-primary-800 shadow-xl text-center">
                        {/* Success Icon */}
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-emerald-500" />
                        </div>
                        <h2 className="text-3xl font-bold text-primary-900 dark:text-white mb-3">Payment Submitted!</h2>
                        <p className="text-primary-600 dark:text-primary-300 mb-6 leading-relaxed">
                            Your payment reference <span className="font-mono font-bold text-primary-900 dark:text-white">****{paymentId}</span> has been received.
                        </p>

                        {/* Key message */}
                        <div className="bg-accent-gold/10 border border-accent-gold/30 rounded-xl p-5 mb-6">
                            <div className="flex items-center gap-3 mb-2">
                                <ShieldCheck className="w-6 h-6 text-accent-gold flex-shrink-0" />
                                <p className="font-bold text-primary-900 dark:text-white">Your payment will be validated in less than 60 minutes</p>
                            </div>
                            <p className="text-sm text-primary-600 dark:text-primary-400 text-left">
                                Our verification team reviews all Mobile Money payments within 60 minutes during business hours. Your Pro Investor access will be activated immediately upon approval.
                            </p>
                        </div>

                        {/* Countdown */}
                        <div className="flex items-center gap-2 justify-center bg-primary-50 dark:bg-primary-800 rounded-xl p-4 mb-6">
                            <Clock className="w-5 h-5 text-primary-400" />
                            <p className="text-sm text-primary-500">
                                Redirecting to dashboard in <span className="font-bold text-primary-900 dark:text-white">{countdown}s</span>
                            </p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-primary-500">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                Payment code submitted successfully
                            </div>
                            <div className="flex items-center gap-2 text-sm text-primary-500">
                                <div className="w-2 h-2 rounded-full bg-accent-gold animate-pulse"></div>
                                Awaiting admin verification ({"<"}60 min)
                            </div>
                            <div className="flex items-center gap-2 text-sm text-primary-400">
                                <div className="w-2 h-2 rounded-full bg-primary-300 dark:bg-primary-600"></div>
                                Pro Investor access activated
                            </div>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout>
            <div className="min-h-screen bg-primary-50 dark:bg-primary-950 py-12 px-4">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-primary-900 dark:text-white mb-2">Complete Your Payment</h1>
                        <p className="text-primary-600 dark:text-primary-300">
                            Upgrade to Pro Investor — {amount} FCFA {billingText}
                        </p>
                    </div>

                    {/* Payment Instructions */}
                    <div className="bg-white dark:bg-primary-900 p-8 rounded-2xl border border-primary-200 dark:border-primary-800 mb-6">
                        <div className="flex items-center mb-6">
                            <CreditCard className="w-6 h-6 text-accent-gold mr-3" />
                            <h2 className="text-xl font-bold text-primary-900 dark:text-white">Mobile Money Payment</h2>
                        </div>
                        <div className="space-y-4">
                            {/* MTN */}
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-xl border border-yellow-200 dark:border-yellow-800">
                                <div className="flex items-center mb-3">
                                    <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center mr-4">
                                        <span className="text-xl font-bold text-yellow-900">MTN</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-yellow-900 dark:text-yellow-100">MTN Mobile Money</h3>
                                        <p className="text-sm text-yellow-700 dark:text-yellow-200">Send payment to:</p>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-yellow-950 p-4 rounded-lg">
                                    <p className="text-2xl font-bold text-center text-yellow-900 dark:text-yellow-100">+237 676801063</p>
                                </div>
                            </div>
                            {/* Orange */}
                            <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-xl border border-orange-200 dark:border-orange-800">
                                <div className="flex items-center mb-3">
                                    <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mr-4">
                                        <span className="text-xl font-bold text-white">OM</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-orange-900 dark:text-orange-100">Orange Money</h3>
                                        <p className="text-sm text-orange-700 dark:text-orange-200">Send payment to:</p>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-orange-950 p-4 rounded-lg">
                                    <p className="text-2xl font-bold text-center text-orange-900 dark:text-orange-100">+237 697678867</p>
                                </div>
                            </div>
                            {/* Amount */}
                            <div className="bg-accent-gold/10 p-5 rounded-xl border border-accent-gold/30 flex items-center justify-between">
                                <span className="font-semibold text-primary-700 dark:text-primary-300">Amount to Send:</span>
                                <span className="text-3xl font-bold text-accent-gold">{amount} FCFA</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment ID */}
                    <div className="bg-white dark:bg-primary-900 p-8 rounded-2xl border border-primary-200 dark:border-primary-800 mb-6">
                        <h3 className="font-bold text-primary-900 dark:text-white mb-4">Confirm Your Payment</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                                Last 4 digits of your transaction ID
                            </label>
                            <input
                                type="text" maxLength={4} value={paymentId}
                                onChange={(e) => setPaymentId(e.target.value.replace(/\D/g, ''))}
                                placeholder="1234"
                                className="w-full px-4 py-4 bg-primary-50 dark:bg-primary-800 border-2 border-primary-200 dark:border-primary-700 rounded-xl text-primary-900 dark:text-white focus:ring-2 focus:ring-accent-gold focus:border-accent-gold focus:outline-none text-center text-3xl tracking-[0.5em] font-mono"
                            />
                            <p className="text-sm text-primary-500 mt-2">
                                Enter the last 4 digits of the transaction ID from your mobile money confirmation SMS.
                            </p>
                        </div>
                        <button
                            onClick={handlePaymentComplete}
                            disabled={isSubmitting || paymentId.length !== 4}
                            className="w-full py-4 px-6 bg-accent-gold text-primary-950 rounded-xl font-bold text-lg hover:bg-accent-gold/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-accent-gold/30"
                        >
                            {isSubmitting ? 'Submitting...' : 'Confirm Payment Complete'}
                        </button>
                    </div>

                    {/* Notice */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                        <div className="flex items-start">
                            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2">Important</h4>
                                <ul className="text-sm text-blue-700 dark:text-blue-200 space-y-1">
                                    <li>• Complete the mobile money transfer first before confirming here</li>
                                    <li>• Your account remains Free until payment is verified by our team</li>
                                    <li>• Verification takes <strong>less than 60 minutes</strong> during business hours</li>
                                    <li>• You'll receive a confirmation once your Pro access is activated</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default Payment;
