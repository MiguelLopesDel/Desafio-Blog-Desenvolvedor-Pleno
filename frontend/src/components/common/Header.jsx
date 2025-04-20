import React from 'react';
import {Link} from 'react-router-dom';
import PropTypes from 'prop-types';
import '../../styles/header.css';
import ThemeToggle from './ThemeToggle';

const Header = ({isAuthenticated, isAdmin, onLogout}) => {
    return (
        <header className="header">
            <div className="logo">
                <Link to="/">Blogify</Link>
            </div>

            <div className="header-right">
                <nav className="nav-menu" aria-label="Navegação principal">
                    {isAuthenticated ? (
                        <>
                            <Link to="/profile" className="nav-item">Meu Perfil</Link>
                            {isAdmin && <Link to="/admin" className="nav-item">Painel Admin</Link>}
                            <button
                                onClick={onLogout}
                                className="nav-item logout-btn"
                                aria-label="Sair da conta"
                            >
                                Sair
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/register" className="nav-item register-btn">Registrar</Link>
                            <Link to="/login" className="nav-item login-btn">Entrar</Link>
                        </>
                    )}
                </nav>
                <ThemeToggle/>
            </div>
        </header>
    );
};

Header.propTypes = {
    isAuthenticated: PropTypes.bool.isRequired,
    isAdmin: PropTypes.bool,
    onLogout: PropTypes.func.isRequired
};

export default Header;