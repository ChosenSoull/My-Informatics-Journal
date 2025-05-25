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
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/UI/theme';
import Error404 from './components/UI/Error/Error404';
import OfflinePage from './components/UI/Error/Offline';
import Loading from './components/UI/Loading/Loading';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './App.css';

const MainMenu = lazy(() => import('./components/UI/MainMenu/MainMenu'));
const Registration = lazy(() => import('./components/UI/Registration/Registration'));
const Login = lazy(() => import('./components/UI/Login/Login'));
const ForgotPassword = lazy(() => import('./components/UI/ForgotPassword/ForgotPassword'));

const AppContent: React.FC = () => {
  return (
    <div className="app-container">
      <div className="main-content">
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route index element={<MainMenu />} />
            <Route path="registration" element={<Registration />} />
            <Route path="login" element={<Login />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="offline" element={<OfflinePage />} />
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