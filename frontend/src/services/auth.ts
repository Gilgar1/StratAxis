import { api } from './api';
import { User, LoginCredentials, RegisterData } from '../types';

interface AuthResponse {
    user: User;
    token: string;
    refresh_token?: string;
}

export const authService = {
    // Login
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        try {
            const response = await api.post<AuthResponse>('/auth/login', credentials);

            // Store refresh token if provided
            if (response.refresh_token) {
                localStorage.setItem('strataxis_refresh_token', response.refresh_token);
            }

            return response;
        } catch (error: any) {
            const detail = error.response?.data?.detail || error.response?.data?.message || error.message || 'Login failed';
            throw new Error(detail);
        }
    },

    // Register
    register: async (data: RegisterData): Promise<AuthResponse> => {
        try {
            const response = await api.post<AuthResponse>('/auth/register', data);

            // Store refresh token if provided
            if (response.refresh_token) {
                localStorage.setItem('strataxis_refresh_token', response.refresh_token);
            }

            return response;
        } catch (error: any) {
            const detail = error.response?.data?.detail || error.response?.data?.message || error.message || 'Registration failed';
            throw new Error(detail);
        }
    },

    // Verify token
    verifyToken: async (token: string): Promise<{ valid: boolean }> => {
        try {
            return await api.get('/auth/verify', {
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (error) {
            throw new Error('Token verification failed');
        }
    },

    // Refresh token
    refreshToken: async (token: string): Promise<{ token: string }> => {
        try {
            return await api.post('/auth/refresh', { token });
        } catch (error) {
            throw new Error('Token refresh failed');
        }
    },

    // Logout
    logout: async (): Promise<void> => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('strataxis_token');
            localStorage.removeItem('strataxis_refresh_token');
            localStorage.removeItem('strataxis_user');
        }
    },

    // Forgot password
    forgotPassword: async (email: string): Promise<{ message: string }> => {
        try {
            return await api.post('/auth/forgot-password', { email });
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Password reset request failed');
        }
    },

    // Reset password
    resetPassword: async (token: string, password: string): Promise<{ message: string }> => {
        try {
            return await api.post('/auth/reset-password', { token, password });
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Password reset failed');
        }
    },
};
