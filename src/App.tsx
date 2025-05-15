import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/UI/theme';
import Error404 from './components/UI/Error/Error404';
import OfflinePage from './components/UI/Error/Offline';
import Loading from './components/UI/Loading/Loading';
import './App.css';

const MainMenu = lazy(() => import('./components/UI/MainMenu/MainMenu'));
const Registration = lazy(() => import('./components/UI/Registration/Registration'));
const Login = lazy(() => import('./components/UI/Login/Login'));
const ForgotPassword = lazy(() => import('./components/UI/ForgotPassword/ForgotPassword'));

const AppContent: React.FC = () => {
  return (
    <div className="app-container">
      <div className="main-content">
        <Suspense fallback={<Loading/>}>
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
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
};

export default App;