import {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';
import api from '../services/api';
import '../styles/global.css';
import {extractPlainText} from '../utils/contentUtils';

function AdminDashboard() {
    const [posts, setPosts] = useState({
        content: [],
        totalPages: 0,
        totalElements: 0,
        number: 0,
        size: 10,
        first: true,
        last: false
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('posts');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPosts, setSelectedPosts] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [bulkAction, setBulkAction] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        fetchPosts();
    }, [currentPage, pageSize]);

    useEffect(() => {
        if (selectAll) {
            setSelectedPosts(filteredPosts.map(post => post.id));
        } else if (selectedPosts.length === filteredPosts.length) {
            setSelectedPosts([]);
        }
    }, [selectAll]);

    const fetchPosts = async (resetPage = false) => {
        try {
            setLoading(true);
            const pageToFetch = resetPage ? 0 : currentPage;
            const response = await api.get(`/posts/all?page=${pageToFetch}&size=${pageSize}`);
            setPosts(response.data);
            setCurrentPage(pageToFetch);
        } catch (err) {
            setError("Erro ao carregar posts. Por favor, tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este post?')) {
            try {
                await api.delete(`/posts/${id}`);
                if (posts.content.length === 1 && currentPage > 0) {
                    setCurrentPage(currentPage - 1);
                } else {
                    await fetchPosts();
                }
            } catch (err) {
                setError("Não foi possível excluir o post. Tente novamente mais tarde.");
            }
        }
    };

    const handleBulkDelete = async () => {
        if (selectedPosts.length === 0) return;

        if (window.confirm(`Tem certeza que deseja excluir ${selectedPosts.length} posts?`)) {
            try {
                const deletePromises = selectedPosts.map(id => api.delete(`/posts/${id}`));
                await Promise.all(deletePromises);
                setPosts(posts.filter(post => !selectedPosts.includes(post.id)));
                setSelectedPosts([]);
                setSelectAll(false);
            } catch (err) {
                console.error("Erro ao excluir posts em massa:", err);
                setError("Não foi possível excluir alguns posts. Tente novamente.");
            }
        }
    };

    const handleSelectPost = (postId) => {
        setSelectedPosts(prev => {
            if (prev.includes(postId)) {
                return prev.filter(id => id !== postId);
            } else {
                return [...prev, postId];
            }
        });
    };

    const handleToggleSelectAll = () => {
        setSelectAll(!selectAll);
    };

    const handleBulkAction = () => {
        if (bulkAction === 'delete') {
            handleBulkDelete();
        }
        setBulkAction('');
    };

    const filteredPosts = posts && posts.content
        ? (searchTerm
            ? posts.content.filter(post =>
                post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (post.content && extractPlainText(post.content, 50).toLowerCase().includes(searchTerm.toLowerCase()))
            )
            : posts.content)
        : [];

    if (loading) return <div className="loading">Carregando dados do painel...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <h1>Painel Administrativo do Blog</h1>
                <div className="dashboard-actions">
                    <Link to="/create-post" className="btn-primary">
                        Novo Post
                    </Link>
                </div>
            </div>

            <div className="dashboard-tabs">
                <button
                    className={`tab-button ${activeTab === 'posts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('posts')}
                >
                    Posts
                </button>
                <button
                    className={`tab-button ${activeTab === 'statistics' ? 'active' : ''}`}
                    onClick={() => setActiveTab('statistics')}
                >
                    Estatísticas
                </button>
            </div>

            {activeTab === 'posts' && (
                <div className="tab-content">
                    <div className="posts-controls">
                        <div className="search-bar">
                            <input
                                type="text"
                                placeholder="Buscar posts..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>

                        {selectedPosts.length > 0 && (
                            <div className="bulk-actions">
                                <select
                                    value={bulkAction}
                                    onChange={(e) => setBulkAction(e.target.value)}
                                    className="bulk-select"
                                >
                                    <option value="">Ações em massa</option>
                                    <option value="delete">Excluir selecionados</option>
                                </select>
                                <button
                                    onClick={handleBulkAction}
                                    disabled={!bulkAction}
                                    className="btn-secondary"
                                >
                                    Aplicar
                                </button>
                                <span className="selected-count">
                                    {selectedPosts.length} {selectedPosts.length === 1 ? 'post selecionado' : 'posts selecionados'}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="posts-list">
                        <h2>Gerenciar Posts</h2>
                        {filteredPosts.length === 0 ? (
                            <p>Nenhum post encontrado.</p>
                        ) : (
                            <>
                                <div className="table-responsive">
                                    <table className="posts-table">
                                        <thead>
                                        <tr>
                                            <th className="checkbox-column">
                                                <input
                                                    type="checkbox"
                                                    checked={selectAll}
                                                    onChange={handleToggleSelectAll}
                                                />
                                            </th>
                                            <th>Título</th>
                                            <th>Conteúdo</th>
                                            <th>Publicação</th>
                                            <th>Status</th>
                                            <th>Ações</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {filteredPosts.map((post) => (
                                            <tr key={post.id}
                                                className={selectedPosts.includes(post.id) ? 'selected-row' : ''}>
                                                <td>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedPosts.includes(post.id)}
                                                        onChange={() => handleSelectPost(post.id)}
                                                    />
                                                </td>
                                                <td className="title-column">{post.title}</td>
                                                <td className="content-preview">
                                                    {post.content && extractPlainText(post.content, 50)}
                                                </td>
                                                <td>{new Date(post.createdAt).toLocaleDateString('pt-BR')}</td>
                                                <td>
                                                <span
                                                    className={`status-badge ${post.isPrivate ? 'private' : 'public'}`}>
                                                    {post.isPrivate ? 'Privado' : 'Público'}
                                                </span>
                                                </td>
                                                <td className="actions">
                                                    <Link to={`/post/${post.id}`} className="action-btn view-btn">
                                                        Ver
                                                    </Link>
                                                    <Link to={`/edit-post/${post.id}`} className="action-btn edit-btn">
                                                        Editar
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(post.id)}
                                                        className="action-btn delete-btn"
                                                    >
                                                        Excluir
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="pagination">
                                    <button onClick={() => setCurrentPage(0)} disabled={posts.first}>&laquo;</button>
                                    <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))} disabled={posts.first}>&lt;</button>
                                    <span>Página {posts.number + 1} de {posts.totalPages}</span>
                                    <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, posts.totalPages - 1))} disabled={posts.last}>&gt;</button>
                                    <button onClick={() => setCurrentPage(posts.totalPages - 1)} disabled={posts.last}>&raquo;</button>
                                    <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(0); }}>
                                        {[5,10,20,50].map(size => (<option key={size} value={size}>{size} por página</option>))}
                                    </select>
                                </div>
                            </>

                        )}
                    </div>
                </div>
            )}

            {activeTab === 'statistics' && (
                <div className="tab-content">
                    <div className="statistics-container">
                        <h2>Estatísticas do Blog</h2>

                        <div className="stats-cards">
                            <div className="stat-card">
                                <div className="stat-details">
                                    <h3>Total de Posts</h3>
                                    <p className="stat-value">{posts.totalElements || 0}</p>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-details">
                                    <h3>Posts Públicos</h3>
                                    <p className="stat-value">
                                        {posts.content ? posts.content.filter(post => !post.isPrivate).length : 0}
                                    </p>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-details">
                                    <h3>Posts Privados</h3>
                                    <p className="stat-value">
                                        {posts.content ? posts.content.filter(post => post.isPrivate).length : 0}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="recent-activity">
                            <h3>Posts Recentes</h3>
                            <ul className="activity-list">
                                {posts
                                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                    .slice(0, 5)
                                    .map(post => (
                                        <li key={post.id} className="activity-item">
                                            <span className="activity-title">{post.title}</span>
                                            <span className="activity-date">
                                                {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                                            </span>
                                        </li>
                                    ))
                                }
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;