import { useTheme } from '../../contexts/ThemeContext';
import '../../styles/themeToggle.css';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    const getThemeIcon = () => {
        switch (theme) {
            case 'light': return '☀️';
            case 'dark': return '🌙';
            case 'system': return '⚙️';
            default: return '⚙️';
        }
    };

    return (
        <div className="theme-toggle">
            <button onClick={toggleTheme} aria-label="Alternar tema">
                {getThemeIcon()}
            </button>
        </div>
    );
};

export default ThemeToggle;