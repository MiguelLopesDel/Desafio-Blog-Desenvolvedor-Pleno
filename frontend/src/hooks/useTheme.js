import {useState, useEffect} from 'react';

const VALID_THEMES = ['light', 'dark', 'system'];

const getSystemTheme = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const useTheme = () => {
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return VALID_THEMES.includes(savedTheme) ? savedTheme : 'system';
    });

    useEffect(() => {
        const currentTheme = theme === 'system' ? getSystemTheme() : theme;
        document.documentElement.setAttribute('data-theme', currentTheme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        if (theme !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            document.documentElement.setAttribute('data-theme', getSystemTheme());
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => {
            if (prevTheme === 'light') return 'dark';
            if (prevTheme === 'dark') return 'system';
            return 'light';
        });
    };

    const setSpecificTheme = (newTheme) => {
        if (VALID_THEMES.includes(newTheme)) {
            setTheme(newTheme);
        }
    };

    return {
        theme,
        toggleTheme,
        setTheme: setSpecificTheme,
        currentTheme: theme === 'system' ? getSystemTheme() : theme
    };
};