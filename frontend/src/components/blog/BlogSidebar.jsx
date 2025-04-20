import {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';
import api from '../../services/api';
import '../../styles/blogSidebar.css';

const PostSkeleton = () => (
    <div className="skeleton-container">
        {[1, 2, 3, 4, 5].map(item => (
            <div key={item} className="skeleton-item">
                <div className="skeleton-line skeleton-title"></div>
                <div className="skeleton-line skeleton-date"></div>
            </div>
        ))}
    </div>
);

const RecentPostsSection = ({ loading, error, recentPosts }) => (
    <div className="sidebar-section">
        <h3 className="sidebar-title">Posts Recentes</h3>
        {loading ? (
            <PostSkeleton />
        ) : error ? (
            <p className="error-text">{error}</p>
        ) : recentPosts.length > 0 ? (
            <ul className="recent-posts-list">
                {recentPosts.map(post => (
                    <li key={post.id} className="recent-post-item">
                        <Link to={`/post/${post.id}`} className="recent-post-link" aria-label={`Leia mais sobre ${post.title}`}>
                            {post.title}
                            <span className="post-date">
                                {formatDate(post.createdAt)}
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        ) : (
            <p>Nenhum post encontrado.</p>
        )}
    </div>
);

const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(new Date(dateString));
};

const BlogSidebar = () => {
    const [recentPosts, setRecentPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const postsResponse = await api.get('/posts?page=0&size=5');
                setRecentPosts(postsResponse.data.content || []);
                setLoading(false);
            } catch (err) {
                console.error("Erro ao buscar dados:", err);
                setError("Não foi possível carregar os dados.");
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <aside className="blog-sidebar">
            <RecentPostsSection loading={loading} error={error} recentPosts={recentPosts} />

            <div className="sidebar-section">
                <h3 className="sidebar-title">Sobre o Blog</h3>
                <div className="about-blog">
                    <p>
                        Bem-vindo ao Blogify, uma plataforma onde cada usuário pode criar e
                        compartilhar seu próprio conteúdo sobre diversos temas.
                    </p>
                </div>
            </div>
        </aside>
    );
};

export default BlogSidebar;