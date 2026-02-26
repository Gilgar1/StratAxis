import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import { CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Payment: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [paymentId, setPaymentId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const period = searchParams.get('period');

    const amount = period === 'yearly' ? '150,000' : '15,000';
    const billingText = period === 'yearly' ? 'per year' : 'per month';

    const handlePaymentComplete = async () => {
        if (paymentId.length !== 4 || !/^\d{4}$/.test(paymentId)) {
            alert('Please enter the last 4 digits of your payment ID');
            return;
        }

        setIsSubmitting(true);

        try {
            // Submit payment verification request to backend
            const response = await fetch('/api/payments/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('strataxis_token')}`
                },
                body: JSON.stringify({
                    user_id: user?.id,
                    plan: 'PRO_INVESTOR',
                    billing_period: period,
                    payment_id_last_four: paymentId,
                    amount: period === 'yearly' ? 150000 : 15000
                })
            });

            if (response.ok) {
                setShowSuccess(true);

                // Redirect to dashboard after 5 seconds
                setTimeout(() => {
                    navigate('/dashboard');
                }, 5000);
            } else {
                alert('Failed to submit payment. Please try again or contact support.');
            }
        } catch (error) {
            console.error('Payment submission error:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (showSuccess) {
        return (
            <AuthenticatedLayout>
                <div className="min-h-screen flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white dark:bg-primary-900 p-8 rounded-2xl border border-primary-200 dark:border-primary-800 text-center">
                        <CheckCircle className="w-16 h-16 text-semantic-success mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-primary-900 dark:text-white mb-4">
                            Payment Submitted!
                        </h2>
                        <p className="text-primary-600 dark:text-primary-300 mb-6">
                            Your access to Investor Pro will be available in less than an hour from now.
                            Our team is verifying your payment.
                        </p>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="text-sm text-blue-700 dark:text-blue-200">
                                You'll receive an email confirmation once your payment is approved.
                                Redirecting to dashboard...
                            </p>
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
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-primary-900 dark:text-white mb-2">
                            Complete Your Payment
                        </h1>
                        <p className="text-primary-600 dark:text-primary-300">
                            Upgrade to Pro Investor - {amount} FCFA {billingText}
                        </p>
                    </div>

                    {/* Payment Instructions */}
                    <div className="bg-white dark:bg-primary-900 p-8 rounded-2xl border border-primary-200 dark:border-primary-800 mb-6">
                        <div className="flex items-center mb-6">
                            <CreditCard className="w-6 h-6 text-accent-gold mr-3" />
                            <h2 className="text-xl font-bold text-primary-900 dark:text-white">
                                Mobile Money Payment
                            </h2>
                        </div>

                        <div className="space-y-6">
                            {/* MTN Mobile Money */}
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-xl border border-yellow-200 dark:border-yellow-800">
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center mr-4">
                                        <span className="text-xl font-bold text-yellow-900">MTN</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-yellow-900 dark:text-yellow-100">MTN Mobile Money</h3>
                                        <p className="text-sm text-yellow-700 dark:text-yellow-200">Send payment to:</p>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-yellow-950 p-4 rounded-lg">
                                    <p className="text-2xl font-bold text-center text-yellow-900 dark:text-yellow-100">
                                        +237 676801063
                                    </p>
                                </div>
                            </div>

                            {/* Orange Money */}
                            <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-xl border border-orange-200 dark:border-orange-800">
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mr-4">
                                        <span className="text-xl font-bold text-white">OM</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-orange-900 dark:text-orange-100">Orange Money</h3>
                                        <p className="text-sm text-orange-700 dark:text-orange-200">Send payment to:</p>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-orange-950 p-4 rounded-lg">
                                    <p className="text-2xl font-bold text-center text-orange-900 dark:text-orange-100">
                                        +237 697678867
                                    </p>
                                </div>
                            </div>

                            {/* Amount to Send */}
                            <div className="bg-accent-gold/10 p-6 rounded-xl border border-accent-gold/30">
                                <div className="flex items-center justify-between">
                                    <span className="text-primary-600 dark:text-primary-300 font-semibold">Amount to Send:</span>
                                    <span className="text-3xl font-bold text-accent-gold">{amount} FCFA</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment ID Input */}
                    <div className="bg-white dark:bg-primary-900 p-8 rounded-2xl border border-primary-200 dark:border-primary-800 mb-6">
                        <h3 className="font-bold text-primary-900 dark:text-white mb-4">
                            Confirm Your Payment
                        </h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                                Last 4 digits of payment ID
                            </label>
                            <input
                                type="text"
                                maxLength={4}
                                value={paymentId}
                                onChange={(e) => setPaymentId(e.target.value.replace(/\D/g, ''))}
                                placeholder="1234"
                                className="w-full px-4 py-3 bg-primary-50 dark:bg-primary-800 border border-primary-300 dark:border-primary-700 rounded-lg text-primary-900 dark:text-white focus:ring-2 focus:ring-accent-gold focus:outline-none text-center text-2xl tracking-widest font-mono"
                            />
                            <p className="text-sm text-primary-500 dark:text-primary-400 mt-2">
                                You'll receive a transaction ID after completing the mobile money transfer. Enter the last 4 digits here.
                            </p>
                        </div>

                        <button
                            onClick={handlePaymentComplete}
                            disabled={isSubmitting || paymentId.length !== 4}
                            className="w-full py-4 px-6 bg-accent-gold text-primary-950 rounded-lg font-bold text-lg hover:bg-accent-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Submitting...' : 'Payment Complete'}
                        </button>
                    </div>

                    {/* Important Notice */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                        <div className="flex items-start">
                            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Important</h4>
                                <ul className="text-sm text-blue-700 dark:text-blue-200 space-y-1">
                                    <li>• Complete the mobile money transfer first before submitting</li>
                                    <li>• Your account will remain as Free until payment is verified</li>
                                    <li>• Verification typically takes less than 1 hour</li>
                                    <li>• You'll receive an email confirmation once approved</li>
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
