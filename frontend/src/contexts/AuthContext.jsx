import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../services/api';
import {useNavigate} from 'react-router-dom';

const AuthContext = createContext(null);

const decodeToken = (token) => {
    try {
        if (!token) return null;
        return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
        console.error("Erro ao decodificar token:", error);
        return null;
    }
};

const getIsAdminFromToken = (token) => {
    const decoded = decodeToken(token);
    return decoded ? !!decoded.isAdmin : false;
};

export const AuthProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    const verifyToken = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setIsAuthenticated(false);
            setIsAdmin(false);
            setUser(null);
            return false;
        }

        try {
            await api.get('/auth/validate');
            const decoded = decodeToken(token);

            setIsAuthenticated(true);
            setIsAdmin(getIsAdminFromToken(token));
            setUser(decoded);
            return true;
        } catch (error) {
            console.error("Token inválido ou expirado", error);
            logout();
            return false;
        }
    }, []);

    useEffect(() => {
        verifyToken();
    }, [verifyToken]);

    const clearAuthState = () => {
        setError(null);
        setSuccessMessage('');
    };

    const login = async (credentials) => {
        setLoading(true);
        clearAuthState();

        try {
            const response = await api.post('/auth/login', credentials);
            const token = response.data.token;

            if (!token) throw new Error('Token não recebido do servidor');

            localStorage.setItem('token', token);
            setIsAuthenticated(true);
            setIsAdmin(getIsAdminFromToken(token));
            setUser(decodeToken(token));

            return true;
        } catch (error) {
            setError(error.response?.data?.message || 'Email ou senha incorretos');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setIsAdmin(false);
        setUser(null);
        window.dispatchEvent(new Event('auth-change'));
    };

    const register = async (userData) => {
        setLoading(true);
        clearAuthState();

        try {
            const response = await api.post('/users/register', userData);
            setSuccessMessage('Enviamos um link de confirmação para o seu email. Por favor, verifique sua caixa de entrada.');
            return { success: true, message: response.data };
        } catch (error) {
            console.error("Erro ao registrar:", error);
            setError(error.response?.data?.message || 'Erro ao registrar. Tente novamente.');
            return { success: false };
        } finally {
            setLoading(false);
        }
    };

    const confirmEmail = async (token) => {
        setLoading(true);
        clearAuthState();

        try {
            const response = await api.get(`/users/confirm?token=${token}`);
            setSuccessMessage('Email confirmado com sucesso! Agora você pode fazer login.');

            const jwtToken = response.data.token;
            if (!jwtToken) throw new Error('Token não recebido do servidor');

            localStorage.setItem('token', jwtToken);

            const decoded = decodeToken(jwtToken);
            setIsAdmin(decoded?.isAdmin || false);
            setIsAuthenticated(true);
            setUser(decoded);

            return true;
        } catch (error) {
            console.error("Erro ao confirmar email:", error);
            setError(error.response?.data?.message || 'Token inválido ou expirado. Por favor, tente se registrar novamente.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const requestPasswordReset = async (email) => {
        setLoading(true);
        clearAuthState();

        try {
            await api.post('/users/reset-password-request', { email });
            setSuccessMessage('Enviamos um link para redefinir sua senha. Por favor, verifique seu email.');
            return true;
        } catch (error) {
            setError(error.response?.data?.message || 'Erro ao solicitar redefinição de senha.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async (token, password) => {
        setLoading(true);
        clearAuthState();

        try {
            await api.post('/users/reset-password', { token, password });
            setSuccessMessage('Senha redefinida com sucesso! Agora você pode fazer login.');
            return true;
        } catch (error) {
            setError(error.response?.data?.message || 'Erro ao redefinir senha.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{
            login,
            logout,
            register,
            confirmEmail,
            requestPasswordReset,
            resetPassword,
            verifyToken,
            isAuthenticated,
            isAdmin,
            loading,
            error,
            successMessage,
            setSuccessMessage,
            user,
            clearAuthState
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);