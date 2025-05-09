import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/UI/theme';
import Error404 from './components/UI/Error/Error404UI';
import './App.css';


const AppContent: React.FC = () => {
  return (
    <div className="app-container">
      <div className="main-content">
        <Routes>
          {/* <Route index element={<MainMenu />} />
          <Route path="registration" element={<Registration />} />
          <Route path="login" element={<Login />} />
          <Route path="forgot-password" element={<ForgotPassword />} /> */}
          <Route path="*" element={<Error404 />} />
        </Routes>
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