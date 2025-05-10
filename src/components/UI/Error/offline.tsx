// src/components/UI/OfflinePage.tsx
import React from 'react';
import './offline.css';

const OfflinePage: React.FC = () => {
  return (
    <div className="offline-page">
      <h1>Подключитесь к сети</h1>
      <button onClick={() => window.location.reload()}>Попробовать снова</button>
    </div>
  );
};

export default OfflinePage;