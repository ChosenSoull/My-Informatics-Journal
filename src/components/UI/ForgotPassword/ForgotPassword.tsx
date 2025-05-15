import React, { useState, useContext } from 'react';
import { ThemeContext } from '../theme'; // Убедись, что путь к ThemeContext верен
import './ForgotPassword.css';

const ForgotPassword: React.FC = () => {
  // Получаем текущую тему из контекста
  const { theme } = useContext(ThemeContext);

  const [email, setEmail] = useState('');

  const containerBackground = theme === 'light'
    ? '/assets/page-bg-light.png' // Путь для светлой темы
    : '/assets/page-bg-dark.png'; // Путь для темной темы

  return (
    <div className="container-ForgotPassword" style={{backgroundImage: `url('${containerBackground}')`}}>
      <div className="position-container-ForgotPassword">
        <div className="form-container-ForgotPassword">
          <h2>Відновлення пароля</h2>
          {/* Кнопка Google */}
          <button className="google-ForgotPassword">
            <img src={theme === 'light' ? '/assets/google-dark-icon.png' : '/assets/google-white-icon.png'} alt="Google icon" className="google-icon"/>
            Відновити за допомогою Google
          </button>
          <div className="form-group">
            <input
              type="email"
              placeholder="Електронна пошта"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
            />
          </div>
          <button className="ForgotPassword-button">Надіслати посилання</button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;