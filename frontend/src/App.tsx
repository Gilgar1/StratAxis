import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Methodology from './pages/Methodology';
import Pricing from './pages/Pricing';
import Blog from './pages/Blog';
import BlogArticle from './pages/BlogArticle';
import BookConsultation from './pages/BookConsultation';

// Authenticated Pages
import Dashboard from './pages/Dashboard';
import InteractiveMaps from './pages/InteractiveMaps';
import LandPriceIntelligence from './pages/LandPriceIntelligence';
import RentPriceIntelligence from './pages/RentPriceIntelligence';
import TimeSeriesAnalysis from './pages/TimeSeriesAnalysis';
import Insights from './pages/Insights';
import DataQuality from './pages/DataQuality';
import Watchlists from './pages/Watchlists';
import Comparison from './pages/Comparison';
import Scenario from './pages/Scenario';
import Alerts from './pages/Alerts';
import ExportReporting from './pages/ExportReporting';

// Admin
import AdminPanel from './pages/AdminPanel';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/methodology" element={<Methodology />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:slug" element={<BlogArticle />} />
                    <Route path="/book-consultation" element={<BookConsultation />} />

                    {/* Authenticated Routes */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/maps"
                        element={
                            <ProtectedRoute>
                                <InteractiveMaps />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/land-intelligence"
                        element={
                            <ProtectedRoute>
                                <LandPriceIntelligence />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/rent-intelligence"
                        element={
                            <ProtectedRoute>
                                <RentPriceIntelligence />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/time-series"
                        element={
                            <ProtectedRoute>
                                <TimeSeriesAnalysis />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/insights"
                        element={
                            <ProtectedRoute>
                                <Insights />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/data-quality"
                        element={
                            <ProtectedRoute>
                                <DataQuality />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/watchlists"
                        element={
                            <ProtectedRoute>
                                <Watchlists />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/comparison"
                        element={
                            <ProtectedRoute>
                                <Comparison />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/scenario"
                        element={
                            <ProtectedRoute>
                                <Scenario />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/alerts"
                        element={
                            <ProtectedRoute>
                                <Alerts />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/export"
                        element={
                            <ProtectedRoute>
                                <ExportReporting />
                            </ProtectedRoute>
                        }
                    />

                    {/* Admin Routes */}
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute requiredRole="ADMIN">
                                <AdminPanel />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
