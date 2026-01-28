import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Loading from './components/common/Loading';
import ErrorBoundary from './components/common/ErrorBoundary';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Insights = lazy(() => import('./pages/Insights'));
const Booking = lazy(() => import('./pages/Booking'));
const Profile = lazy(() => import('./pages/Profile'));
const Admin = lazy(() => import('./pages/Admin'));

// Auth Pages
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="flex flex-col min-h-screen bg-brand-black scrollbar-custom">
                    <ErrorBoundary>
                        <Header />
                        <main className="flex-grow">
                            <Suspense fallback={<Loading />}>
                                <Routes>
                                    {/* Public Routes */}
                                    <Route path="/" element={<Home />} />
                                    <Route path="/login" element={<Login />} />
                                    <Route path="/register" element={<Register />} />
                                    <Route path="/forgot-password" element={<ForgotPassword />} />

                                    {/* Semi-Protected Routes (Analytics can be viewed by all, but premium features inside might require auth) */}
                                    <Route path="/analytics" element={<Analytics />} />

                                    {/* Protected Routes */}
                                    <Route
                                        path="/insights"
                                        element={
                                            <ProtectedRoute>
                                                <Insights />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/booking"
                                        element={
                                            <ProtectedRoute>
                                                <Booking />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/profile"
                                        element={
                                            <ProtectedRoute>
                                                <Profile />
                                            </ProtectedRoute>
                                        }
                                    />

                                    {/* Admin Routes */}
                                    <Route
                                        path="/admin"
                                        element={
                                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                                <Admin />
                                            </ProtectedRoute>
                                        }
                                    />

                                    {/* Utility Routes */}
                                    <Route path="/unauthorized" element={<div className="text-white text-center py-20">Unauthorized Access</div>} />
                                    <Route path="*" element={<Navigate to="/" replace />} />
                                </Routes>
                            </Suspense>
                        </main>
                        <Footer />
                    </ErrorBoundary>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
