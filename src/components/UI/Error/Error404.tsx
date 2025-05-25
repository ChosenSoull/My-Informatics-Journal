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
