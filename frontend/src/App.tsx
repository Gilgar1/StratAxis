import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { MetricsProvider } from './contexts/MetricsContext';
import { AppProvider } from './contexts/AppContext';

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
import YieldEstimator from './pages/YieldEstimator';
import Alerts from './pages/Alerts';
import ExportReporting from './pages/ExportReporting';

// Free User Intelligence Pages
import MedianPropertyPrice from './pages/MedianPropertyPrice';
import AveragePropertyPrice from './pages/AveragePropertyPrice';
import PricePerSquareMeter from './pages/PricePerSquareMeter';
import AnnualAppreciation from './pages/AnnualAppreciation';
import AverageRent from './pages/AverageRent';
import BasicRentalYield from './pages/BasicRentalYield';
import GettingFunded from './pages/GettingFunded';
import Economics from './pages/Economics';
import ProjectProcess from './pages/ProjectProcess';

// Paid User Intelligence Pages
import NeighborhoodRentalYield from './pages/NeighborhoodRentalYield';
import VacancyRate from './pages/VacancyRate';
import Inventory from './pages/Inventory';
import DaysOnMarket from './pages/DaysOnMarket';
import ConstructionPermitVolume from './pages/ConstructionPermitVolume';

// Payment
import Payment from './pages/Payment';

// Admin
import AdminPanel from './pages/AdminPanel';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
    return (
        <AppProvider>
            <MetricsProvider>
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
                                path="/payment"
                                element={
                                    <ProtectedRoute>
                                        <Payment />
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
                                path="/yield-estimator"
                                element={
                                    <ProtectedRoute>
                                        <YieldEstimator />
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

                            {/* Free User Intelligence Routes */}
                            <Route
                                path="/median-property-price"
                                element={
                                    <ProtectedRoute>
                                        <MedianPropertyPrice />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/average-property-price"
                                element={
                                    <ProtectedRoute>
                                        <AveragePropertyPrice />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/price-per-sqm"
                                element={
                                    <ProtectedRoute>
                                        <PricePerSquareMeter />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/annual-appreciation"
                                element={
                                    <ProtectedRoute>
                                        <AnnualAppreciation />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/average-rent"
                                element={
                                    <ProtectedRoute>
                                        <AverageRent />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/basic-rental-yield"
                                element={
                                    <ProtectedRoute>
                                        <BasicRentalYield />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/economics"
                                element={
                                    <ProtectedRoute>
                                        <Economics />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/getting-funded"
                                element={
                                    <ProtectedRoute>
                                        <GettingFunded />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/project-process"
                                element={
                                    <ProtectedRoute>
                                        <ProjectProcess />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Paid User Intelligence Routes */}
                            <Route
                                path="/neighborhood-rental-yield"
                                element={
                                    <ProtectedRoute requiredRole="PAID_USER">
                                        <NeighborhoodRentalYield />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/vacancy-rate"
                                element={
                                    <ProtectedRoute requiredRole="PAID_USER">
                                        <VacancyRate />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/inventory"
                                element={
                                    <ProtectedRoute requiredRole="PAID_USER">
                                        <Inventory />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/days-on-market"
                                element={
                                    <ProtectedRoute requiredRole="PAID_USER">
                                        <DaysOnMarket />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/construction-permit-volume"
                                element={
                                    <ProtectedRoute requiredRole="PAID_USER">
                                        <ConstructionPermitVolume />
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
            </MetricsProvider>
        </AppProvider>
    );
}

export default App;
