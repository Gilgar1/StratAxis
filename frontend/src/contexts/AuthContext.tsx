import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState, LoginCredentials, RegisterData } from '../types';
import { authService } from '../services/auth';

interface AuthContextType extends AuthState {
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
    refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize auth state from localStorage
    useEffect(() => {
        const initAuth = async () => {
            try {
                const storedToken = localStorage.getItem('strataxis_token');
                const storedUser = localStorage.getItem('strataxis_user');

                if (storedToken && storedUser) {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));

                    // Verify token is still valid
                    try {
                        await authService.verifyToken(storedToken);
                    } catch (error) {
                        // Token invalid, clear auth
                        logout();
                    }
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                logout();
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async (credentials: LoginCredentials) => {
        try {
            const response = await authService.login(credentials);
            setUser(response.user);
            setToken(response.token);

            // Persist to localStorage
            localStorage.setItem('strataxis_token', response.token);
            localStorage.setItem('strataxis_user', JSON.stringify(response.user));
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const register = async (data: RegisterData) => {
        try {
            const response = await authService.register(data);
            setUser(response.user);
            setToken(response.token);

            // Persist to localStorage
            localStorage.setItem('strataxis_token', response.token);
            localStorage.setItem('strataxis_user', JSON.stringify(response.user));
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('strataxis_token');
        localStorage.removeItem('strataxis_user');
    };

    const refreshToken = async () => {
        try {
            if (!token) throw new Error('No token to refresh');

            const response = await authService.refreshToken(token);
            setToken(response.token);
            localStorage.setItem('strataxis_token', response.token);
        } catch (error) {
            console.error('Token refresh error:', error);
            logout();
            throw error;
        }
    };

    const value: AuthContextType = {
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
        refreshToken,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
