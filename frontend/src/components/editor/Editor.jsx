import React, {useEffect, useRef, useState} from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Image from '@editorjs/image';
import Link from '@editorjs/link';
import Code from '@editorjs/code';
import Quote from '@editorjs/quote';
import '../../styles/editor.css';
import '../../styles/editorMenu.css';

const Editor = ({value, onChange, placeholder = 'Comece a escrever...'}) => {
    const editorInstance = useRef(null);
    const editorContainer = useRef(null);
    const [isEditorReady, setIsEditorReady] = useState(false);

    const initEditor = () => {
        if (!editorContainer.current) return null;

        editorContainer.current.innerHTML = '';

        let initialData = {blocks: []};
        if (value) {
            try {
                initialData = typeof value === 'object' && value !== null ? value :
                    (typeof value === 'string' ? JSON.parse(value) : {blocks: []});
            } catch (error) {
                console.error('Erro ao processar dados do editor:', error);
                initialData = {blocks: []};
            }
        }

        if (!initialData || !initialData.blocks || initialData.blocks.length === 0) {
            initialData = {
                blocks: [{
                    type: 'paragraph',
                    data: {
                        text: ''
                    }
                }]
            };
        }

        return new EditorJS({
            holder: editorContainer.current,
            tools: {
                header: {
                    class: Header,
                    config: {
                        levels: [1, 2, 3],
                        defaultLevel: 2
                    }
                },
                list: {
                    class: List,
                    inlineToolbar: true
                },
                image: Image,
                link: Link,
                code: Code,
                quote: Quote
            },
            data: initialData,
            placeholder: placeholder,
            autofocus: true,
            inlineToolbar: true,
            onReady: () => {
                if (typeof onChange === 'function') {
                    onChange(initialData);
                }
            },
            onChange: async (api) => {
                try {
                    const data = await api.saver.save();
                    if (typeof onChange === 'function') {
                        onChange(data);
                    }
                } catch (error) {
                    console.error('Erro ao salvar dados do editor:', error);
                }
            }
        });
    };

    useEffect(() => {
        const cleanupEditor = () => {
            if (editorInstance.current) {
                try {
                    editorInstance.current.destroy();
                } catch (e) {
                    console.error("Erro ao destruir o editor", e);
                }
                editorInstance.current = null;
            }
        };

        cleanupEditor();

        setTimeout(() => {
            editorInstance.current = initEditor();
            setIsEditorReady(true);
        }, 50);

        return cleanupEditor;
    }, []);

    const handleContainerClick = (e) => {
        if (!editorInstance.current || !isEditorReady) return;

        if (e.target.classList.contains('markdown-editor') ||
            e.target.classList.contains('editor-container')) {
            const lastBlock = document.querySelector('.ce-block:last-child');
            if (lastBlock) {
                const contentElement = lastBlock.querySelector('[contenteditable=true]');
                if (contentElement) {
                    contentElement.focus();
                }
            } else {
                try {
                    editorInstance.current.blocks.insert('paragraph');
                } catch (e) {
                    console.error("Erro ao inserir bloco:", e);
                }
            }
        }
    };

    return (
        <div className="markdown-editor">
            <div
                ref={editorContainer}
                className="editor-container"
                onClick={handleContainerClick}
            ></div>
        </div>
    );
};

export default Editor;