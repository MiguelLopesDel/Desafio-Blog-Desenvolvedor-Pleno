import {useState, useEffect, useRef, useCallback} from 'react';
import {Link} from 'react-router-dom';
import api from '../services/api';
import '../styles/blogHome.css';
import {extractYoutubeVideo} from '../utils/contentUtils';
import {useAuth} from '../contexts/AuthContext';

const processPostContent = (content, textLength = 150) => {
    const result = extractYoutubeVideo(content);
    return {
        ...result,
        excerpt: result.content.substring(0, textLength) + (result.content.length > textLength ? "..." : "")
    };
};

function BlogHome() {
    const [posts, setPosts] = useState([]);
    const [featuredPosts, setFeaturedPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef();
    const {isAuthenticated} = useAuth();

    const lastPostElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new window.IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    const fetchPosts = useCallback(async () => {
        if (page > 0 && !hasMore) return;
        setLoading(true);
        try {
            const response = await api.get(`/posts?page=${page}&size=6`);
            const {content, totalPages: total} = response.data;

            setHasMore(page < total - 1);

            if (content && content.length > 0) {
                if (page === 0) {
                    setFeaturedPosts(content.slice(0, 3));
                    setPosts(content.slice(3));
                } else {
                    setPosts(prevPosts => [...prevPosts, ...content]);
                }
            } else if (page === 0) {
                setPosts([]);
                setFeaturedPosts([]);
            }
        } catch (err) {
            console.error("Erro ao buscar posts:", err);
            setError("Não foi possível carregar os posts. Tente novamente mais tarde.");
        } finally {
            setLoading(false);
        }
    }, [page, hasMore]);

    useEffect(() => {
        fetchPosts();
    }, [page, fetchPosts]);

    if (loading && page === 0)
        return <div className="loading" role="status" aria-live="polite">
            <span className="spinner" aria-label="Carregando"/> Carregando conteúdo...
        </div>;
    if (error)
        return <div className="error-message" role="alert">{error}</div>;

    return (
        <div className="blog-home-container">
            <header className="blog-header">
                <div className="header-content">
                    <h1>Blogify</h1>
                    <p>Um espaço para compartilhar conhecimento, ideias e experiências.</p>

                    {isAuthenticated && (
                        <div className="create-post-cta">
                            <Link to="/create-post" className="create-post-button" aria-label="Criar novo post">
                                <span aria-hidden="true" className="create-icon">✎</span> Comece a escrever seu post
                            </Link>
                        </div>
                    )}
                </div>
            </header>

            {featuredPosts.length > 0 && (
                <section className="featured-section">
                    <h2 className="section-title">Destaques</h2>
                    <div className="featured-grid">
                        {featuredPosts.map((post, index) => {
                            const processed = processPostContent(
                                post.content,
                                index === 0 ? 180 : 120
                            );
                            const hasVideo = processed.hasVideo;

                            return (
                                <div key={post.id} className={`featured-card ${index === 0 ? 'main-feature' : ''}`}>
                                    <div className="featured-content">
                                        <span className="post-category">{post.category || 'Blog'}</span>
                                        <h3>{post.title}</h3>

                                        {hasVideo && index === 0 ? (
                                            <div className="video-preview">
                                                <div className="video-container">
                                                    <iframe
                                                        src={`https://www.youtube.com/embed/${processed.videoId}`}
                                                        frameBorder="0"
                                                        allowFullScreen
                                                        title={`Vídeo de ${post.title}`}
                                                        aria-label="Prévia do vídeo"
                                                        loading="lazy"
                                                    ></iframe>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="post-excerpt">
                                                {processed.excerpt}
                                            </p>
                                        )}

                                        <div className="post-meta">
                                            <span className="post-author">
                                                {post.author || 'Autor desconhecido'}
                                            </span>
                                            <span className="post-date">
                                                {post.createdAt ? new Date(post.createdAt).toLocaleDateString('pt-BR') : 'Data desconhecida'}
                                            </span>
                                        </div>

                                        {hasVideo && (
                                            <span className="video-badge" aria-label="Contém vídeo">
                                                <span className="video-icon" aria-hidden="true">▶</span> Com vídeo
                                            </span>
                                        )}

                                        <Link to={`/post/${post.id}`} className="featured-button"
                                              aria-label={`Ler artigo ${post.title}`}>
                                            Ler artigo
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            <section className="recent-posts">
                <h2 className="section-title">Artigos Recentes</h2>

                {posts.length === 0 ? (
                    <p className="no-posts-message">Nenhum artigo encontrado.</p>
                ) : (
                    <div className="posts-grid">
                        {posts.map((post, index) => {
                            const processed = processPostContent(post.content);
                            const hasVideo = processed.hasVideo;

                            return (
                                <article
                                    key={post.id}
                                    className="post-card"
                                    ref={index === posts.length - 1 ? lastPostElementRef : undefined}
                                >
                                    <div className="post-content">
                                        <h3>{post.title}</h3>

                                        {hasVideo ? (
                                            <div className="video-indicator">
                                                <span className="video-badge" aria-label="Contém vídeo">
                                                    <span className="video-icon" aria-hidden="true">▶</span> Com vídeo
                                                </span>
                                                <p className="post-excerpt">
                                                    {post.excerpt || processed.excerpt}
                                                </p>
                                            </div>
                                        ) : (
                                            <p className="post-excerpt">
                                                {post.excerpt || processed.excerpt}
                                            </p>
                                        )}

                                        <div className="post-meta">
                                            <span className="post-author">
                                                {post.author || 'Autor desconhecido'}
                                            </span>
                                            <span className="post-date">
                                                {post.createdAt ? new Date(post.createdAt).toLocaleDateString('pt-BR') : 'Data desconhecida'}
                                            </span>
                                        </div>
                                        <Link to={`/post/${post.id}`} className="read-more-button"
                                              aria-label={`Continuar lendo ${post.title}`}>
                                            Continuar lendo
                                        </Link>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}

                {loading && page > 0 && (
                    <div className="loading-more" role="status" aria-live="polite">
                        <span className="spinner" aria-label="Carregando"/> Carregando mais artigos...
                    </div>
                )}
            </section>

            <section className="newsletter">
                <div className="newsletter-container">
                    <h3>Receba as novidades por e-mail</h3>
                    <p>Inscreva-se para receber atualizações de novos conteúdos</p>
                    <form
                        className="subscribe-form"
                        onSubmit={e => {
                            e.preventDefault();
                            alert('Inscrição enviada!');
                        }}
                    >
                        <input type="email" placeholder="Seu e-mail" required aria-label="Seu e-mail"/>
                        <button type="submit" className="subscribe-button" aria-label="Inscrever-se">
                            Inscrever-se
                        </button>
                    </form>
                </div>
            </section>
        </div>
    );
}

export default BlogHome;