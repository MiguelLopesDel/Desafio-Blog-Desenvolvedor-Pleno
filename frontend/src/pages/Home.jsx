import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import '../styles/home.css';
import { extractPlainText } from '../utils/contentUtils';

function HomePage() {
    const { isAuthenticated } = useAuth();
    const [userPosts, setUserPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({ posts: 0, views: 0 });
    const [pagination, setPagination] = useState({
        page: 0,
        size: 10,
        totalPages: 0,
        totalElements: 0
    });

    const fetchUserPosts = async (page = 0, size = 10) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.get(`/posts/user?page=${page}&size=${size}`);

            setUserPosts(data.content);
            setPagination({
                page: data.number,
                size: data.size,
                totalPages: data.totalPages,
                totalElements: data.totalElements
            });

            setStats({
                posts: data.totalElements,
                views: data.content.reduce((sum, post) => sum + (post.views || 0), 0)
            });
        } catch (err) {
            console.error("Erro ao buscar dados do usuário:", err);
            setError("Erro ao carregar seu perfil. Por favor, tente novamente.");
        }
        setLoading(false);
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchUserPosts();
        }
    }, [isAuthenticated]);

    const handlePageChange = (newPage) => {
        if (newPage !== pagination.page && newPage >= 0 && newPage < pagination.totalPages) {
            fetchUserPosts(newPage, pagination.size);
        }
    };

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    if (loading) {
        return (
            <div className="loading" role="status" aria-live="polite">
                <span className="spinner" aria-label="Carregando"></span>
                Carregando seu perfil...
            </div>
        );
    }
    if (error) {
        return <div className="error-message" role="alert">{error}</div>;
    }

    return (
        <div className="profile-container">
            <section className="profile-header">
                <div className="profile-stats">
                    <div className="stat-card">
                        <span className="stat-number">{stats.posts}</span>
                        <span className="stat-label">Posts</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">{stats.views}</span>
                        <span className="stat-label">Visualizações</span>
                    </div>
                </div>
            </section>

            <section className="create-post-section">
                <Link to="/create-post" className="create-post-btn">
                    <i className="create-icon" aria-label="Novo post">✎</i> Criar Novo Post
                </Link>
            </section>

            <section className="user-posts-section">
                <h2>Meus Posts</h2>

                {userPosts.length === 0 ? (
                    <div className="no-posts">
                        <p>Você ainda não criou nenhum post.</p>
                        <Link to="/create-post" className="start-posting-btn">
                            Comece a escrever agora
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="user-posts-grid">
                            {userPosts.map(post => (
                                <article key={post.id} className="user-post-card">
                                    <div className="post-status">
                                        <span
                                            className={`status-badge ${post.isPrivate ? 'private' : 'public'}`}
                                            aria-label={post.isPrivate ? 'Post privado' : 'Post público'}
                                        >
                                            {post.isPrivate ? 'Privado' : 'Público'}
                                        </span>
                                    </div>
                                    <div className="post-content">
                                        <h3>{post.title}</h3>
                                        <p className="post-excerpt">
                                            {extractPlainText(post.content, 150)}
                                        </p>
                                        <div className="post-meta">
                                            <span className="post-date">
                                                {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                                            </span>
                                            <span className="post-views">
                                                <i className="view-icon" aria-label="Visualizações">👁</i> {post.views ?? 0}
                                            </span>
                                        </div>
                                        <div className="post-actions">
                                            <Link to={`/post/${post.id}`} className="view-button">
                                                Ver
                                            </Link>
                                            <Link to={`/edit-post/${post.id}`} className="edit-button">
                                                Editar
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                        {pagination.totalPages > 1 && (
                            <nav className="pagination-controls" aria-label="Paginação de posts">
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 0}
                                    className="pagination-button"
                                >
                                    Anterior
                                </button>
                                <span className="pagination-info">
                                    Página {pagination.page + 1} de {pagination.totalPages}
                                </span>
                                <button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.totalPages - 1}
                                    className="pagination-button"
                                >
                                    Próxima
                                </button>
                            </nav>
                        )}
                    </>
                )}
            </section>
        </div>
    );
}

export default HomePage;