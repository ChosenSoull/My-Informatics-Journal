import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import updateFavicon from '../favicon';

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
  const [isActive, setIsActive] = useState(true);

  // Функция для переключения темы
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    updateFavicon(isActive, newTheme); // передаем isActive
  };

  // Следим за изменениями настроек браузера
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const systemTheme = mediaQuery.matches ? 'dark' : 'light';
      setTheme(systemTheme);
      updateFavicon(isActive, systemTheme);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [isActive]);

  // Применяем класс темы к корневому элементу
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    updateFavicon(isActive, theme);
  }, [theme, isActive]);

  // Используем Page Visibility API для отслеживания активности страницы
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsActive(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};