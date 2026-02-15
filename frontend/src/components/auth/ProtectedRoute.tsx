import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Loading from '../common/Loading';

interface ProtectedRouteProps {
    children: ReactNode;
    requiredRole?: 'FREE_USER' | 'PAID_USER' | 'INSTITUTIONAL' | 'ADMIN';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
    const { isAuthenticated, isLoading, user } = useAuth();

    if (isLoading) {
        return <Loading fullScreen />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Check role if required
    if (requiredRole && user) {
        const roleHierarchy: Record<string, number> = {
            FREE_USER: 1,
            PAID_USER: 2,
            INSTITUTIONAL: 2, // Institutional has access to paid features
            ADMIN: 3,
        };

        const userRoleLevel = roleHierarchy[user.role] || 0;
        const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

        if (userRoleLevel < requiredRoleLevel) {
            return <Navigate to="/dashboard" replace />;
        }
    }

    return <>{children}</>;
};

export default ProtectedRoute;
