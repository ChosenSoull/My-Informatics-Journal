import React, { useState, useContext } from 'react';
import { ThemeContext } from '../theme'; // Убедись, что путь к ThemeContext верен
import './Registration.css';

const Registration: React.FC = () => {
  // Получаем текущую тему из контекста
  const { theme } = useContext(ThemeContext);

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');

  const checkPasswordStrength = (pass: string) => {
    if (pass.length === 0) return ''; // Не показывать ничего, если поле пустое
    if (pass.length < 8) return 'Слабкий (мінімум 8 символів)';
    if (!/[A-Z]/.test(pass)) return 'Середній (потрібна велика літера)';
    if (!/[0-9]/.test(pass)) return 'Сильний (потрібна цифра)';
    if (!/[!@#$%^&*]/.test(pass)) return 'Сильний (потрібен спецсимвол)';
    return 'Дуже сильний';
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(checkPasswordStrength(newPassword));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Определяем путь к иконке в зависимости от состояния showPassword и темы
  const passwordIconSrc = showPassword
    ? theme === 'light'
      ? '/assets/view-dark.png'
      : '/assets/view-light.png'
    : theme === 'light'
      ? '/assets/hide-dark.png'
      : '/assets/hide-light.png';

  const containerBackground = theme === 'light'
    ? '/assets/page-bg-light.png' // Путь для светлой темы
    : '/assets/page-bg-dark.png'; // Путь для темной темы

  return (
    <div className="container-registration" style={{backgroundImage: `url('${containerBackground}')`}}>
      <div className="position-container">
        <div className="form-container">
          <h2>Реєстрація</h2>
          {/* Кнопка Google, если нужна */}
          <button className="google-login">
            <img src={theme === 'light' ? '/assets/google-dark-icon.png' : '/assets/google-white-icon.png'} alt="Google icon" className="google-icon"/>
            Увійти за допомогою Google
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
          <div className="form-group">
            <input
              type="text"
              placeholder="Ім'я"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
            />
          </div>
          {/* Поле для ввода пароля */}
          <div className="form-group">
            <input
              type={showPassword ? 'text' : 'password'} // Тип поля зависит от showPassword
              placeholder="Пароль"
              value={password}
              onChange={handlePasswordChange}
              className="input-field"
            />
            {/* Иконка для переключения видимости пароля */}
            {/* Отображаем иконку только если в поле пароля что-то введено */}
            {password.length > 0 && (
              <img
                src={passwordIconSrc} // Динамический путь к иконке
                alt={showPassword ? 'Приховати пароль' : 'Показати пароль'}
                className="password-toggle"
                onClick={togglePasswordVisibility}
              />
            )}
            {/* Отображаем силу пароля только если в поле пароля что-то введено */}
            {password.length > 0 && (
               <span className="password-strength">{passwordStrength}</span>
            )}
          </div>
          {/* Поле для подтверждения пароля */}
          <div className="form-group">
            <input
              type={showPassword ? 'text' : 'password'} // Тип поля зависит от showPassword
              placeholder="Повторити пароль"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
            />
            {/* Возможно, здесь тоже нужна иконка, если ты хочешь показывать/скрывать подтверждение */}
            {/* Например, если confirmPassword.length > 0 */}
          </div>
          <button className="register-button">Зареєструватися</button>
        </div>
      </div>
    </div>
  );
};

export default Registration;