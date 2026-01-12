import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Loading from './components/common/Loading';
import ErrorBoundary from './components/common/ErrorBoundary';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Insights = lazy(() => import('./pages/Insights'));
const Booking = lazy(() => import('./pages/Booking'));
const Profile = lazy(() => import('./pages/Profile'));
const Admin = lazy(() => import('./pages/Admin'));

function App() {
    return (
        <div className="flex flex-col min-h-screen">
            <ErrorBoundary>
                <Header />
                <main className="flex-grow">
                    <Suspense fallback={<Loading />}>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/analytics" element={<Analytics />} />
                            <Route path="/insights" element={<Insights />} />
                            <Route path="/booking" element={<Booking />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/admin" element={<Admin />} />
                        </Routes>
                    </Suspense>
                </main>
                <Footer />
            </ErrorBoundary>
        </div>
    );
}

export default App;
