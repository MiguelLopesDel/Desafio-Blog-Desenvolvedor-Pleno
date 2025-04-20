import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPostById } from '../../services/postService';
import api from '../../services/api';
import Editor from '../editor/Editor';
import '../../styles/postForm.css';

const EditPost = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        content: null,
        tags: ''
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    function parsePostContent(rawContent) {
        if (typeof rawContent === 'string') {
            try {
                return JSON.parse(rawContent);
            } catch (e) {
                console.error('Falha ao parsear conteúdo:', e);
                return { blocks: [] };
            }
        }
        return rawContent || { blocks: [] };
    }

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const post = await getPostById(id);

                let parsedContent = parsePostContent(post.content)

                setFormData({
                    title: post.title,
                    content: parsedContent,
                    tags: post.tags ? post.tags.join(', ') : ''
                });
            } catch (err) {
                setError('Erro ao carregar o post. Tente novamente.');
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleContentChange = (editorData) => {
        setFormData(prev => ({
            ...prev,
            content: editorData
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.content ||
            !formData.content.blocks || formData.content.blocks.length === 0) {
            setError('Título e conteúdo são obrigatórios.');
            return;
        }

        try {
            setSubmitting(true);
            const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);

            await api.put(`/posts/${id}`, {
                title: formData.title,
                content: JSON.stringify(formData.content),
                tags: tagsArray
            });

            navigate('/dashboard');
        } catch (err) {
            setError('Erro ao atualizar o post. Tente novamente.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="loading">Carregando...</div>;

    return (
        <div className="post-form-container">
            <h1>Editar Post</h1>

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
                        value={formData.title}
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
                        value={formData.tags}
                        onChange={handleChange}
                        placeholder="react, javascript, tutorial"
                    />
                </div>

                <div className="input-group editor-group">
                    <label htmlFor="content">Conteúdo</label>
                    <Editor
                        value={formData.content}
                        onChange={handleContentChange}
                    />
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        className="cancel-button"
                        disabled={submitting}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="submit-button"
                    >
                        {submitting ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditPost;