import React, { createContext, useContext } from 'react';
import { useTheme as useThemeHook } from '../hooks/useTheme';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
    const themeData = useThemeHook();

    return (
        <ThemeContext.Provider value={themeData}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
    }
    return context;
};