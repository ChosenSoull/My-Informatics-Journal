import React from 'react';
import './Loading.css'; // Создайте этот CSS файл

const Loading: React.FC = () => {
  return (
    <div className="loader-container">
      <div className="loader4"></div>
      <div className="loading-text-container">
        <span className="loading-text">З</span>
        <span className="loading-text">а</span>
        <span className="loading-text">в</span>
        <span className="loading-text">а</span>
        <span className="loading-text">н</span>
        <span className="loading-text">т</span>
        <span className="loading-text">а</span>
        <span className="loading-text">ж</span>
        <span className="loading-text">е</span>
        <span className="loading-text">н</span>
        <span className="loading-text">н</span>
        <span className="loading-text">я</span>
        <span className="loading-text">.</span>
        <span className="loading-text">.</span>
        <span className="loading-text">.</span>
      </div>
    </div>
  );
};

export default Loading;