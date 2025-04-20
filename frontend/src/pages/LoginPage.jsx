import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import FormInput from '../components/common/FormInput';
import { useAuth } from '../contexts/AuthContext';
import '../styles/auth.css';

function LoginPage() {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const { login, error, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [authMessage, setAuthMessage] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const [attemptCount, setAttemptCount] = useState(0);
    const from = location.state?.from?.pathname || '/profile';

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('expired') === 'true') {
            setAuthMessage('Sua sessão expirou. Por favor, faça login novamente.');
        } else if (params.get('logout') === 'true') {
            setAuthMessage('Você saiu da sua conta com sucesso.');
        } else if (params.get('registered') === 'true') {
            setAuthMessage('Cadastro realizado com sucesso! Faça login para continuar.');
        } else if (params.get('verified') === 'true') {
            setAuthMessage('Seu e-mail foi confirmado. Faça login para continuar.');
        }
    }, [location]);

    const validateForm = () => {
        const errors = {};
        if (!credentials.email.trim()) {
            errors.email = 'Informe o e-mail';
        } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
            errors.email = 'E-mail inválido';
        }

        if (!credentials.password) {
            errors.password = 'Informe a senha';
        } else if (credentials.password.length < 8) {
            errors.password = 'A senha deve ter pelo menos 8 caracteres';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials((prev) => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const loginOk = await login(credentials);
        if (loginOk) {
            navigate(from, { replace: true });
        } else {
            setAttemptCount((prev) => prev + 1);

            if (attemptCount >= 2) {
                setAuthMessage('Muitas tentativas de login. Esqueceu sua senha?');
            } else {
                setAuthMessage('');
            }
        }
    };

    return (
        <div className="auth-container" aria-labelledby="login-title">
            <h2 id="login-title">Login</h2>
            {authMessage && <p className="auth-message" role="status">{authMessage}</p>}
            {error && <p className="error-message" role="alert">{error}</p>}

            <form onSubmit={handleSubmit} noValidate autoComplete="on" aria-describedby="mensagem-login">
                <FormInput
                    label="E-mail"
                    name="email"
                    type="email"
                    value={credentials.email}
                    onChange={handleChange}
                    error={formErrors.email}
                    required
                    autoFocus
                    autoComplete="email"
                />

                <FormInput
                    label="Senha"
                    name="password"
                    type="password"
                    value={credentials.password}
                    onChange={handleChange}
                    error={formErrors.password}
                    required
                    autoComplete="current-password"
                />

                <div className="forgot-password">
                    <Link to="/forgot-password">Esqueceu sua senha?</Link>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={loading ? 'loading-btn' : ''}
                    aria-busy={loading}
                >
                    {loading ? 'Entrando...' : 'Entrar'}
                </button>
            </form>

            <p className="auth-link">
                Não tem uma conta? <Link to="/register">Registre-se</Link>
            </p>
        </div>
    );
}

export default LoginPage;