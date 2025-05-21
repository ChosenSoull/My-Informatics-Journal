import React from 'react';
import './Offline.css';

const OfflinePage: React.FC = () => {
  return (
    <div className="offline-page">
      <h1>Підключіться до мережі</h1>
      <button onClick={() => window.location.reload()}>Спробувати знову</button>
    </div>
  );
};

export default OfflinePage;