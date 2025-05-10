import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Error404.css';

const Error404Page: React.FC = () => {
  const navigate = useNavigate();

  const handleBackToMain = () => {
    navigate('/');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="error-404-container"
    >
      <div className="error-404-content">
        <h1 className="error-404-title">404</h1>
        <p className="error-404-text">Сторінку не знайдено</p>
        <p className="error-404-description">
          Ресурс, який ви шукаєте, не існує або був видалений.
        </p>
        <button
          onClick={handleBackToMain}
          className="error-404-button"
        >
          Повернутися на головну
        </button>
      </div>
    </motion.div>
  );
};

export default Error404Page;
