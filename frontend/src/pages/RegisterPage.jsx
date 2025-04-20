import {useState} from 'react';
import {Link} from 'react-router-dom';
import FormInput from '../components/common/FormInput';
import {useAuth} from '../contexts/AuthContext';
import '../styles/auth.css';

function RegisterPage() {
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const {register, error, loading, successMessage} = useAuth();

    const handleChange = (e) => {
        const {name, value} = e.target;
        setUserData((prev) => ({...prev, [name]: value}));
        if (errors[name]) {
            setErrors((prev) => ({...prev, [name]: ''}));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!userData.name.trim()) newErrors.name = 'Nome é obrigatório';

        if (!userData.email.trim()) {
            newErrors.email = 'Email é obrigatório';
        } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
            newErrors.email = 'Email inválido';
        }

        if (!userData.password) {
            newErrors.password = 'Senha é obrigatória';
        } else if (userData.password.length < 8) {
            newErrors.password = 'A senha deve ter pelo menos 8 caracteres';
        }

        if (userData.confirmPassword !== userData.password) {
            newErrors.confirmPassword = 'As senhas não coincidem';
        } else if (!userData.confirmPassword) {
            newErrors.confirmPassword = 'Confirme a senha';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const {confirmPassword, ...registrationData} = userData;
        await register(registrationData);
        if (successMessage) {
            setUserData({
                name: '',
                email: '',
                password: '',
                confirmPassword: ''
            });
        }
    };

    return (
        <div className="auth-container">
            <h2>Criar Conta</h2>

            {successMessage && (
                <div className="success-message" role="status">
                    <p>{successMessage}</p>
                    <p>Verifique sua caixa de entrada e spam para confirmar seu e-mail.</p>
                </div>
            )}

            {error && <p className="error-message" role="alert">{error}</p>}

            {!successMessage && (
                <form onSubmit={handleSubmit} noValidate>
                    <FormInput
                        label="Nome"
                        name="name"
                        value={userData.name}
                        onChange={handleChange}
                        error={errors.name}
                        required
                        autoFocus
                    />

                    <FormInput
                        label="Email"
                        name="email"
                        type="email"
                        value={userData.email}
                        onChange={handleChange}
                        error={errors.email}
                        required
                        autoComplete="email"
                    />

                    <FormInput
                        label="Senha"
                        name="password"
                        type="password"
                        value={userData.password}
                        onChange={handleChange}
                        error={errors.password}
                        required
                        autoComplete="new-password"
                    />

                    <FormInput
                        label="Confirmar Senha"
                        name="confirmPassword"
                        type="password"
                        value={userData.confirmPassword}
                        onChange={handleChange}
                        error={errors.confirmPassword}
                        required
                        autoComplete="new-password"
                    />

                    <button type="submit" disabled={loading} aria-busy={loading}
                            className={loading ? 'loading-btn' : ''}>
                        {loading ? 'Registrando...' : 'Registrar'}
                    </button>
                </form>
            )}

            <p className="auth-link">
                Já tem uma conta? <Link to="/login">Faça login</Link>
            </p>
        </div>
    );
}

export default RegisterPage;