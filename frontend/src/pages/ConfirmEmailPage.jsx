import {useEffect, useState} from 'react';
import {useNavigate, useLocation} from 'react-router-dom';
import {useAuth} from '../contexts/AuthContext';

function ConfirmEmailPage() {
    const {confirmEmail, loading, error, successMessage} = useAuth();
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isProcessing, setIsProcessing] = useState(true);
    const [validationStarted, setValidationStarted] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        (async () => {
            if (validationStarted) return;

            setValidationStarted(true);

            const queryParams = new URLSearchParams(location.search);
            const token = queryParams.get('token');

            if (!token) {
                setIsProcessing(false);
                return;
            }

            try {
                const success = await confirmEmail(token);
                setIsConfirmed(success);

                if (success) {
                    setTimeout(() => {
                        navigate('/login?verified=true', {replace: true});
                    }, 2500);
                }
            } finally {
                setIsProcessing(false);
            }
        })();
    }, []);

    return (
        <div className="confirm-email-container">
            <h2>Confirmação de Email</h2>

            {loading || isProcessing ? (
                <div className="loading" role="status" aria-live="polite">
                    <span className="spinner" aria-label="Validando"/>
                    Validando seu email...
                </div>
            ) : null}

            {!loading && isConfirmed && (
                <div className="success-message" role="alert">
                    <p>Email confirmado com sucesso!</p>
                    <p>Você será redirecionado para a página de login.</p>
                </div>
            )}

            {!loading && !isConfirmed && !isProcessing && (
                <div className="error-message" role="alert">
                    <p>{error || "Ocorreu um erro ao confirmar seu email."}</p>
                    <button onClick={() => navigate('/register')}>
                        Voltar para o registro
                    </button>
                </div>
            )}
        </div>
    );
}

export default ConfirmEmailPage;