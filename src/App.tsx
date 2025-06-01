/*
 / My-Informatics-Journal - A project from Informatics class on 05/09/2025
 / Copyright (C) 2025 ChosenSoul
 /
 / This program is free software: you can redistribute it and/or modify
 / it under the terms of the GNU General Public License as published by
 / the Free Software Foundation, either version 3 of the License, or
 / (at your option) any later version.

 / This program is distributed in the hope that it will be useful,
 / but WITHOUT ANY WARRANTY; without even the implied warranty of
 / MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 / GNU General Public License for more details.

 / You should have received a copy of the GNU General Public License
 / along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ThemeProvider } from './components/UI/theme';
import Error404 from './components/UI/Error/Error404';
import OfflinePage from './components/UI/Error/Offline';
import Loading from './components/UI/Loading/Loading';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './i18n';
import './App.css';

const MainMenu = lazy(() => import('./components/UI/MainMenu/MainMenu'));
const Registration = lazy(() => import('./components/UI/Registration/Registration'));
const Login = lazy(() => import('./components/UI/Login/Login'));
const ForgotPassword = lazy(() => import('./components/UI/ForgotPassword/ForgotPassword'));

const LanguageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { lang } = useParams<{ lang: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation();
  const LANGUAGE_STORAGE_KEY = 'selectedLanguage';
  const [hasLanguageChanged, setHasLanguageChanged] = useState(false);

  useEffect(() => {
    const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    const validLanguages = ['ru', 'uk', 'en'];
    const defaultLang = 'uk';

    if (storedLanguage && storedLanguage !== lang && !hasLanguageChanged) {
      const path = location.pathname.split('/').slice(2).join('/') || '';
      navigate(`/${storedLanguage}/${path}`, { replace: true });
      setHasLanguageChanged(true);
      return;
    }

    if (!lang || !validLanguages.includes(lang)) {
      const path = location.pathname.split('/').slice(2).join('/') || '';
      navigate(`/${defaultLang}/${path}`, { replace: true });
      localStorage.setItem(LANGUAGE_STORAGE_KEY, defaultLang);
    } else {
      if (i18n.language !== lang) {
        i18n.changeLanguage(lang);
        localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      }
    }
  }, [lang, location.pathname, navigate, i18n, hasLanguageChanged]);

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  return (
    <div className="app-container">
      <div className="main-content">
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/:lang">
              <Route
                index
                element={
                  <LanguageWrapper>
                    <MainMenu />
                  </LanguageWrapper>
                }
              />
              <Route
                path="registration"
                element={
                  <LanguageWrapper>
                    <Registration />
                  </LanguageWrapper>
                }
              />
              <Route
                path="login"
                element={
                  <LanguageWrapper>
                    <Login />
                  </LanguageWrapper>
                }
              />
              <Route
                path="forgot-password"
                element={
                  <LanguageWrapper>
                    <ForgotPassword />
                  </LanguageWrapper>
                }
              />
              <Route
                path="offline"
                element={
                  <LanguageWrapper>
                    <OfflinePage />
                  </LanguageWrapper>
                }
              />
              <Route path="*" element={<Error404 />} />
            </Route>
            <Route path="/" element={<Navigate to="/uk" replace />} />
            <Route path="*" element={<Error404 />} />
          </Routes>
        </Suspense>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  if (!clientId) {
    return <div>Помилка: Google Client ID не налаштовано.</div>;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <ThemeProvider>
        <Router>
          <AppContent />
        </Router>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
};

export default App;