import {useState, useEffect} from 'react';
import {useParams, Link} from 'react-router-dom';
import api from '../services/api';
import BlogSidebar from '../components/blog/BlogSidebar';
import '../styles/postView.css';
import {processFullContent} from '../utils/contentUtils';

function PostView() {
    const {id} = useParams();
    const [post, setPost] = useState(null);
    const [processedContent, setProcessedContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;
        const fetchPost = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await api.get(`/posts/${id}`);

                if (!mounted) return;
                setPost(response.data);

                if (response.data && response.data.content) {
                    const htmlContent = processFullContent(response.data.content);
                    setProcessedContent(htmlContent);
                }

            } catch (err) {
                if (mounted) {
                    console.error("Erro ao carregar o post:", err);
                    setError("Não foi possível carregar o post. Por favor, tente novamente mais tarde.");
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchPost();

        return () => {
            mounted = false
        };
    }, [id]);

    if (loading) {
        return (
            <div className="loading" role="status" aria-live="polite">
                <span className="spinner" aria-label="Carregando"></span>
                Carregando post...
            </div>
        );
    }

    if (error) {
        return <div className="error-message" role="alert">{error}</div>;
    }

    if (!post) {
        return <div className="error-message" role="alert">Post não encontrado.</div>;
    }

    return (
        <div className="post-view-container">
            <div className="post-content-area">
                <article className="post-full">
                    <header className="post-header">
                        <h1>{post.title}</h1>
                        <div className="post-meta">
                            <span className="post-author">
                                Por {post.author ? post.author : 'Autor desconhecido'}
                            </span>
                            <span className="post-date">
                                {new Date(post.createdAt).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                })}
                            </span>
                            {post.views !== undefined &&
                                <span className="post-views">
                                    <i className="view-icon" aria-label="Visualizações">👁</i> {post.views}
                                </span>
                            }
                        </div>
                        {post.tags?.length > 0 && (
                            <ul className="post-tags" aria-label="Tags">
                                {post.tags.map((tag, index) => (
                                    <li className="tag" key={index}>{tag}</li>
                                ))}
                            </ul>
                        )}
                    </header>

                    <div className="post-body markdown-content">
                        <div dangerouslySetInnerHTML={{__html: processedContent}}/>
                    </div>

                    <footer className="post-footer">
                        <Link to="/blog" className="back-button">
                            ← Voltar para o blog
                        </Link>
                    </footer>
                </article>
            </div>
            <BlogSidebar/>
        </div>
    );
}

export default PostView;