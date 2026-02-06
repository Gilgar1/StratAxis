import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('strataxis_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Handle 401 Unauthorized - Token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh token
                const refreshToken = localStorage.getItem('strataxis_refresh_token');
                if (refreshToken) {
                    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                        refresh_token: refreshToken,
                    });

                    const newToken = response.data.token;
                    localStorage.setItem('strataxis_token', newToken);

                    // Retry original request with new token
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    }
                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed, logout user
                localStorage.removeItem('strataxis_token');
                localStorage.removeItem('strataxis_user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        // Handle other errors
        return Promise.reject(error);
    }
);

// API Service
export const api = {
    // Generic methods
    get: <T>(url: string, config?: AxiosRequestConfig) =>
        apiClient.get<T>(url, config).then((res) => res.data),

    post: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
        apiClient.post<T>(url, data, config).then((res) => res.data),

    put: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
        apiClient.put<T>(url, data, config).then((res) => res.data),

    patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
        apiClient.patch<T>(url, data, config).then((res) => res.data),

    delete: <T>(url: string, config?: AxiosRequestConfig) =>
        apiClient.delete<T>(url, config).then((res) => res.data),
};

export default apiClient;
