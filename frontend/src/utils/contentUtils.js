import DOMPurify from "dompurify";

/**
 * Verifica se uma ‘string’ é um JSON válido
 * @param {string} str - ‘String’ a ser verificada
 * @returns {boolean} - Verdadeiro se for JSON válido, falso caso contrário
 */
export const isJsonString = (str) => {
    try {
        if (typeof str !== 'string') return false;
        JSON.parse(str);
        return true;
    } catch (_) {
        return false;
    }
};

/**
 * Converte conteúdo do formato EditorJS para HTML
 * @param {object|string} content - Conteúdo em formato EditorJS ou string HTML
 * @returns {string} - Conteúdo convertido para HTML
 */
export const contentToHtml = (content) => {
    if (!content) return '';

    let parsedContent;
    try {
        parsedContent = typeof content === 'string'
            ? isJsonString(content) ? JSON.parse(content) : {blocks: []}
            : content;
    } catch (_) {
        const htmlContent = typeof content === 'string' ? content : '';
        return DOMPurify.sanitize(htmlContent).replace(/\n/g, '<br>');
    }

    if (typeof content === 'string' && !isJsonString(content)) {
        return DOMPurify.sanitize(content).replace(/\n/g, '<br>');
    }

    if (!parsedContent || !parsedContent.blocks) return '';

    let html = '';
    parsedContent.blocks.forEach(block => {
        switch (block.type) {
            case 'header': {
                const level = block.data.level || 2;
                html += `<h${level}>${block.data.text}</h${level}>`;
                break;
            }
            case 'paragraph':
                html += `<p>${block.data.text}</p>`;
                break;
            case 'list': {
                const listType = block.data.style === 'ordered' ? 'ol' : 'ul';
                html += `<${listType}>`;
                block.data.items.forEach(item => {
                    html += `<li>${item}</li>`;
                });
                html += `</${listType}>`;
                break;
            }
            case 'image':
                html += `<figure class="image-block">
                  <img src="${block.data.file?.url || block.data.url}" alt="${block.data.caption || ''}" />
                  ${block.data.caption ? `<figcaption>${block.data.caption}</figcaption>` : ''}
                </figure>`;
                break;
            case 'code':
                html += `<pre><code>${block.data.code}</code></pre>`;
                break;
            case 'quote':
                html += `<blockquote>
                  <p>${block.data.text}</p>
                  ${block.data.caption ? `<footer>${block.data.caption}</footer>` : ''}
                </blockquote>`;
                break;
            case 'link':
                html += `<a href="${block.data.link}" target="_blank" rel="noopener noreferrer">
                  ${block.data.meta?.title || block.data.link}
                </a>`;
                break;
            default:
                if (block.data && block.data.text) {
                    html += `<p>${block.data.text}</p>`;
                }
        }
    });

    return DOMPurify.sanitize(html);
};

/**
 * Extrai texto simples do conteúdo (JSON ou HTML)
 * @param {object|string} content - Conteúdo em formato EditorJS ou string HTML
 * @param {number} maxLength - Comprimento máximo do texto extraído
 * @returns {string} - Texto simples extraído
 */
export const extractPlainText = (content, maxLength = 150) => {
    if (!content) return '';

    let plainText = '';

    try {
        let jsonContent;
        if (typeof content === 'string') {
            jsonContent = isJsonString(content) ? JSON.parse(content) : null;
        } else {
            jsonContent = content;
        }

        if (jsonContent && jsonContent.blocks) {
            jsonContent.blocks.forEach(block => {
                switch (block.type) {
                    case 'header':
                    case 'paragraph':
                        plainText += block.data.text + ' ';
                        break;
                    case 'list':
                        block.data.items.forEach(item => {
                            plainText += item + ' ';
                        });
                        break;
                    case 'quote':
                        plainText += block.data.text + ' ';
                        if (block.data.caption) {
                            plainText += '— ' + block.data.caption + ' ';
                        }
                        break;
                }
            });
        } else if (typeof content === 'string') {
            const tmp = document.createElement("DIV");
            tmp.innerHTML = content;
            plainText = tmp.textContent || tmp.innerText || "";
        }
    } catch (_) {
        if (typeof content === 'string') {
            return content.substring(0, maxLength) + (content.length > maxLength ? '...' : '');
        }
        return '';
    }

    plainText = plainText.trim().replace(/\s+/g, ' ');
    return plainText.substring(0, maxLength) + (plainText.length > maxLength ? '...' : '');
};

/**
 * Extrai informações de vídeo do YouTube do conteúdo
 * @param {object|string} content - Conteúdo em formato EditorJS ou string HTML
 * @returns {object} - Objeto com ‘flag’ hasVideo, videoId e content processado
 */
export const extractYoutubeVideo = (content) => {
    if (!content) return {hasVideo: false, content: ''};

    const plainText = extractPlainText(content, 1000);
    const youtubeRegex = /(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const youtubeMatch = plainText.match(youtubeRegex);

    if (youtubeMatch && youtubeMatch[4]) {
        const cleanedContent = plainText.replace(youtubeRegex, '').trim();
        return {
            hasVideo: true,
            videoId: youtubeMatch[4],
            content: cleanedContent
        };
    }

    return {
        hasVideo: false,
        content: plainText
    };
};

/**
 * Converte links do YouTube para iframes embutidos
 * @param {string} htmlContent - Conteúdo HTML
 * @returns {string} - HTML com links do YouTube convertidos em iframes
 */

export const embedYoutubeLinks = (htmlContent) => {
    if (!htmlContent) return '';

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = DOMPurify.sanitize(htmlContent);

    const youtubeLinks = tempDiv.querySelectorAll('a[href*="youtube.com/watch"], a[href*="youtu.be/"]');

    youtubeLinks.forEach(link => {
        const href = link.getAttribute('href');
        let videoId;

        if (href.includes('youtube.com/watch')) {
            try {
                const url = new URL(href);
                videoId = url.searchParams.get('v');
            } catch (error) {
                console.error('URL inválida:', href);
                return;
            }
        } else if (href.includes('youtu.be/')) {
            videoId = href.split('youtu.be/')[1]?.split(/[?#]/)[0];
        }

        if (videoId) {
            const videoContainer = document.createElement('div');
            videoContainer.className = 'video-container';

            const iframe = document.createElement('iframe');
            iframe.src = `https://www.youtube.com/embed/${videoId}`;
            iframe.setAttribute('frameborder', '0');
            iframe.setAttribute('allowfullscreen', 'true');
            iframe.setAttribute('title', 'YouTube Video');
            iframe.setAttribute('loading', 'lazy');

            videoContainer.appendChild(iframe);

            if (link.parentNode) {
                link.parentNode.replaceChild(videoContainer, link);
            }
        }
    });

    return tempDiv.innerHTML;
};

/**
 * Converte links de texto para âncoras HTML clicáveis
 * @param {string} html - Conteúdo HTML
 * @returns {string} - HTML com links clicáveis
 */
export const convertUrlsToLinks = (html) => {
    if (!html) return '';

    const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;

    return html.replace(urlRegex, (url) => {
        const isInAnchor = /<a[^>]*>.*?<\/a>/i.test(url);
        if (isInAnchor) return url;

        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });
};

export const processFullContent = (content) => {
    if (!content) return '';

    let html = contentToHtml(content);
    html = convertUrlsToLinks(html);
    html = embedYoutubeLinks(html);

    return html;
};