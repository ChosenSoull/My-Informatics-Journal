import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import updateFavicon from '../favicon'; // Импортируйте функцию updateFavicon

// Типы для темы
type Theme = 'light' | 'dark';

// Интерфейс для контекста темы
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

// Создаем контекст с начальным значением
export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
});

// Провайдер темы
interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Определяем тему на основе настроек браузера
  const getInitialTheme = (): Theme => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  };

  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // Функция для переключения темы
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    updateFavicon(newTheme); // Вызывайте updateFavicon при каждой смене темы
  };

  // Следим за изменениями настроек браузера
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const systemTheme = mediaQuery.matches ? 'dark' : 'light';
      setTheme(systemTheme);
      updateFavicon(systemTheme); // И при изменении системных настроек
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Применяем класс темы к корневому элементу
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    updateFavicon(theme); // Вызывайте updateFavicon при начальной загрузке
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};