import axios from 'axios';

const getBaseURL = () => {
    const savedUrl = localStorage.getItem('api_url');
    if (savedUrl) return savedUrl;
    return import.meta.env.VITE_API_URL || '/api';
};

const api = axios.create({
    get baseURL() {
        return getBaseURL();
    }
});

// Attach JWT token and dynamic base URL to every request
api.interceptors.request.use((config) => {
    config.baseURL = getBaseURL();
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auto-logout on 401
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

export default api;
