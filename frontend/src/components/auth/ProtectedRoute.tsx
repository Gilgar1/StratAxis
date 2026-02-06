import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Loading from '../common/Loading';

interface ProtectedRouteProps {
    children: ReactNode;
    requiredRole?: 'FREE_USER' | 'PAID_USER' | 'ADMIN';
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
        const roleHierarchy = {
            FREE_USER: 1,
            PAID_USER: 2,
            ADMIN: 3,
        };

        const userRoleLevel = roleHierarchy[user.role];
        const requiredRoleLevel = roleHierarchy[requiredRole];

        if (userRoleLevel < requiredRoleLevel) {
            return <Navigate to="/dashboard" replace />;
        }
    }

    return <>{children}</>;
};

export default ProtectedRoute;
