import React, { Suspense } from 'react'; {/*, lazy*/}
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/UI/theme';
import Error404 from './components/UI/Error/Error404';
import OfflinePage from './components/UI/Error/offline';
import './App.css';

{/*const MainMenu = lazy(() => import('./components/MainMenu'));
const Registration = lazy(() => import('./components/Registration'));
const Login = lazy(() => import('./components/Login'));
const ForgotPassword = lazy(() => import('./components/ForgotPassword')); */}

const AppContent: React.FC = () => {
  return (
    <div className="app-container">
      <div className="main-content">
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
           {/*} <Route index element={<MainMenu />} />
            <Route path="registration" element={<Registration />} />
            <Route path="login" element={<Login />} />
            <Route path="forgot-password" element={<ForgotPassword />} /> */}
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