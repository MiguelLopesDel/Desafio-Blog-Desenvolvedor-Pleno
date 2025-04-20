import api from './api';

/**
 * Cria um novo post.
 * @param {Object} postData
 * @returns {Promise<Object>}
 */
export const createPost = async (postData) => {
    try {
        const payload = { ...postData };
        if (payload.content && typeof payload.content !== 'string') {
            payload.content = JSON.stringify(payload.content);
        }

        const { data } = await api.post('/posts', payload);
        return data;
    } catch (error) {
        console.error('Erro ao criar post:', error);
        throw new Error('Falha ao criar post. Tente novamente.');
    }
};

/**
 * Busca um post pelo ID.
 * @param {string} id
 * @returns {Promise<Object>}
 */
export const getPostById = async (id) => {
    if (!id) throw new Error('ID de post é obrigatório');
    try {
        const { data } = await api.get(`/posts/${id}`);
        return data;
    } catch (error) {
        console.error(`Erro ao buscar post com ID ${id}:`, error);
        throw new Error('Falha ao buscar post. Verifique o ID e tente novamente.');
    }
};