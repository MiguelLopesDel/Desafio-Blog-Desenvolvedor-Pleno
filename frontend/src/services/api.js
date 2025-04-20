import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080',
    timeout: 15000
});

api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            if (!window.handlingAuthError) {
                window.handlingAuthError = true;
                console.warn('Sessão expirada ou acesso não autorizado. Realizando logout.');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.dispatchEvent(new Event('auth-change'));
                const path = window.location.pathname;
                if (!['/', '/login', '/register'].includes(path)) {
                    window.location.href = '/login?expired=true';
                }
                setTimeout(() => {
                    window.handlingAuthError = false;
                }, 1000);
            }
        }
        return Promise.reject(error);
    }
);

export default api;