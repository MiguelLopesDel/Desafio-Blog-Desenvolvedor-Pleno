import {useState, useEffect} from 'react'
import {useNavigate} from "react-router-dom";
import Editor from '../editor/Editor.jsx'
import {createPost} from "../../services/postService.js";
import '../../styles/createPost.css'

function CreatePost() {
    const [post, setPost] = useState({
        title: '',
        content: {blocks: []},
        tags: '',
        isPrivate: false
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    function isContentValid(content) {
        return (
            content &&
            content.blocks &&
            content.blocks.some((block) =>
                block.data &&
                ((block.data.text && block.data.text.trim()) || block.type !== 'paragraph')
            )
        );
    }

    useEffect(() => {
        console.log("Estado atual do content:", post.content);
    }, [post.content]);

    const handlePrivacyToggle = () => {
        setPost(prev => ({
            ...prev,
            isPrivate: !prev.isPrivate
        }));
    };

    const handleContentChange = (editorData) => {
        console.log("Editor data recebido:", editorData);
        setPost(prevPost => ({...prevPost, content: editorData}));
    }

    const handleChange = (e) => {
        const {id, value} = e.target;
        setPost(prevPost => ({...prevPost, [id]: value}));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!post.title.trim()) {
            setError('O título é obrigatório.');
            return;
        }

        if (!isContentValid(post.content)) {
            setError('Por favor, adicione conteúdo ao seu post.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const tagsArray = post.tags
                ? post.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
                : [];

            await createPost({
                title: post.title,
                content: post.content,
                tags: tagsArray,
                isPrivate: post.isPrivate
            });
            navigate('/profile');
        } catch (error) {
            console.error("Erro ao criar post:", error);
            setError('Falha ao criar post. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-post-container">
            <h1>Criar Novo Post</h1>

            {error && (
                <div className="error-message">
                    <span>{error}</span>
                    <button
                        type="button"
                        onClick={() => setError('')}
                        className="error-close"
                    >
                        &times;
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="post-form">
                <div className="input-group">
                    <label htmlFor="title">Título</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={post.title}
                        onChange={handleChange}
                        placeholder="Digite o título do seu post"
                        required
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="tags">Tags (separadas por vírgula)</label>
                    <input
                        type="text"
                        id="tags"
                        name="tags"
                        value={post.tags}
                        onChange={handleChange}
                        placeholder="react, javascript, tutorial"
                    />
                </div>

                <div className="input-group editor-group">
                    <label htmlFor="content">Conteúdo</label>
                    <Editor
                        value={post.content}
                        onChange={handleContentChange}
                    />
                </div>
                <div className="privacy-control">
                    <label className="privacy-label">
                        <input
                            type="checkbox"
                            checked={post.isPrivate}
                            onChange={handlePrivacyToggle}
                            className="privacy-checkbox"
                        />
                        <span className="privacy-text">
            {post.isPrivate ? 'Post Privado (apenas você pode ver)' : 'Post Público (visível para todos)'}
                        </span>
                    </label>
                </div>
                <div className="form-actions">
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        className="cancel-button"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="submit-button"
                    >
                        {loading ? 'Publicando...' : 'Publicar'}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default CreatePost